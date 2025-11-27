import { RaffleEntity } from "src/raffle/raffle.entity"
import { UserEntity } from "src/users/users.entity"

export class TicketEntity {
  id: string
  raffleId: string
  userId: string
  raffle?: RaffleEntity
  user?: UserEntity
  purchasedAt: Date
}