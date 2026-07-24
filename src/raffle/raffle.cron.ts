import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { RaffleService } from './raffle.service';

@Injectable()
export class RaffleCron {
  private readonly logger = new Logger(RaffleCron.name);
  private readonly COUNTDOWN_HOURS = 10;

  constructor(
    private prisma: PrismaService,
    private raffleService: RaffleService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkExpiredCountdowns() {
    const cutoff = new Date(Date.now() - this.COUNTDOWN_HOURS * 60 * 60 * 1000);

    const expiredRaffles = await this.prisma.raffle.findMany({
      where: {
        status: { in: ['OPEN', 'SOLD_OUT'] as any },
        countdownStartedAt: { lte: cutoff },
        winnerId: null,
      },
    });

    for (const raffle of expiredRaffles) {
      try {
        this.logger.log(`Sorteando automáticamente: ${raffle.title}`);
        await this.raffleService.drawWinner(raffle.id);
      } catch (err) {
        this.logger.error(`Error sorteando ${raffle.id}: ${err.message}`);
      }
    }
  }
}
