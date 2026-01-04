-- AlterTable
ALTER TABLE "Ponysona" ADD COLUMN     "originalId" TEXT;

-- AddForeignKey
ALTER TABLE "Ponysona" ADD CONSTRAINT "Ponysona_originalId_fkey" FOREIGN KEY ("originalId") REFERENCES "Ponysona"("id") ON DELETE SET NULL ON UPDATE CASCADE;
