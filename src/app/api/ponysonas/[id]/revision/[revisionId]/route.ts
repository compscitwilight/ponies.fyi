import { NextResponse } from "next/server";

import { TransactionClient } from "@/generated/internal/prismaNamespace";

import prisma from "lib/prisma";
import { createClient, getUserProfile } from "lib/supabase";
import { StatusMessages } from "lib/errors";
import { createPonysonaRevision, RevisionSnapshot } from "lib/ponysonas";
import { MediaType } from "@/generated/enums";

export async function PATCH(
    request: Request,
    { params }: {
        params: Promise<{
            id: string,
            revisionId: string
        }>
    }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user === null) return NextResponse.json(
        { message: StatusMessages.NOT_AUTHENTICATED },
        { status: 401 }
    );

    const profile = await getUserProfile(user);
    if (profile === null || !profile.isAdmin) return NextResponse.json(
        { message: StatusMessages.NOT_PERMITTED },
        { status: 403 }
    );

    const { id: ponysonaId, revisionId } = await params;

    try {
        return await prisma.$transaction(async (tx: TransactionClient) => {
            const ponysona = await tx.ponysona.findUnique({
                where: { id: ponysonaId },
                include: { tags: true }
            });
            if (ponysona === null) return NextResponse.json(
                { message: StatusMessages.PONYSONA_NOT_FOUND },
                { status: 404 }
            );

            const revision = await tx.ponysonaRevision.findFirst({
                where: { id: revisionId, ponysonaId }
            });

            if (revision === null || !revision.snapshot) return NextResponse.json(
                { message: "The revision requested could not be found" },
                { status: 404 }
            );

            const snapshot = revision.snapshot as unknown as RevisionSnapshot;
            await createPonysonaRevision(tx, ponysona, user);
            await tx.ponysona.update({
                where: { id: ponysona.id },
                data: {
                    primaryName: snapshot.primaryName,
                    originalId: snapshot.originalId,
                    otherNames: snapshot.otherNames,
                    description: snapshot.description,
                    tags: {
                        set: snapshot.tagIds?.map((id: number) => ({ id }))
                    },
                    sources: snapshot.sources,
                    creators: snapshot.creators
                }
            });

            await tx.ponysonaAppearanceAttribute.deleteMany({
                where: { ponysonaId: ponysona.id }
            });

            for (const attribute of snapshot.attributes) {
                await tx.ponysonaAppearanceAttribute.create({
                    data: {
                        ponysonaId: ponysona.id,
                        colors: attribute.colors,
                        pattern: attribute.pattern,
                        bodyPart: attribute.bodyPart
                    }
                });
            }

            await tx.media.updateMany({
                where: {
                    ponysonaId: ponysona.id,
                    NOT: [ { type: MediaType.gallery } ]
                },
                data: { ponysonaId: null }
            })

            for (const uuid of Object.values(snapshot.media)) {
                await tx.media.update({
                    where: { id: uuid },
                    data: { ponysonaId: ponysona.id }
                });
            }

            return NextResponse.json({ message: "Reverted to revision successfully" }, { status: 200 });
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: StatusMessages.INTERNAL_SERVER_ERROR },
            { status: 500 }
        );
    }
}