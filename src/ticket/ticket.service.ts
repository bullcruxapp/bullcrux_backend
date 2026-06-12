import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Ticket, RaffleStatus, TicketSource } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TicketService {
  constructor(private prisma: PrismaService) {}

  async getTicketsByUser(userId: string): Promise<Ticket[]> {
    return this.prisma.ticket.findMany({
      where: { userId },
      include: { raffle: true },
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
          updatedAt: new Date(),
        },
      });

      return tickets;
    });
  }

  /**
   * Participación gratuita por ver una publicidad (AD).
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
          updatedAt: new Date(),
        },
      });

      return ticket;
    });
  }
}
