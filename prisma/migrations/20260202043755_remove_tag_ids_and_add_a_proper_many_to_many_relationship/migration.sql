/*
  Warnings:

  - You are about to drop the column `tagIds` on the `Ponysona` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ponysona" DROP COLUMN "tagIds";

-- CreateTable
CREATE TABLE "_TagName" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TagName_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TagName_B_index" ON "_TagName"("B");

-- AddForeignKey
ALTER TABLE "_TagName" ADD CONSTRAINT "_TagName_A_fkey" FOREIGN KEY ("A") REFERENCES "Ponysona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagName" ADD CONSTRAINT "_TagName_B_fkey" FOREIGN KEY ("B") REFERENCES "PonysonaTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
