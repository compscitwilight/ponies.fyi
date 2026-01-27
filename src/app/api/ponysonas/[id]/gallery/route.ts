import { NextResponse } from "next/server";
import { ValidationError, array, object, string } from "yup";
import { MediaStatus, MediaType } from "@/generated/enums";
import { TransactionClient } from "@/generated/internal/prismaNamespace";
import prisma from "lib/prisma";
import { createClient } from "lib/supabase";
import { StatusMessages } from "lib/errors";
import { Media } from "@/generated/client";

const PatchGalleryBody = object({
    add: array(string().required()).default(new Array<string>()),
    remove: array(string().required()).default(new Array<string>())
});

export async function PATCH(
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

    const { id } = await params;
    if (request.headers.get("content-type") !== "application/json")
        return NextResponse.json(
            { message: StatusMessages.INVALID_CONTENT_TYPE },
            { status: 400 }
        );
    
    const body = await request.json();
    try { PatchGalleryBody.validateSync(body) } catch (error) {
        return NextResponse.json(
            { message: (error as ValidationError).message },
            { status: 400 }
        );
    }

    const validatedBody = await PatchGalleryBody.validate(body);
    try {
        return await prisma.$transaction(async (tx: TransactionClient) => {
            const existingGalleryObjects = await tx.media.findMany({
                where: {
                    ponysonaId: id,
                    type: MediaType.gallery
                }
            });
            
            for (const mediaToAdd of validatedBody.add) {
                if (existingGalleryObjects.find((o: Media) => o.id === mediaToAdd)) continue;
                await tx.media.update({
                    where: {
                        id: mediaToAdd,
                        type: MediaType.gallery,
                        status: MediaStatus.finalized
                    },
                    data: {
                        ponysonaId: id,
                        status: MediaStatus.uploaded
                    }
                })
            }

            for (const mediaToRemove of validatedBody.remove) {
                if (!existingGalleryObjects.find((o: Media) => o.id === mediaToRemove)) continue;
                await tx.media.update({
                    where: {
                        id: mediaToRemove,
                        ponysonaId: id,
                        type: MediaType.gallery,
                        status: MediaStatus.uploaded
                    },
                    data: {
                        ponysonaId: null,
                        status: MediaStatus.finalized
                    }
                });
            }

            return NextResponse.json({ message: "Patched ponysona gallery successfully" }, { status: 200 });
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: StatusMessages.INTERNAL_SERVER_ERROR },
            { status: 500 }
        );
    }
}