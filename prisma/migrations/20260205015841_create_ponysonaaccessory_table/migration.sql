-- CreateTable
CREATE TABLE "PonysonaAccessory" (
    "id" SERIAL NOT NULL,
    "ponysonaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colors" TEXT[],
    "pattern" "Pattern" NOT NULL,

    CONSTRAINT "PonysonaAccessory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PonysonaAccessory_ponysonaId_name_key" ON "PonysonaAccessory"("ponysonaId", "name");

-- AddForeignKey
ALTER TABLE "PonysonaAccessory" ADD CONSTRAINT "PonysonaAccessory_ponysonaId_fkey" FOREIGN KEY ("ponysonaId") REFERENCES "Ponysona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
