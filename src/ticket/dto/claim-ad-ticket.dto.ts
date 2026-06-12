import { IsString, IsNotEmpty } from 'class-validator';

export class ClaimAdTicketDto {
  @IsString()
  @IsNotEmpty()
  raffleId: string;
}
