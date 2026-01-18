import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { array, mixed, number, object, string, ValidationError } from "yup";

import prisma from "lib/prisma";
import { generatePonysonaSlug } from "lib/ponysonas";
import { TransactionClient } from "@/generated/internal/prismaNamespace";
import { BodyPart, Pattern } from "@/generated/enums";

const PonysonaAttributeBody = object({
    part: mixed<BodyPart>().oneOf(Object.values(BodyPart)).required(),
    color: string().required(),
    pattern: mixed<Pattern>().oneOf(Object.values(Pattern)).required()
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
    }).optional()
});

export async function POST(request: Request) {
    const requestHeaders = await headers();
    if (requestHeaders.get("content-type") !== "application/json")
        return NextResponse.json(
            { message: "'Content-Type' must be application/json" },
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
        await prisma.$transaction(async (tx: TransactionClient) => {
            const slug = await generatePonysonaSlug(validatedBody.primaryName);
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
                    if (!attributes) continue
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
        })
    } catch (error) {
        return NextResponse.json(
            { message: (error as Error).message },
            { status: 500 }
        );
    }
}