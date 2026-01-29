-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Ponysona" ADD COLUMN     "submittedById" TEXT;

-- AlterTable
ALTER TABLE "PonysonaRevision" ADD COLUMN     "createdById" TEXT;

-- AddForeignKey
ALTER TABLE "Ponysona" ADD CONSTRAINT "Ponysona_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "Profile"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
