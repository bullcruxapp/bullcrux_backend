import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
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

    @Get("/featured")
    async getFeaturedRaffle(): Promise<Raffle | null> {
        return this.raffleService.getFeaturedRaffle();
    }

    @Get("/:id")
    async getRaffleById(@Param('id') id: string): Promise<Raffle | string> {
        return this.raffleService.getRaffleById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get("/:id/participants")
    async getParticipants(@Param('id') id: string): Promise<any> {
        return this.raffleService.getParticipants(id);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post()
    async createRaffle(@Req() req: any, @Body() dto: any): Promise<Raffle | string> {
        return this.raffleService.createRaffle({ ...dto, creatorId: req.user.id });
    }

    @UseGuards(JwtAuthGuard)
    @Put("/:id")
    async updateRaffle(@Param('id') id: string, @Body() dto: any): Promise<Raffle | string> {
        return this.raffleService.updateRaffle({ ...dto, id });
    }

    @UseGuards(JwtAuthGuard)
    @Delete("/:id")
    async deleteRaffle(@Param('id') id: string): Promise<any> {
        return this.raffleService.deleteRaffle(id);
    }


}