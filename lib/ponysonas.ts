import { randomBytes } from "node:crypto";
import prisma from "./prisma";

export async function generatePonysonaSlug(primaryName: string) {
    const normalizedName = primaryName
        .toLowerCase()
        .trim()
        .replaceAll(" ", "_");
    const existingPonysonaCnt = await prisma.ponysona.count({ where: { primaryName } });
    const rnd = randomBytes(8).toString("hex");
    
    let slug = normalizedName;
    if (existingPonysonaCnt > 0)
        slug = slug.concat(existingPonysonaCnt.toString());
    slug = slug.concat("_", rnd);
    return slug;
}