/*
  Warnings:

  - You are about to drop the column `color` on the `PonysonaAppearanceAttribute` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ponysonaId,bodyPart]` on the table `PonysonaAppearanceAttribute` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PonysonaAppearanceAttribute_ponysonaId_bodyPart_color_patte_key";

-- AlterTable
ALTER TABLE "PonysonaAppearanceAttribute" DROP COLUMN "color",
ADD COLUMN     "colors" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "PonysonaAppearanceAttribute_ponysonaId_bodyPart_key" ON "PonysonaAppearanceAttribute"("ponysonaId", "bodyPart");
