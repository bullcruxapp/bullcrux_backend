import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { RaffleStatus, TransactionType, TransactionStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DrawService {
  constructor(private prisma: PrismaService) {}

  /**
   * Ejecuta el sorteo de una raffle.
   * Solo puede ser llamado por un admin (verificado en el controller).
   * La raffle puede estar OPEN o SOLD_OUT — si está OPEN se sortea entre los tickets emitidos hasta ese momento.
   */
  async executeDraw(raffleId: string): Promise<{
    winnerId: string;
    winnerEmail: string;
    winningTicketNumber: number;
  }> {
    return this.prisma.$transaction(async (tx) => {
      const raffle = await tx.raffle.findUnique({
        where: { id: raffleId },
        include: { tickets: true },
      });

      if (!raffle) throw new NotFoundException('Sorteo no encontrado');

      if (raffle.status === RaffleStatus.DRAWN) {
        throw new ConflictException('Este sorteo ya fue realizado');
      }

      if (raffle.tickets.length === 0) {
        throw new ConflictException('No hay participantes en este sorteo');
      }

      // Elegir un ticket ganador al azar
      const randomIndex = Math.floor(Math.random() * raffle.tickets.length);
      const winningTicket = raffle.tickets[randomIndex];

      // Actualizar la raffle con el ganador
      await tx.raffle.update({
        where: { id: raffleId },
        data: {
          winnerId: winningTicket.userId,
          drawnAt: new Date(),
          status: RaffleStatus.DRAWN,
        },
      });

      // Registrar transacción WIN para el ganador
      await tx.transaction.create({
        data: {
          userId: winningTicket.userId,
          type: TransactionType.WIN,
          status: TransactionStatus.APPROVED,
          amount: 0,
          description: `Ganador del sorteo: ${raffle.productName} — Ticket #${winningTicket.number}`,
          raffleId: raffle.id,
        },
      });

      // Obtener datos del ganador para la respuesta
      const winner = await tx.user.findUnique({
        where: { id: winningTicket.userId },
        select: { id: true, email: true, name: true },
      });

      return {
        winnerId: winner!.id,
        winnerEmail: winner!.email,
        winningTicketNumber: winningTicket.number,
      };
    });
  }

  /**
   * Devuelve el resultado de un sorteo ya realizado.
   */
  async getDrawResult(raffleId: string) {
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
      include: {
        winner: { select: { id: true, name: true, email: true } },
      },
    });

    if (!raffle) throw new NotFoundException('Sorteo no encontrado');
    if (raffle.status !== RaffleStatus.DRAWN) {
      throw new ConflictException('Este sorteo todavía no fue realizado');
    }

    return {
      raffleId: raffle.id,
      productName: raffle.productName,
      drawnAt: raffle.drawnAt,
      winner: raffle.winner,
    };
  }
}
