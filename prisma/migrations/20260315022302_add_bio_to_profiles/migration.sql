/*
  Warnings:

  - You are about to alter the column `alias` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "bio" VARCHAR(5000),
ALTER COLUMN "alias" SET DATA TYPE VARCHAR(30);
