import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DrawService } from './draw.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';

@Controller('draw')
export class DrawController {
  constructor(private drawService: DrawService) {}

  // POST /draw/:raffleId — ejecutar sorteo (solo admin)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':raffleId')
  async executeDraw(@Param('raffleId') raffleId: string) {
    return this.drawService.executeDraw(raffleId);
  }

  // GET /draw/:raffleId — ver resultado del sorteo (público)
  @Get(':raffleId')
  async getDrawResult(@Param('raffleId') raffleId: string) {
    return this.drawService.getDrawResult(raffleId);
  }
}
