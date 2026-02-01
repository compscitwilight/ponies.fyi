import { randomBytes } from "node:crypto";
import { object, string, array, number, mixed } from "yup";
import prisma from "./prisma";
import { MediaType, Ponysona, BodyPart, Pattern } from "@/generated/client";

const PonysonaAttributeBody = object({
    part: mixed<BodyPart>().oneOf(Object.values(BodyPart)).required(),
    colors: array(string().required()).required(),
    pattern: mixed<Pattern>().oneOf(Object.values(Pattern)).required()
});

export const HexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

export const PonysonaBody = object({
    primaryName: string().required(),
    otherNames: array(string().required()).optional().default(new Array<string>()),
    derivativeOf: string().optional(),
    description: string().nullable().optional(),
    tagIds: array(number().required()).required(),
    sources: array(string().required()).optional().default(new Array<string>()),
    creators: array(string().required()).optional().default(new Array<string>()),
    attributes: object({
        mane: PonysonaAttributeBody.nullable().default(undefined),
        tail: PonysonaAttributeBody.nullable().default(undefined),
        coat: PonysonaAttributeBody.nullable().default(undefined),
        wings: PonysonaAttributeBody.nullable().default(undefined),
        horn: PonysonaAttributeBody.nullable().default(undefined),
        eyes: PonysonaAttributeBody.nullable().default(undefined)
    }).nullable().notRequired(),
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