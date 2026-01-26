import { NextResponse } from "next/server";
import { createClient, getUserProfile } from "lib/supabase";
import { StatusMessages } from "lib/errors";
import prisma from "lib/prisma";
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
    if (!user) return NextResponse.json(
        { message: StatusMessages.NOT_AUTHENTICATED },
        { status: 401 }
    );

    const profile = await getUserProfile(user);
    if (profile === null || !profile.isAdmin) return NextResponse.json(
        { message: StatusMessages.NOT_PERMITTED },
        { status: 403 }
    );

    const { id } = await params;
    try {
        return await prisma.$transaction(async (tx: TransactionClient) => {
            const ponysona = await tx.ponysona.findUnique({ where: { id } });
            if (ponysona === null)
                return NextResponse.json(
                    { message: StatusMessages.PONYSONA_NOT_FOUND },
                    { status: 404 }
                );

            const newVal = !ponysona.locked;
            await tx.ponysona.update({
                where: { id: ponysona.id },
                data: { locked: newVal }
            });

            return NextResponse.json({ message: `${newVal ? "Locked" : "Unlocked"} entry successfully` }, { status: 200 });
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "An internal server error occurred" },
            { status: 500 }
        )
    }
}