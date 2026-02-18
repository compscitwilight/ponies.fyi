-- CreateTable
CREATE TABLE "PonysonaColorTraits" (
    "ponysonaId" TEXT NOT NULL,
    "part" TEXT NOT NULL,
    "color" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PonysonaColorTraits_ponysonaId_part_color_key" ON "PonysonaColorTraits"("ponysonaId", "part", "color");
