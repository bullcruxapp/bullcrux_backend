import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { MailModule } from '../mail/mail.module'
import { RaffleController } from './raffle.controller'
import { RaffleService } from './raffle.service'

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [RaffleController],
  providers: [RaffleService],
  exports: [RaffleService],
})
export class RaffleModule {}