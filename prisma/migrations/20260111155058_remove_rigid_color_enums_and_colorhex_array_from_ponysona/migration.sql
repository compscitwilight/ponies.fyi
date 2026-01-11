/*
  Warnings:

  - You are about to drop the column `colorsHex` on the `Ponysona` table. All the data in the column will be lost.
  - You are about to drop the column `colorTone` on the `PonysonaAppearanceAttribute` table. All the data in the column will be lost.
  - The `color` column on the `PonysonaAppearanceAttribute` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[ponysonaId,bodyPart,color,pattern]` on the table `PonysonaAppearanceAttribute` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PonysonaAppearanceAttribute_ponysonaId_bodyPart_color_color_key";

-- AlterTable
ALTER TABLE "Ponysona" DROP COLUMN "colorsHex";

-- AlterTable
ALTER TABLE "PonysonaAppearanceAttribute" DROP COLUMN "colorTone",
DROP COLUMN "color",
ADD COLUMN     "color" TEXT;

-- DropEnum
DROP TYPE "Color";

-- DropEnum
DROP TYPE "ColorTone";

-- CreateIndex
CREATE UNIQUE INDEX "PonysonaAppearanceAttribute_ponysonaId_bodyPart_color_patte_key" ON "PonysonaAppearanceAttribute"("ponysonaId", "bodyPart", "color", "pattern");
