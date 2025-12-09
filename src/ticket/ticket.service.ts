import { Injectable } from "@nestjs/common";
import { Ticket } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TicketService {
    constructor(private prisma: PrismaService) {}
    async getTicketsByUser(userId: string) : Promise<Ticket[]> {

        const tickets = await this.prisma.ticket.findMany({
            where: { userId },
        });

        return tickets;

    }


    async createTicket(data: Ticket): Promise<Ticket> {
        const ticket = await this.prisma.ticket.create({
            data: {
                ...data,
                purchasedAt: new Date(),
            }
        });


        if(ticket.raffleId == null) {
            throw new Error("Ticket must be associated with a raffle");
        }

        const updatedRaffle = await this.prisma.raffle.update({
            where: { id: ticket.raffleId },
            data: {
                ticketsSold: { increment: 1 },
                tickets: { connect: { id: ticket.id } },
                updatedAt: new Date(),
            }
        });

        return ticket;
    }

}