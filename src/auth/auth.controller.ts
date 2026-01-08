import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { ExternalLoginDto } from './dto/externalLogin.dto'


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @HttpCode(HttpStatus.OK)
  @Post('external-login')
  async externalLogin(@Body() dto: ExternalLoginDto) {
    // Placeholder for external login logic
    return this.authService.externalLogin(dto)
  }

}