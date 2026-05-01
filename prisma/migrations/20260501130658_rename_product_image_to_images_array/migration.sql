/*
  Warnings:

  - You are about to drop the column `productImage` on the `Raffle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Raffle" DROP COLUMN "productImage";

-- CreateTable
CREATE TABLE "RaffleImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "raffleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RaffleImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RaffleImage" ADD CONSTRAINT "RaffleImage_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "Raffle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
