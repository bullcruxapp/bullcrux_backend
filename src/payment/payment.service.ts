import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { TransactionStatus, TransactionType, RaffleStatus } from '@prisma/client';
import { Payment, Preference } from 'mercadopago';
import { mpClient } from 'src/mercadopago.config';
import { PrismaService } from 'src/prisma/prisma.service';
import { TicketService } from 'src/ticket/ticket.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private ticketService: TicketService,
  ) {}

  /**
   * Crea una preferencia de pago en MercadoPago para comprar N participaciones
   * de una rifa. El monto se calcula como ticketPriceCoins (precio en ARS) * quantity.
   */
  async createPreference(userId: string, raffleId: string, quantity: number) {
    if (quantity < 1) {
      throw new BadRequestException('La cantidad debe ser al menos 1');
    }

    const raffle = await this.prisma.raffle.findUnique({ where: { id: raffleId } });
    if (!raffle) throw new NotFoundException('Sorteo no encontrado');

    if (raffle.status !== RaffleStatus.OPEN) {
      throw new ConflictException('Este sorteo ya no admite participaciones');
    }

    const available = raffle.totalTickets - raffle.ticketsSold;
    if (quantity > available) {
      throw new ConflictException(`Solo quedan ${available} participaciones disponibles`);
    }

    const amount = raffle.ticketPriceCoins * quantity;

    // Transacción pendiente: queda "reservado" el pedido hasta que MercadoPago confirme el pago
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        type: TransactionType.DEPOSIT,
        amount,
        description: `${quantity}x participación(es) - ${raffle.productName}`,
        status: TransactionStatus.PENDING,
        raffleId: raffle.id,
        ticketQuantity: quantity,
      },
    });

    const preference = new Preference(mpClient);

    const result = await preference.create({
      body: {
        items: [
          {
            id: raffle.id,
            title: `${raffle.productName} - ${quantity} participación(es)`,
            quantity: 1,
            unit_price: amount,
            currency_id: 'ARS',
          },
        ],
        back_urls: {
          success: process.env.URL_FRONTEND + '/cartera',
          failure: process.env.URL_FRONTEND + '/payments/failure',
          pending: process.env.URL_FRONTEND + '/payments/pending',
        },
        auto_return: 'approved',
        notification_url: process.env.URL_BACKEND + '/payments/webhook',
        external_reference: transaction.id,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expira en 24 horas
      },
    });

    return result;
  }

  async validatePayment(paymentId: string) {
    const payment = new Payment(mpClient);
    return payment.get({ id: paymentId });
  }

  /**
   * Se llama cuando MercadoPago confirma que un pago fue aprobado.
   * Marca la transacción como APPROVED y genera los tickets correspondientes.
   * Es idempotente: si la transacción ya estaba APPROVED, no vuelve a generar tickets.
   */
  async confirmPayment(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction) throw new NotFoundException('Transacción no encontrada');

    if (transaction.status === TransactionStatus.APPROVED) {
      // Ya fue procesada antes (MercadoPago puede reenviar el webhook)
      return { alreadyProcessed: true, transaction };
    }

    if (!transaction.raffleId || !transaction.ticketQuantity) {
      throw new BadRequestException('La transacción no tiene datos de sorteo asociados');
    }

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.APPROVED },
    });

    await this.prisma.user.update({
      where: { id: transaction.userId },
      data: { balanceCoins: { increment: transaction.amount } },
    });

    const tickets = await this.ticketService.purchaseTickets(
      transaction.userId,
      transaction.raffleId,
      transaction.ticketQuantity,
    );

    return { alreadyProcessed: false, transaction: updatedTransaction, tickets };
  }

  async markTransaction(transactionId: string, status: TransactionStatus) {
    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status },
    });
  }
}
