-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('friends', 'siblings', 'parent_child', 'enemies');

-- CreateEnum
CREATE TYPE "RelationshipDirection" AS ENUM ('AB', 'BA');

-- CreateTable
CREATE TABLE "PonysonaRelationship" (
    "id" SERIAL NOT NULL,
    "type" "RelationshipType" NOT NULL,
    "direction" "RelationshipDirection",
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PonysonaRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_relationships" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_relationships_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_relationships_B_index" ON "_relationships"("B");

-- AddForeignKey
ALTER TABLE "_relationships" ADD CONSTRAINT "_relationships_A_fkey" FOREIGN KEY ("A") REFERENCES "Ponysona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_relationships" ADD CONSTRAINT "_relationships_B_fkey" FOREIGN KEY ("B") REFERENCES "PonysonaRelationship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
