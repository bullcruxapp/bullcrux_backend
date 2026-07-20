import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private prisma: PrismaService) {}

  async getFavoritesByUser(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        raffle: {
          include: { productImages: true, winner: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addFavorite(userId: string, raffleId: string) {
    return this.prisma.favorite.upsert({
      where: { userId_raffleId: { userId, raffleId } },
      create: { userId, raffleId },
      update: {}
    });
  }

  async removeFavorite(userId: string, raffleId: string) {
    return this.prisma.favorite.deleteMany({
      where: { userId, raffleId }
    });
  }
}
