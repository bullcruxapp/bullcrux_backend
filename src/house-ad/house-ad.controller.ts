import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { HouseAdService } from './house-ad.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdminGuard } from 'src/draw/admin.guard';

@Controller('house-ad')
export class HouseAdController {
  constructor(private houseAdService: HouseAdService) {}

  /** Público: la lista de videos activos, para que el frontend elija uno al azar. */
  @Get('active')
  async getActive() {
    return this.houseAdService.getActive();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async getAll() {
    return this.houseAdService.getAll();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async create(@Body('videoUrl') videoUrl: string) {
    if (!videoUrl || !videoUrl.trim()) {
      throw new BadRequestException('Falta la URL del video');
    }
    return this.houseAdService.create(videoUrl.trim());
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id/toggle')
  async toggleActive(@Param('id') id: string) {
    return this.houseAdService.toggleActive(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.houseAdService.remove(id);
  }
}
