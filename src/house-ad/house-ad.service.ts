import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HouseAdService {
  constructor(private prisma: PrismaService) {}

  async getActive() {
    return this.prisma.houseAd.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAll() {
    return this.prisma.houseAd.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(videoUrl: string) {
    return this.prisma.houseAd.create({
      data: { videoUrl },
    });
  }

  async toggleActive(id: string) {
    const ad = await this.prisma.houseAd.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Anuncio no encontrado');
    return this.prisma.houseAd.update({
      where: { id },
      data: { active: !ad.active },
    });
  }

  async remove(id: string) {
    return this.prisma.houseAd.delete({ where: { id } });
  }
}
