import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
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
  @Get('ad-progress/:raffleId')
  async getAdProgress(@Req() req: any, @Param('raffleId') raffleId: string) {
    return this.ticketService.getAdProgress(req.user.id, raffleId);
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

  /**
   * Postback público de AdGate Media. Server-to-server: no lleva JWT,
   * se valida con un secret propio que solo vos y AdGate conocen.
   * URL a configurar en el dashboard de AdGate:
   * https://TU_BACKEND/ticket/adgate-postback?secret=TU_SECRET&conversion_id={conversion_id}&user_id={s1}&raffle_id={s2}
   */
  @Get('adgate-postback')
  async adgatePostback(
    @Query('secret') secret: string,
    @Query('conversion_id') conversionId: string,
    @Query('user_id') userId: string,
    @Query('raffle_id') raffleId: string,
  ) {
    if (!process.env.ADGATE_POSTBACK_SECRET || secret !== process.env.ADGATE_POSTBACK_SECRET) {
      throw new ForbiddenException('Secret inválido');
    }
    if (!conversionId || !userId || !raffleId) {
      throw new ForbiddenException('Faltan parámetros');
    }

    return this.ticketService.recordAdView(userId, raffleId, conversionId);
  }
}
