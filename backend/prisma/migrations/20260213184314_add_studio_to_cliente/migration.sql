/*
  Warnings:

  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `studioId` to the `Cliente` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_studioId_fkey";

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "studioId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Client";

-- CreateIndex
CREATE INDEX "Cliente_studioId_idx" ON "Cliente"("studioId");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
