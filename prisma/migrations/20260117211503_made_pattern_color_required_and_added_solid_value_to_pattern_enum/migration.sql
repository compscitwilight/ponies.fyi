/*
  Warnings:

  - Made the column `pattern` on table `PonysonaAppearanceAttribute` required. This step will fail if there are existing NULL values in that column.
  - Made the column `color` on table `PonysonaAppearanceAttribute` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "Pattern" ADD VALUE 'solid';

-- AlterTable
ALTER TABLE "PonysonaAppearanceAttribute" ALTER COLUMN "pattern" SET NOT NULL,
ALTER COLUMN "color" SET NOT NULL,
ALTER COLUMN "color" SET DEFAULT '#000000';
