import { RaffleEntity } from "src/raffle/raffle.entity"
import { TicketEntity } from "src/ticket/ticket.entity"
import { TransactionEntity } from "src/transaction/transaction.entity"

export class UserEntity {
  id: string
  name?: string | null
  email: string
  password?: string | null
  googleId?: string | null
  balanceCoins: number

  raffles?: RaffleEntity[]
  tickets?: TicketEntity[]
  transactions?: TransactionEntity[]
  rafflesWon?: RaffleEntity[]

  createdAt: Date
  updatedAt: Date
}