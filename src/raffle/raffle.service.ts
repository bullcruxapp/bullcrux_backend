import { Injectable } from "@nestjs/common";
import { Raffle, RaffleStatus } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class RaffleService {
    constructor(private prisma: PrismaService) {}

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

    async updateRaffle(data: Raffle): Promise<Raffle> {
        const raffle = await this.prisma.raffle.update({
            where: { id: data.id },
            data: {
                ...data,
                updatedAt: new Date(),
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