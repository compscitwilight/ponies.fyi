import { randomBytes } from "node:crypto";
import prisma from "./prisma";
import { MediaType, Ponysona } from "@/generated/client";

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

export async function getPonysonaPreview(ponysona: Ponysona) {
    const previewObject = await prisma.media.findFirst({
        where: {
            ponysonaId: ponysona.id,
            type: MediaType.preview
        }
    });

    if (previewObject === null)
        return null;

    const imageRes = await fetch(`https://static.ponies.fyi/${previewObject.id}`);
    if (imageRes.ok) return previewObject;
    return null;
}

export async function getPonysonaMark(ponysona: Ponysona) {
    const markObject = await prisma.media.findFirst({
        where: {
            ponysonaId: ponysona.id,
            type: MediaType.mark
        }
    });

    if (markObject === null)
        return null;

    const imageRes = await fetch(`https://static.ponies.fyi/${markObject.id}`);
    if (imageRes.ok) return markObject;
    return null;
}

export async function getPonysonaGallery(ponysona: Ponysona) {
    const galleryObjects = await prisma.media.findMany({
        where: {
            ponysonaId: ponysona.id,
            type: MediaType.gallery
        }
    });
    return galleryObjects;
}