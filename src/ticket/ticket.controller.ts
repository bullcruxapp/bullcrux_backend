import { Controller, Get, Put, Query, UseGuards } from "@nestjs/common";
import { Ticket } from "@prisma/client";
import { TicketService } from "./ticket.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Controller('ticket')

export class TicketController {
    constructor(private ticketService: TicketService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async getTicketsByUser(@Query('id') id: string): Promise<Ticket[]> {
        return this.ticketService.getTicketsByUser(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('create')
    async createTicket(
        @Query('userId') userId: string,
        @Query('raffleId') raffleId: string
    ): Promise<Ticket> {
        const ticketData: Ticket = {
            id: '',
            userId,
            raffleId,
            purchasedAt: new Date(),
        };
        return this.ticketService.createTicket(ticketData);
    }
}
