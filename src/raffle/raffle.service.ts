import { Injectable, NotFoundException } from "@nestjs/common";
import { Raffle, RaffleStatus } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class RaffleService {
    constructor(private prisma: PrismaService) { }

    async getOpenRaffles(): Promise<Raffle[]> {
        const raffles = await this.prisma.raffle.findMany({
            where: { status: RaffleStatus.OPEN },
            include: {
                productImages: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        return raffles;
    }

    async createRaffle(data: Raffle): Promise<Raffle> {
        const raffle = await this.prisma.raffle.create({
            data: {
                ...data,
                ticketPriceCoins: Number(data.ticketPriceCoins),
                totalTickets: Number(data.totalTickets),
                updatedAt: new Date(),
            }
        });
        return raffle;
    }

    async updateRaffle(data: Raffle): Promise<Raffle> {
        const raffle = await this.prisma.raffle.update({
            where: { id: data.id },
            data: {
                ...data,
                ticketPriceCoins: Number(data.ticketPriceCoins),
                totalTickets: Number(data.totalTickets),
                updatedAt: new Date(),
            }
        });
        return raffle;
    }

    async getRaffleById(id: string): Promise<Raffle> {
        const raffle = await this.prisma.raffle.findUnique({
            where: { id },
            include: {
                productImages: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!raffle) {
            throw new NotFoundException(`Raffle ${id} no encontrada`);
        }

        return raffle;
    }

}