import { NextResponse } from "next/server";

import { createClient } from "lib/supabase";
import { StatusMessages } from "lib/errors";
import { generatePresignedUploadURL } from "lib/aws";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user === null) return NextResponse.json(
        { message: StatusMessages.NOT_AUTHENTICATED },
        { status: 401 }
    );

    const presignedUrl = await generatePresignedUploadURL(`user_avatars_stage/${user.id}`);
    return NextResponse.json({ presignedUrl }, { status: 200 });
}