import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { User } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(
        @Query('id') id?: string,
        @Query('email') email?: string,
    ): Promise<User> {
        if (id) {
            return this.usersService.findUserById(id)
        } else if (email) {
            return this.usersService.findUserByEmail(email)
        } else {
            throw new Error('Debes enviar un id o un email como parámetro')
        }
    }
}
