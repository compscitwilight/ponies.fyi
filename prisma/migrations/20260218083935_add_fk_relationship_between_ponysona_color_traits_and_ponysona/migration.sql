-- AddForeignKey
ALTER TABLE "PonysonaColorTraits" ADD CONSTRAINT "PonysonaColorTraits_ponysonaId_fkey" FOREIGN KEY ("ponysonaId") REFERENCES "Ponysona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
