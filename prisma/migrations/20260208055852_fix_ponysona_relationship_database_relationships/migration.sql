/*
  Warnings:

  - You are about to drop the column `ponysonaA` on the `PonysonaRelationship` table. All the data in the column will be lost.
  - You are about to drop the column `ponysonaB` on the `PonysonaRelationship` table. All the data in the column will be lost.
  - You are about to drop the `_relationships` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ponysonaAId` to the `PonysonaRelationship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ponysonaBId` to the `PonysonaRelationship` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_relationships" DROP CONSTRAINT "_relationships_A_fkey";

-- DropForeignKey
ALTER TABLE "_relationships" DROP CONSTRAINT "_relationships_B_fkey";

-- AlterTable
ALTER TABLE "PonysonaRelationship" DROP COLUMN "ponysonaA",
DROP COLUMN "ponysonaB",
ADD COLUMN     "ponysonaAId" TEXT NOT NULL,
ADD COLUMN     "ponysonaBId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_relationships";

-- AddForeignKey
ALTER TABLE "PonysonaRelationship" ADD CONSTRAINT "PonysonaRelationship_ponysonaAId_fkey" FOREIGN KEY ("ponysonaAId") REFERENCES "Ponysona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PonysonaRelationship" ADD CONSTRAINT "PonysonaRelationship_ponysonaBId_fkey" FOREIGN KEY ("ponysonaBId") REFERENCES "Ponysona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
