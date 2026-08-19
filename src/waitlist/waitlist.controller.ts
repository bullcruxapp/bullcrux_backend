import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdminGuard } from 'src/draw/admin.guard';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Controller('waitlist')
export class WaitlistController {
  constructor(private waitlistService: WaitlistService) {}

  /** Público: cualquiera puede anotarse dejando su mail. */
  @Post('join')
  async join(@Body('email') email: string) {
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      throw new BadRequestException('Ingresá un email válido');
    }
    return this.waitlistService.join(email);
  }

  /** Solo admin: ver la lista completa de mails anotados. */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async getAll() {
    return this.waitlistService.getAll();
  }
}
