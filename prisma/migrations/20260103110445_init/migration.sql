-- CreateEnum
CREATE TYPE "PonysonaStatus" AS ENUM ('Pending', 'Approved', 'Hidden');

-- CreateEnum
CREATE TYPE "BodyPart" AS ENUM ('mane', 'tail', 'coat', 'wings', 'horn', 'eyes');

-- CreateEnum
CREATE TYPE "Color" AS ENUM ('black', 'white', 'gray', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink');

-- CreateEnum
CREATE TYPE "ColorTone" AS ENUM ('light', 'dark', 'pale', 'bright');

-- CreateEnum
CREATE TYPE "Pattern" AS ENUM ('striped', 'streak', 'spotted');

-- CreateTable
CREATE TABLE "Ponysona" (
    "id" TEXT NOT NULL,
    "primaryName" TEXT NOT NULL,
    "otherNames" TEXT[],
    "description" TEXT,
    "status" "PonysonaStatus" NOT NULL DEFAULT 'Pending',
    "tags" TEXT[],
    "sources" TEXT[],
    "creators" TEXT[],
    "colorsHex" TEXT[],
    "colorsName" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ponysona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PonysonaAppearanceAttribute" (
    "id" TEXT NOT NULL,
    "ponysonaId" TEXT NOT NULL,
    "bodyPart" "BodyPart" NOT NULL,
    "color" "Color",
    "colorTone" "ColorTone",
    "pattern" "Pattern",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PonysonaAppearanceAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PonysonaRevision" (
    "id" TEXT NOT NULL,
    "ponysonaId" TEXT NOT NULL,
    "diff" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PonysonaRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PonysonaAppearanceAttribute_ponysonaId_bodyPart_color_color_key" ON "PonysonaAppearanceAttribute"("ponysonaId", "bodyPart", "color", "colorTone", "pattern");

-- AddForeignKey
ALTER TABLE "PonysonaAppearanceAttribute" ADD CONSTRAINT "PonysonaAppearanceAttribute_ponysonaId_fkey" FOREIGN KEY ("ponysonaId") REFERENCES "Ponysona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PonysonaRevision" ADD CONSTRAINT "PonysonaRevision_ponysonaId_fkey" FOREIGN KEY ("ponysonaId") REFERENCES "Ponysona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
