import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common'
import { RaffleService } from './raffle.service'
import { Raffle } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('raffle')
export class RaffleController {
    constructor(private raffleService: RaffleService) { }

    @Get()
    async getRaffles(): Promise<Raffle[] | string> {
        return this.raffleService.getOpenRaffles();
    }

    @Get("/:id")
    async getRaffleById(@Param('id') id: string): Promise<Raffle | string> {
        return this.raffleService.getRaffleById(id);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post()
    async createRaffle(@Body() dto: Raffle ): Promise<Raffle | string> {
        return this.raffleService.createRaffle(dto);
    }

    @Put("/:id")
    async updateRaffle(@Body() dto: Raffle): Promise<Raffle | string> {
        return this.raffleService.updateRaffle(dto);
    }


}