import { BadRequestException, Injectable } from "@nestjs/common";
import { Ticket } from "@prisma/client";
import { CreateTicketDto } from "src/auth/dto/create-ticket.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TicketService {
    constructor(private prisma: PrismaService) { }
    async getTicketsByUser(userId: string): Promise<Ticket[]> {

        const tickets = await this.prisma.ticket.findMany({
            where: { userId },
        });

        return tickets;

    }


    async createTicket(data: CreateTicketDto): Promise<Ticket[]> {
        const quantity = data.quantity || 1;

        const user = await this.prisma.user.findUnique({
            where: { id: data.userId },
        });

        const raffle = await this.prisma.raffle.findUnique({
            where: { id: data.raffleId },
        });

        if (user?.balanceCoins == null || user.balanceCoins < (raffle?.ticketPriceCoins * quantity)) {
            throw new BadRequestException("Saldo insuficiente para comprar los tickets");
        }

        const tickets = await Promise.all(
            Array.from({ length: quantity }).map(() =>
                this.prisma.ticket.create({
                    data: {
                        raffleId: data.raffleId,  // 👈 Solo los campos que existen en Prisma
                        userId: data.userId,
                        purchasedAt: new Date(),
                    }
                })
            )
        );

        await this.prisma.raffle.update({
            where: { id: data.raffleId },
            data: {
                ticketsSold: { increment: quantity },
                tickets: { connect: tickets.map(t => ({ id: t.id })) },
                updatedAt: new Date(),
            }
        });

        await this.prisma.user.update({
            where: { id: data.userId },
            data: {
                balanceCoins: { decrement: (raffle?.ticketPriceCoins || 0) * quantity },
                tickets: { connect: tickets.map(t => ({ id: t.id })) },
                updatedAt: new Date(),
            }
        });

        return tickets;
    }

}