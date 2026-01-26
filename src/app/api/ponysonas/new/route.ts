import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ValidationError } from "yup";

import prisma from "lib/prisma";
import { generatePonysonaSlug } from "lib/ponysonas";
import { StatusMessages } from "lib/errors";
import { TransactionClient } from "@/generated/internal/prismaNamespace";
import { MediaStatus } from "@/generated/enums";
import { PonysonaBody as NewPonysonaBody, HexColorRegex } from "lib/ponysonas";

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
                for (const [, attribute] of Object.entries(validatedBody.attributes)) {
                    if (!attribute || !attribute.part) continue;
                    for (const color of attribute.colors)
                        if (!HexColorRegex.exec(color))
                            return NextResponse.json(
                                { message: `Invalid hex code ${color} provided` },
                                { status: 400 }
                            );

                    await tx.ponysonaAppearanceAttribute.create({
                        data: {
                            ponysonaId: newPonysona.id,
                            bodyPart: attribute.part,
                            colors: attribute.colors,
                            pattern: attribute.pattern
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
        console.error(error);
        return NextResponse.json(
            { message: "An internal server error occurred whilst creating this ponysona" },
            { status: 500 }
        );
    }
}