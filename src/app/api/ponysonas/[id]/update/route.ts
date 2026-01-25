import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ValidationError } from "yup";
import prisma from "lib/prisma";
import { StatusMessages } from "lib/errors";
import { PonysonaBody as UpdatePonysonaBody } from "lib/ponysonas";
import { TransactionClient } from "@/generated/internal/prismaNamespace";
import { MediaStatus, MediaType } from "@/generated/enums";

export async function PUT(
    request: Request,
    { params }: {
        params: Promise<{
            id: string
        }>
    }
) {
    const requestHeaders = await headers();
    if (requestHeaders.get("content-type") !== "application/json")
        return NextResponse.json(
            { message: StatusMessages.INVALID_CONTENT_TYPE },
            { status: 400 }
        );

    const { id } = await params;
    const body = await request.json();
    try { UpdatePonysonaBody.validateSync(body) } catch (error) {
        return NextResponse.json({ message: (error as ValidationError).message }, { status: 400 });
    }

    const validatedBody = await UpdatePonysonaBody.validate(body);
    try {
        return await prisma.$transaction(async (tx: TransactionClient) => {
            // latest data //
            const ponysona = await tx.ponysona.findUnique({ where: { id } });
            if (ponysona === null)
                return NextResponse.json(
                    { message: StatusMessages.PONYSONA_NOT_FOUND },
                    { status: 404 }
                );

            const attributes = await tx.ponysonaAppearanceAttribute.findMany({
                where: { ponysonaId: ponysona.id }
            });

            // update ponysona metadata first //
            await tx.ponysona.update({
                where: { id: ponysona.id },
                data: {
                    primaryName: validatedBody.primaryName,
                    otherNames: validatedBody.otherNames,
                    description: validatedBody.description,
                    tagIds: validatedBody.tagIds,
                    sources: validatedBody.sources,
                    creators: validatedBody.creators
                }
            });

            // update attributes //
            if (validatedBody.attributes) {
                for (const attribute of Object.values(validatedBody.attributes)) {
                    if (!attribute || !attribute.color || !attribute.part || !attribute.pattern) continue;
                    await tx.ponysonaAppearanceAttribute.update({
                        where: {
                            ponysonaId_bodyPart_color_pattern: {
                                ponysonaId: ponysona.id,
                                bodyPart: attribute.part,
                                color: attribute.color,
                                pattern: attribute.pattern
                            }
                        },
                        data: attribute
                    });
                }
            }

            // update media //
            const previewObject = await tx.media.findFirst({
                where: { ponysonaId: ponysona.id, type: MediaType.preview }
            });

            if (validatedBody.media && validatedBody.media.preview) {
                await tx.media.update({
                    where: { id: validatedBody.media.preview, ponysonaId: null },
                    data: {
                        ponysonaId: ponysona.id,
                        status: MediaStatus.uploaded
                    }
                });
            }

            const markObject = await tx.media.findFirst({
                where: { ponysonaId: ponysona.id, type: MediaType.mark }
            });

            if (validatedBody.media && validatedBody.media.mark) {
                await tx.media.update({
                    where: { id: validatedBody.media.mark, ponysonaId: null },
                    data: {
                        ponysonaId: ponysona.id,
                        status: MediaStatus.uploaded
                    }
                })
            }

            // revision logging for reversal //
            await tx.ponysonaRevision.create({
                data: {
                    ponysonaId: ponysona.id,
                    diff: 0,
                    snapshot: {
                        primaryName: ponysona.primaryName,
                        otherNames: ponysona.otherNames,
                        description: ponysona.description,
                        tagIds: ponysona.tagIds,
                        sources: ponysona.sources,
                        creators: ponysona.creators,
                        attributes,
                        media: {
                            ...(previewObject !== null && { preview: previewObject.id }),
                            ...(markObject !== null && { mark: markObject.id })
                        }
                    }
                }
            })

            return NextResponse.json(
                { message: "Updated ponysona" },
                { status: 200 }
            );
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "An internal server error occurred whilst trying to update this ponysona" },
            { status: 500 }
        );
    }
}