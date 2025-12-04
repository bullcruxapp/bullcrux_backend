import { TransactionType } from "@prisma/client"
import { UserEntity } from "src/users/users.entity"

export class TransactionEntity {
  id: string
  userId: string
  user?: UserEntity
  type: TransactionType
  amount: number
  description?: string | null
  createdAt: Date
}