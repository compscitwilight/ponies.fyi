import { NextResponse } from "next/server";
import { TransactionClient } from "@/generated/internal/prismaNamespace";
import { object, string, ValidationError } from "yup";

import prisma from "lib/prisma";
import { createClient } from "lib/supabase";
import { StatusMessages } from "lib/errors";

const AttributeBody = object({
    creator: string().nullable().optional(),
    source: string().nullable().optional()
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
    try { AttributeBody.validateSync(body) } catch (error) {
        return NextResponse.json(
            { message: (error as ValidationError).message },
            { status: 400 }
        );
    }

    const validatedBody = await AttributeBody.validate(body);
    try {
        return await prisma.$transaction(async (tx: TransactionClient) => {
            const mediaObject = await tx.media.findUnique({ where: { id } });
            if (mediaObject === null) return NextResponse.json(
                { message: StatusMessages.MEDIA_NOT_FOUND },
                { status: 404 }
            );

            await tx.media.update({
                where: { id: mediaObject.id },
                data: {
                    creator: validatedBody.creator,
                    source: validatedBody.source
                }
            });

            return NextResponse.json({ message: "Updated attribution successfully" }, { status: 200 });
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: StatusMessages.INTERNAL_SERVER_ERROR }, { status: 500 });
    }
}