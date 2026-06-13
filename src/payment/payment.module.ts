import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { TicketModule } from '../ticket/ticket.module'
import { PaymentsController } from './payment.controller'
import { PaymentsService } from './payment.service'

@Module({
  imports: [PrismaModule, TicketModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
