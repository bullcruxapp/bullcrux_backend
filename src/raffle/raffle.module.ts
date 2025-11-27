import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { RaffleController } from './raffle.controller'
import { RaffleService } from './raffle.service'

@Module({
  imports: [PrismaModule],
  controllers: [RaffleController],
  providers: [RaffleService],
  exports: [RaffleService],
})
export class RaffleModule {}