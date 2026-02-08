/*
  Warnings:

  - Added the required column `ponysonaA` to the `PonysonaRelationship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ponysonaB` to the `PonysonaRelationship` table without a default value. This is not possible if the table is not empty.
  - Made the column `direction` on table `PonysonaRelationship` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PonysonaRelationship" ADD COLUMN     "ponysonaA" TEXT NOT NULL,
ADD COLUMN     "ponysonaB" TEXT NOT NULL,
ALTER COLUMN "direction" SET NOT NULL,
ALTER COLUMN "direction" SET DEFAULT 'AB';
