import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('favorite')
@UseGuards(JwtAuthGuard)
export class FavoriteController {
  constructor(private favService: FavoriteService) {}

  @Get()
  async getMyFavorites(@Req() req: any) {
    return this.favService.getFavoritesByUser(req.user.id);
  }

  @Post()
  async addFavorite(@Req() req: any, @Body() body: { raffleId: string }) {
    return this.favService.addFavorite(req.user.id, body.raffleId);
  }

  @Delete('/:raffleId')
  async removeFavorite(@Req() req: any, @Param('raffleId') raffleId: string) {
    return this.favService.removeFavorite(req.user.id, raffleId);
  }
}
