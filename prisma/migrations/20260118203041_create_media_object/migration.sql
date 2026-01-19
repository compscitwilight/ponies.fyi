-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('preview', 'mark', 'gallery');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('pending', 'uploaded', 'finalized');

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "ponysonaId" TEXT,
    "type" "MediaType" NOT NULL DEFAULT 'gallery',
    "status" "MediaStatus" NOT NULL DEFAULT 'pending',
    "size" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_ponysonaId_fkey" FOREIGN KEY ("ponysonaId") REFERENCES "Ponysona"("id") ON DELETE SET NULL ON UPDATE CASCADE;
