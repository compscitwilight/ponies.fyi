import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ValidationError } from "yup";
import prisma from "lib/prisma";
import { createClient } from "lib/supabase";
import { StatusMessages } from "lib/errors";
import { PonysonaBody as UpdatePonysonaBody, HexColorRegex } from "lib/ponysonas";
import { TransactionClient } from "@/generated/internal/prismaNamespace";
import { BodyPart, MediaStatus, MediaType } from "@/generated/enums";

export async function PUT(
    request: Request,
    { params }: {
        params: Promise<{
            id: string
        }>
    }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json(
        { message: StatusMessages.NOT_AUTHENTICATED },
        { status: 401 }
    );

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

            if (ponysona.locked)
                return NextResponse.json(
                    { message: "This ponysona is currently locked and cannot be modified." },
                    { status: 403 }
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
                for (const [key, attribute] of Object.entries(validatedBody.attributes)) {
                    if (attribute === undefined) continue;
                    const existingAttribute = await tx.ponysonaAppearanceAttribute.findFirst({
                        where: {
                            ponysonaId: ponysona.id,
                            bodyPart: key as BodyPart,
                        }
                    });

                    if (attribute === null) {
                        if (existingAttribute)
                            await tx.ponysonaAppearanceAttribute.delete({
                                where: { id: existingAttribute.id }
                            });
                    } else {
                        for (const color of attribute.colors)
                            if (!HexColorRegex.exec(color))
                                return NextResponse.json(
                                    { message: `Invalid hex code ${color} provided` },
                                    { status: 400 }
                                );

                        if (existingAttribute)
                            await tx.ponysonaAppearanceAttribute.update({
                                where: { id: existingAttribute.id },
                                data: {
                                    colors: attribute.colors,
                                    pattern: attribute.pattern
                                }
                            });
                        else
                            await tx.ponysonaAppearanceAttribute.create({
                                data: {
                                    ponysonaId: ponysona.id,
                                    bodyPart: attribute.part,
                                    colors: attribute.colors,
                                    pattern: attribute.pattern
                                }
                            });
                    }
                }
            }

            // update media //
            if (validatedBody.media) {
                for (const [key, uuid] of Object.entries(validatedBody.media)) {
                    if (uuid === undefined) continue;

                    const existingMediaObject = await tx.media.findFirst({
                        where: {
                            id: ponysona.id,
                            type: key as MediaType
                        }
                    });

                    if (existingMediaObject !== null && uuid === null) {
                        // if (uuid === null) {
                        await tx.media.update({
                            where: { id: existingMediaObject.id },
                            data: { ponysonaId: null, status: MediaStatus.finalized }
                        });
                        // } else {
                        //     await tx.media.update({
                        //         where: { id: existingMediaObject.id },
                        //         data: { ponysonaId: ponysona.id, status: MediaStatus.uploaded }
                        //     })
                        // }
                    } else {
                        await tx.media.update({
                            where: { id: uuid as string },
                            data: { ponysonaId: ponysona.id, status: MediaStatus.uploaded }
                        })
                    }
                }
            }

            // revision logging for reversal //
            await tx.ponysonaRevision.create({
                data: {
                    ponysonaId: ponysona.id,
                    createdById: user.id,
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
                            ...(validatedBody.media?.preview !== null && { preview: validatedBody.media?.preview }),
                            ...(validatedBody.media?.mark !== null && { mark: validatedBody.media?.mark })
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