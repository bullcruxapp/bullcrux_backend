import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Ticket, RaffleStatus, TicketSource } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';

/** Cantidad de anuncios que hay que completar para desbloquear 1 ticket gratis. */
export const AD_VIEWS_REQUIRED = 5;

@Injectable()
export class TicketService {
  constructor(private prisma: PrismaService, private mailService: MailService) {}

  async getTicketsByUser(userId: string): Promise<Ticket[]> {
    return this.prisma.ticket.findMany({
      where: { userId },
      include: { raffle: { include: { productImages: true } } },
      orderBy: { purchasedAt: 'desc' },
    });
  }

  /**
   * Compra de participaciones (PAID).
   * Se asume que el pago ya fue validado antes de llamar a esto
   * (ej: desde el webhook de MercadoPago / proveedor cripto a futuro).
   */
  async purchaseTickets(
    userId: string,
    raffleId: string,
    quantity: number,
  ): Promise<Ticket[]> {
    if (quantity < 1) {
      throw new BadRequestException('La cantidad debe ser al menos 1');
    }

    return this.prisma.$transaction(async (tx) => {
      const raffle = await tx.raffle.findUnique({ where: { id: raffleId } });
      if (!raffle) throw new NotFoundException('Sorteo no encontrado');

      if (raffle.status !== RaffleStatus.OPEN) {
        throw new ConflictException('Este sorteo ya no admite participaciones');
      }

      const available = raffle.totalTickets - raffle.ticketsSold;
      if (quantity > available) {
        throw new ConflictException(
          `Solo quedan ${available} participaciones disponibles`,
        );
      }

      const tickets: Ticket[] = [];
      const startNumber = raffle.ticketsSold + 1;

      for (let i = 0; i < quantity; i++) {
        const ticket = await tx.ticket.create({
          data: {
            raffleId,
            userId,
            number: startNumber + i,
            source: TicketSource.PAID,
          },
        });
        tickets.push(ticket);
      }

      const newTicketsSold = raffle.ticketsSold + quantity;
      const isSoldOut = newTicketsSold >= raffle.totalTickets;

      await tx.raffle.update({
        where: { id: raffleId },
        data: {
          ticketsSold: newTicketsSold,
          status: isSoldOut ? RaffleStatus.SOLD_OUT : raffle.status,
          countdownStartedAt: (!raffle.countdownStartedAt && raffle.productPriceCoins > 0 && (newTicketsSold * raffle.ticketPriceCoins) >= raffle.productPriceCoins) ? new Date() : raffle.countdownStartedAt,
          updatedAt: new Date(),
        },
      });

      return { tickets, raffleTitle: raffle.title, productName: raffle.productName };
    }).then(async ({ tickets, raffleTitle, productName }) => {
      // Mail de confirmación, fuera de la transacción para no bloquear la compra si tarda
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.email) {
        this.mailService
          .sendTicketConfirmationEmail(
            user.email,
            user.name || 'participante',
            raffleTitle,
            productName,
            tickets.map(t => t.number),
          )
          .catch(err => console.error('Error enviando mail de confirmación:', err));
      }
      return tickets;
    });
  }

  /**
   * Participación gratuita por ver 5 publicidades (AD).
   * Otorga 1 ticket. Limita a 1 ticket gratuito por usuario por sorteo.
   */
  async claimAdTicket(userId: string, raffleId: string): Promise<Ticket> {
    return this.prisma.$transaction(async (tx) => {
      const raffle = await tx.raffle.findUnique({ where: { id: raffleId } });
      if (!raffle) throw new NotFoundException('Sorteo no encontrado');

      if (raffle.status !== RaffleStatus.OPEN) {
        throw new ConflictException('Este sorteo ya no admite participaciones');
      }

      const available = raffle.totalTickets - raffle.ticketsSold;
      if (available < 1) {
        throw new ConflictException('No quedan participaciones disponibles');
      }

      const alreadyClaimed = await tx.ticket.findFirst({
        where: { userId, raffleId, source: TicketSource.AD },
      });
      if (alreadyClaimed) {
        throw new ConflictException(
          'Ya reclamaste tu participación gratuita para este sorteo',
        );
      }

      const adViewsCount = await tx.adView.count({
        where: { userId, raffleId },
      });
      if (adViewsCount < AD_VIEWS_REQUIRED) {
        throw new ConflictException(
          `Todavía te faltan ${AD_VIEWS_REQUIRED - adViewsCount} anuncios para desbloquear tu ticket gratis`,
        );
      }

      const number = raffle.ticketsSold + 1;

      const ticket = await tx.ticket.create({
        data: {
          raffleId,
          userId,
          number,
          source: TicketSource.AD,
        },
      });

      const newTicketsSold = raffle.ticketsSold + 1;
      const isSoldOut = newTicketsSold >= raffle.totalTickets;

      await tx.raffle.update({
        where: { id: raffleId },
        data: {
          ticketsSold: newTicketsSold,
          status: isSoldOut ? RaffleStatus.SOLD_OUT : raffle.status,
          countdownStartedAt: (!raffle.countdownStartedAt && raffle.productPriceCoins > 0 && (newTicketsSold * raffle.ticketPriceCoins) >= raffle.productPriceCoins) ? new Date() : raffle.countdownStartedAt,
          updatedAt: new Date(),
        },
      });

      return { ticket, raffleTitle: raffle.title, productName: raffle.productName };
    }).then(async ({ ticket, raffleTitle, productName }) => {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.email) {
        this.mailService
          .sendTicketConfirmationEmail(
            user.email,
            user.name || 'participante',
            raffleTitle,
            productName,
            [ticket.number],
          )
          .catch(err => console.error('Error enviando mail de confirmación:', err));
      }
      return ticket;
    });
  }

  /**
   * Progreso de anuncios vistos para un usuario en un sorteo puntual.
   * Usado por el frontend para mostrar "2/5 anuncios" y habilitar el botón.
   */
  async getAdProgress(userId: string, raffleId: string) {
    const [count, alreadyClaimed] = await Promise.all([
      this.prisma.adView.count({ where: { userId, raffleId } }),
      this.prisma.ticket.findFirst({
        where: { userId, raffleId, source: TicketSource.AD },
      }),
    ]);

    return {
      count: Math.min(count, AD_VIEWS_REQUIRED),
      required: AD_VIEWS_REQUIRED,
      canClaim: count >= AD_VIEWS_REQUIRED && !alreadyClaimed,
      alreadyClaimed: !!alreadyClaimed,
    };
  }

  /**
   * Registra un anuncio completado desde el postback de AdGate Media.
   * Idempotente por conversionId: si AdGate reintenta el mismo postback, no duplica.
   */
  async recordAdView(userId: string, raffleId: string, conversionId: string) {
    const existing = await this.prisma.adView.findUnique({
      where: { conversionId },
    });
    if (existing) {
      return { alreadyRecorded: true };
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const raffle = await this.prisma.raffle.findUnique({ where: { id: raffleId } });
    if (!raffle) throw new NotFoundException('Sorteo no encontrado');

    await this.prisma.adView.create({
      data: { userId, raffleId, conversionId },
    });

    return { alreadyRecorded: false };
  }
}
