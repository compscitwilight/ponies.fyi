import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { object, mixed, ValidationError } from "yup";
import { PonysonaStatus } from "@/generated/enums";
import { TransactionClient } from "@/generated/internal/prismaNamespace";
import { createClient, getUserProfile } from "lib/supabase";
import prisma from "lib/prisma";
import { StatusMessages } from "lib/errors";

const StatusPatchBody = object({
    status: mixed<PonysonaStatus>().oneOf(Object.values(PonysonaStatus)).required()
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
    if (user === null) return NextResponse.json(
        { message: StatusMessages.NOT_AUTHENTICATED },
        { status: 401 }
    );
    
    const profile = await getUserProfile(user);
    if (profile === null || !profile.isAdmin) return NextResponse.json(
        { message: StatusMessages.NOT_PERMITTED },
        { status: 403 }
    );

    const requestHeaders = await headers();
    if (requestHeaders.get("content-type") !== "application/json")
        return NextResponse.json(
            { message: StatusMessages.INVALID_CONTENT_TYPE },
            { status: 400 }
        );

    const { id } = await params;
    const body = await request.json();
    try { StatusPatchBody.validateSync(body) } catch (error) {
        return NextResponse.json(
            { message: (error as ValidationError).message },
            { status: 400 }
        );
    }

    const validatedBody = await StatusPatchBody.validate(body);
    try {
        return await prisma.$transaction(async (tx: TransactionClient) => {
            const ponysona = await tx.ponysona.findUnique({ where: { id } });
            if (ponysona === null)
                return NextResponse.json(
                    { message: StatusMessages.PONYSONA_NOT_FOUND },
                    { status: 404 }
                );

            await tx.ponysona.update({
                where: { id: ponysona.id },
                data: validatedBody
            });

            return NextResponse.json({ status: "Status patched successfully" }, { status: 200 });
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: StatusMessages.INTERNAL_SERVER_ERROR },
            { status: 500 }
        );
    }
}