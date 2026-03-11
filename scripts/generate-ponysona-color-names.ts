/**
 * generate-ponysona-color-names.ts
 * 
 * Script for sequentially generating the color names for each ponysona
 * stored in the Ponysona table.
 * 
 * Run using `npx tsx generate-ponysona-color-names.ts`
 */

// required for Prisma environment
import "../prisma.config";

import { TransactionClient } from "@/generated/internal/prismaNamespace";
import type { Ponysona } from "@/generated/client";
import prisma from "lib/prisma";
import { generatePonysonaColorNames } from "lib/ponysonas";

(async () => {
    const ponysonas = await prisma.ponysona.findMany({ select: { id: true } });
    console.log(`Queried ${ponysonas.length} ponysonas`);

    for (const ponysona of ponysonas) {
        await prisma.$transaction(async (transaction: TransactionClient) => {
            await generatePonysonaColorNames(transaction, ponysona as Ponysona);
        });
        console.log(`Generated color names for ponysona with ID ${ponysona.id}`);
    }
})();