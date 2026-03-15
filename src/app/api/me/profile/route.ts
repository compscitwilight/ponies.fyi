import { NextResponse } from "next/server";
import { object, string, ValidationError } from "yup";

import { createClient } from "lib/supabase";
import prisma from "lib/prisma";
import { StatusMessages } from "lib/errors";

const ProfilePatchBody = object({
    alias: string().min(3).max(30).optional(),
    bio: string().max(5000).nullable().optional()
})

export async function PATCH(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user === null) return NextResponse.json(
        { message: StatusMessages.NOT_AUTHENTICATED },
        { status: 401 }
    );

    if (request.headers.get("content-type") !== "application/json")
        return NextResponse.json(
            { message: StatusMessages.INVALID_CONTENT_TYPE },
            { status: 400 }
        );

    const body = await request.json();
    try { ProfilePatchBody.validateSync(body); } catch (error) {
        return NextResponse.json(
            { message: (error as ValidationError).message },
            { status: 400 }
        );
    }

    const payload = await ProfilePatchBody.validate(body);
    await prisma.profile.update({
        where: { userId: user.id },
        data: {
            alias: payload.alias && payload.alias.trim(),
            bio: payload.bio
        }
    });

    return NextResponse.json({ message: "Updated profile" }, { status: 200 });
}