import { NextResponse } from "next/server";

import prisma from "lib/prisma";
import { createClient, getUserProfile } from "lib/supabase";
import { StatusMessages } from "lib/errors";
import { TransactionClient } from "@/generated/internal/prismaNamespace";

export async function POST(
    request: Request,
    { params }: {
        params: Promise<{
            id: string
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
    if (profile === null || (!profile.canRemoveGalleryImages && !profile.isAdmin))
        return NextResponse.json(
            { message: StatusMessages.NOT_PERMITTED },
            { status: 403 }
        );

    const { id } = await params;
    try {
        return await prisma.$transaction(async (tx: TransactionClient) => {
            const media = await tx.media.findUnique({ where: { id } });
            if (media === null) return NextResponse.json(
                { message: StatusMessages.MEDIA_NOT_FOUND },
                { status: 404 }
            );

            await tx.media.update({
                where: { id: media.id },
                data: { ponysonaId: null }
            })

            return NextResponse.json({ message: "Removed media successfully" }, { status: 200 });
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: StatusMessages.INTERNAL_SERVER_ERROR },
            { status: 500 }
        );
    }
}