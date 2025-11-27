import { RaffleStatus } from "@prisma/client"
import { TicketEntity } from "src/ticket/ticket.entity"
import { UserEntity } from "src/users/users.entity"

export class RaffleEntity {
  id: string
  title: string
  description?: string | null
  productName: string
  productImage?: string | null
  ticketPriceCoins: number
  totalTickets: number
  ticketsSold: number
  status: RaffleStatus

  creatorId: string
  creator?: UserEntity
  tickets?: TicketEntity[]
  winnerId?: string | null
  winner?: UserEntity | null

  createdAt: Date
  updatedAt: Date
}