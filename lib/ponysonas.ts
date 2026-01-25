import { randomBytes } from "node:crypto";
import { object, string, array, number, mixed } from "yup";
import prisma from "./prisma";
import { MediaType, Ponysona, BodyPart, Pattern } from "@/generated/client";

const PonysonaAttributeBody = object({
    part: mixed<BodyPart>().oneOf(Object.values(BodyPart)).optional(),
    color: string().optional(),
    pattern: mixed<Pattern>().oneOf(Object.values(Pattern)).optional()
});

export const PonysonaBody = object({
    primaryName: string().required(),
    otherNames: array(string().required()).optional().default(new Array<string>()),
    description: string().nullable().optional(),
    tagIds: array(number().required()).required(),
    sources: array(string().required()).optional().default(new Array<string>()),
    creators: array(string().required()).optional().default(new Array<string>()),
    attributes: object({
        mane: PonysonaAttributeBody.nullable().optional(),
        tail: PonysonaAttributeBody.nullable().optional(),
        coat: PonysonaAttributeBody.nullable().optional(),
        wings: PonysonaAttributeBody.nullable().optional(),
        horn: PonysonaAttributeBody.nullable().optional(),
        eyes: PonysonaAttributeBody.nullable().optional()
    }).optional(),
    media: object({
        preview: string().nullable().optional(),
        mark: string().nullable().optional()
    }).optional()
});

export async function generatePonysonaSlug(primaryName: string) {
    const normalizedName = primaryName
        .toLowerCase()
        .trim()
        .replaceAll(" ", "_");
    const existingPonysonaCnt = await prisma.ponysona.count({ where: { primaryName } });
    const rnd = randomBytes(2).toString("hex");
    
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