import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { User } from '@prisma/client'

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findUserById(id: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                raffles: true,        // Sorteos creados
                tickets: {
                    include: {
                        raffle: true,     // Incluye también los sorteos donde compró tickets
                    },
                },
                transactions: true,   // Movimientos de coins
            },
        })

        if (!user) throw new NotFoundException('Usuario no encontrado')
        return user
    }

    async findUserByEmail(email: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                raffles: true,        // Sorteos creados
                tickets: {
                    include: {
                        raffle: true,     // Incluye también los sorteos donde compró tickets
                    },
                },
                transactions: true,   // Movimientos de coins
            },
        })

        if (!user) throw new NotFoundException('Usuario no encontrado')
        return user
    }

    async updatePhone(userId: string, phone: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { phone }
        });
    }
}
