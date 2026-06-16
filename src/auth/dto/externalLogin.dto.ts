import { IsEmail, IsOptional, IsString } from 'class-validator';

export class ExternalLoginDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsOptional()
  @IsString()
  facebookId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  surName?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
