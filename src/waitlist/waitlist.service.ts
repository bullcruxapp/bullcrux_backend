import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WaitlistService {
  constructor(private prisma: PrismaService) {}

  async join(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await this.prisma.waitlistEntry.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      // No es un error real para el usuario: ya está anotado, lo tratamos como éxito.
      return { alreadyJoined: true };
    }

    await this.prisma.waitlistEntry.create({
      data: { email: normalizedEmail },
    });

    return { alreadyJoined: false };
  }

  async getAll() {
    return this.prisma.waitlistEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async count() {
    return this.prisma.waitlistEntry.count();
  }
}
