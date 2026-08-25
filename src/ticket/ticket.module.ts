import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { MailModule } from '../mail/mail.module'
import { TicketController } from './ticket.controller'
import { TicketService } from './ticket.service'

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}