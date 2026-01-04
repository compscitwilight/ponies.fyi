/*
  Warnings:

  - You are about to drop the column `tags` on the `Ponysona` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TagType" AS ENUM ('species', 'form', 'role', 'setting', 'genre', 'trait');

-- AlterTable
ALTER TABLE "Ponysona" DROP COLUMN "tags",
ADD COLUMN     "tagIds" INTEGER[];

-- CreateTable
CREATE TABLE "PonysonaTag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TagType" NOT NULL,

    CONSTRAINT "PonysonaTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PonysonaTag_name_key" ON "PonysonaTag"("name");
