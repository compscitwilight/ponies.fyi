import { NextResponse } from "next/server";

import prisma from "lib/prisma";
import { createClient, getUserProfile } from "lib/supabase";
import { StatusMessages } from "lib/errors";
import { TransactionClient } from "@/generated/internal/prismaNamespace";

export async function PATCH(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user === null) return NextResponse.json(
        { message: StatusMessages.NOT_AUTHENTICATED },
        { status: 401 }
    );

    const profile = await getUserProfile(user);
    if (!profile?.isAdmin) return NextResponse.json(
        { message: StatusMessages.NOT_PERMITTED },
        { status: 403 }
    );

    if (request.headers.get("content-type") !== "application/json")
        return NextResponse.json(
            { message: StatusMessages.INVALID_CONTENT_TYPE },
            { status: 400 }
        );

    const body = await request.json() as { [key: string]: any };
    try {
        return await prisma.$transaction(async (tx: TransactionClient) => {
            for (const [key, value] of Object.entries(body)) {
                const existingSetting = await tx.siteSettings.findUnique({ where: { key } });
                if (existingSetting) await tx.siteSettings.update({
                    where: { key },
                    data: { value }
                }); else await tx.siteSettings.create({
                    data: { key, value }
                });
            }

            return NextResponse.json({ message: "Updated site settings" }, { status: 200 });
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: StatusMessages.INTERNAL_SERVER_ERROR },
            { status: 500 }
        );
    }
}