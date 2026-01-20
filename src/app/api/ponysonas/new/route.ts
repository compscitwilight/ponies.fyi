import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { array, mixed, number, object, string, ValidationError } from "yup";

import prisma from "lib/prisma";
import { generatePonysonaSlug } from "lib/ponysonas";
import { StatusMessages } from "lib/errors";
import { TransactionClient } from "@/generated/internal/prismaNamespace";
import { BodyPart, MediaStatus, Pattern } from "@/generated/enums";

const PonysonaAttributeBody = object({
    part: mixed<BodyPart>().oneOf(Object.values(BodyPart)).optional(),
    color: string().optional(),
    pattern: mixed<Pattern>().oneOf(Object.values(Pattern)).optional()
});

const NewPonysonaBody = object({
    primaryName: string().required(),
    otherNames: array(string().required()).nullable().optional(),
    description: string().nullable().optional(),
    tagIds: array(number().required()).required(),
    sources: array(string().required()).nullable().optional(),
    creators: array(string().required()).nullable().optional(),
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

export async function POST(request: Request) {
    const requestHeaders = await headers();
    if (requestHeaders.get("content-type") !== "application/json")
        return NextResponse.json(
            { message: StatusMessages.INVALID_CONTENT_TYPE },
            { status: 400 }
        );

    const requestBody = await request.json();
    try { NewPonysonaBody.validateSync(requestBody) } catch (error) {
        if (error instanceof ValidationError)
            return NextResponse.json(
                { message: (error as ValidationError).message },
                { status: 400 }
            )
    }

    const validatedBody = await NewPonysonaBody.validate(requestBody);
    try {
        const slug = await generatePonysonaSlug(validatedBody.primaryName);
        return await prisma.$transaction(async (tx: TransactionClient) => {
            const newPonysona = await tx.ponysona.create({
                data: {
                    slug,
                    primaryName: validatedBody.primaryName,
                    ...(validatedBody.otherNames && { otherNames: validatedBody.otherNames }),
                    description: validatedBody.description,
                    tagIds: (validatedBody.tagIds && validatedBody.tagIds.length > 0) ? validatedBody.tagIds : [],
                    sources: (validatedBody.sources && validatedBody.sources.length > 0) ? validatedBody.sources : [],
                    creators: (validatedBody.creators && validatedBody.creators.length > 0) ? validatedBody.creators : [],
                    colorsName: []
                }
            });

            if (validatedBody.attributes) {
                for (const [, attributes] of Object.entries(validatedBody.attributes)) {
                    if (!attributes || !attributes.part) continue
                    await tx.ponysonaAppearanceAttribute.create({
                        data: {
                            ponysonaId: newPonysona.id,
                            bodyPart: attributes.part,
                            color: attributes.color,
                            pattern: attributes.pattern
                        }
                    })
                }
            }

            if (validatedBody.media) {
                for (const uuid of Object.values(validatedBody.media)) {
                    if (uuid === null) continue;
                    await tx.media.update({
                        where: { id: uuid },
                        data: {
                            ponysonaId: newPonysona.id,
                            status: MediaStatus.uploaded
                        }
                    });
                }
            }

            return NextResponse.json(newPonysona, { status: 200 });
        })
    } catch (error) {
        return NextResponse.json(
            { message: (error as Error).message },
            { status: 500 }
        );
    }
}