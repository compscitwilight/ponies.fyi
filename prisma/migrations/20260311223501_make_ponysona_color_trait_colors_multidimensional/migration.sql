/*
  Warnings:

  - You are about to drop the column `color` on the `PonysonaColorTraits` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ponysonaId,part]` on the table `PonysonaColorTraits` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PonysonaColorTraits_ponysonaId_part_color_key";

-- AlterTable
ALTER TABLE "PonysonaColorTraits" DROP COLUMN "color",
ADD COLUMN     "colors" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "PonysonaColorTraits_ponysonaId_part_key" ON "PonysonaColorTraits"("ponysonaId", "part");
