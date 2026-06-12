import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Ticket } from '@prisma/client';
import { TicketService } from './ticket.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';
import { ClaimAdTicketDto } from './dto/claim-ad-ticket.dto';

@Controller('ticket')
export class TicketController {
  constructor(private ticketService: TicketService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyTickets(@Req() req: any): Promise<Ticket[]> {
    return this.ticketService.getTicketsByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('purchase')
  async purchase(
    @Req() req: any,
    @Body() dto: PurchaseTicketDto,
  ): Promise<Ticket[]> {
    return this.ticketService.purchaseTickets(
      req.user.id,
      dto.raffleId,
      dto.quantity,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('claim-ad')
  async claimAd(
    @Req() req: any,
    @Body() dto: ClaimAdTicketDto,
  ): Promise<Ticket> {
    return this.ticketService.claimAdTicket(req.user.id, dto.raffleId);
  }
}
