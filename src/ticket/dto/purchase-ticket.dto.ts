import { IsInt, IsString, IsNotEmpty, Min, Max } from 'class-validator';

export class PurchaseTicketDto {
  @IsString()
  @IsNotEmpty()
  raffleId: string;

  @IsInt()
  @Min(1)
  @Max(100)
  quantity: number;
}
