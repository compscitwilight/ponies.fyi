import { randomBytes } from "node:crypto";
import { object, string, array, number, mixed } from "yup";
import prisma from "./prisma";
import { MediaType, Ponysona, BodyPart, Pattern, Prisma, PonysonaTag } from "@/generated/client";
import { TransactionClient } from "@/generated/internal/prismaNamespace";
import { User } from "@supabase/supabase-js";

const PonysonaAttributeBody = object({
    part: mixed<BodyPart>().oneOf(Object.values(BodyPart)).required(),
    colors: array(string().required()).required(),
    pattern: mixed<Pattern>().oneOf(Object.values(Pattern)).required()
});

export const PonysonaAccessoryBody = object({
    name: string().required().default(undefined),
    colors: array(string().required()).default(undefined),
    pattern: mixed<Pattern>().oneOf(Object.values(Pattern)).default(undefined)
});

export const HexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

export const PonysonaBody = object({
    slug: string().optional(),
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
    accessories: array(PonysonaAccessoryBody).nullable().notRequired(),
    media: object({
        preview: string().nullable().optional(),
        mark: string().nullable().optional()
    }).optional()
});

export interface RevisionSnapshot {
    primaryName?: string,
    originalId?: string,
    otherNames?: Array<string>,
    description?: string,
    tagIds?: Array<number>,
    sources?: Array<string>,
    creators?: Array<string>,
    attributes: Array<{
        id?: string,
        colors?: Array<string>,
        pattern: Pattern,
        ponysonaId?: string,
        bodyPart: BodyPart,
        createdAt?: Date,
        updatedAt?: Date
    }>,
    media: {
        preview?: string,
        mark?: string 
    }
}

export async function createPonysonaRevision(
    tx: TransactionClient,
    ponysona: Ponysona & { tags: Array<PonysonaTag> },
    creator?: User
) {
    const previewObject = await tx.media.findFirst({
        where: { ponysonaId: ponysona.id, type: MediaType.preview }
    });

    const markObject = await tx.media.findFirst({
        where: { ponysonaId: ponysona.id, type: MediaType.mark }
    });

    const attributes = await tx.ponysonaAppearanceAttribute.findMany({
        where: { ponysonaId: ponysona.id }
    });

    const accessories = await tx.ponysonaAccessory.findMany({
        where: { ponysonaId: ponysona.id }
    });

    const snapshot = {
        primaryName: ponysona.primaryName,
        originalId: ponysona.originalId,
        otherNames: ponysona.otherNames,
        description: ponysona.description,
        tags: ponysona.tags,
        sources: ponysona.sources,
        creators: ponysona.creators,
        attributes,
        accessories,
        media: {
            ...(previewObject && { preview: previewObject.id }),
            ...(markObject && { mark: markObject.id })
        }
    } as RevisionSnapshot;

    const revision = await tx.ponysonaRevision.create({
        data: {
            ponysonaId: ponysona.id,
            createdById: creator?.id,
            diff: 0,
            snapshot: snapshot as any
        }
    })

    return revision;
}

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