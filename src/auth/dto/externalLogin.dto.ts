import { IsEmail, IsNotEmpty } from 'class-validator';

export class ExternalLoginDto {
  @IsEmail()
  email: string

  googleId?: string
  facebookId?: string

  name?: string
  surName?: string

  @IsNotEmpty()
  password: string
}