import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    async register(dto: { email: string; password: string; name?: string }) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
        if (existing) {
            throw new BadRequestException('El email ya está registrado')
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10)

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                name: dto.name,
            },
        })

        return {
            message: 'Usuario registrado correctamente',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        }
    }

    async login(dto: { email: string; password: string }) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
        if (!user) throw new UnauthorizedException('Credenciales inválidas')

        const isPasswordValid = await bcrypt.compare(dto.password, user.password)
        if (!isPasswordValid) throw new UnauthorizedException('Credenciales inválidas')

        const token = jwt.sign(
            { sub: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        )

        return {
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        }
    }
}