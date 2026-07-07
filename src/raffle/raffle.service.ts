import { Injectable } from "@nestjs/common";
import { Raffle, RaffleStatus } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class RaffleService {
    constructor(private prisma: PrismaService) {}

    async drawWinner(raffleId: string) {
        const raffle = await this.prisma.raffle.findUnique({ where: { id: raffleId } });
        if (!raffle) throw new Error('Sorteo no encontrado');
        if (raffle.winnerId) throw new Error('Este sorteo ya tiene ganador');

        const tickets = await this.prisma.ticket.findMany({
            where: { raffleId },
            include: { user: { select: { id: true, name: true, email: true } } }
        });

        if (tickets.length === 0) throw new Error('No hay participantes en este sorteo');

        const winningTicket = tickets[Math.floor(Math.random() * tickets.length)];

        const updated = await this.prisma.raffle.update({
            where: { id: raffleId },
            data: {
                winnerId: winningTicket.userId,
                drawnAt: new Date(),
                status: 'FINISHED' as any,
            },
            include: {
                winner: { select: { id: true, name: true, email: true } }
            }
        });

        return {
            raffle: updated,
            winningTicket: {
                number: winningTicket.number,
                user: winningTicket.user
            }
        };
    }

    async getParticipants(raffleId: string) {
        const tickets = await this.prisma.ticket.findMany({
            where: { raffleId },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { number: 'asc' }
        });
        return tickets;
    }

    async getFeaturedRaffle(): Promise<Raffle | null> {
        return this.prisma.raffle.findFirst({
            where: { status: RaffleStatus.OPEN, featured: true },
            include: { productImages: true },
        });
    }

        async getOpenRaffles(): Promise<Raffle[]> {
        const raffles = await this.prisma.raffle.findMany({
            where: { status:RaffleStatus.OPEN },
            include: { productImages: true },
        });

        return raffles;
    }

    async createRaffle(data: Raffle): Promise<Raffle> {
        const { productImages, ...rest } = data as any;
        const raffle = await this.prisma.raffle.create({
            data: {
                ...rest,
                updatedAt: new Date(),
                ...(productImages && productImages.length > 0 ? {
                    productImages: {
                        create: productImages.map((img: any) => ({
                            url: img.url,
                            order: img.order || 0,
                        }))
                    }
                } : {})
            }
        });
        return raffle;
    }

    async updateRaffle(data: any): Promise<Raffle> {
        const { productImages, id, createdAt, tickets, creator, winner, ...rest } = data;
        const raffle = await this.prisma.raffle.update({
            where: { id },
            data: {
                ...rest,
                updatedAt: new Date(),
                ...(productImages && productImages.length > 0 ? {
                    productImages: {
                        deleteMany: {},
                        create: productImages.map((img: any) => ({
                            url: img.url,
                            order: img.order || 0,
                        }))
                    }
                } : {})
            }
        });
        return raffle;
    }

    async deleteRaffle(id: string): Promise<any> {
        return this.prisma.raffle.delete({ where: { id } });
    }

    async getRaffleById(id: string): Promise<Raffle> {
        console.log('getRaffleById called with id:', id, typeof id);
        const raffle = await this.prisma.raffle.findUnique({
            where: { id: String(id) },
            include: { productImages: true, winner: true },
        });
        return raffle;
    }
    
}