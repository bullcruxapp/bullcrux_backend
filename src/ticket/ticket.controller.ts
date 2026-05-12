import { Body, Controller, Get, Post, Put, Query, UseGuards } from "@nestjs/common";
import { Ticket } from "@prisma/client";
import { TicketService } from "./ticket.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CreateTicketDto } from "src/auth/dto/create-ticket.dto";

@Controller('ticket')

export class TicketController {
    constructor(private ticketService: TicketService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getTicketsByUser(@Query('id') id: string): Promise<Ticket[]> {
        return this.ticketService.getTicketsByUser(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('create')
    async createTicket(@Body() data: CreateTicketDto) {
        return this.ticketService.createTicket(data);
    }

}
