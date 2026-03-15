import { NextResponse } from "next/server";

import { createClient } from "lib/supabase";
import { moveObject } from "lib/aws";
import { StatusMessages } from "lib/errors";

export async function PUT(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user === null) return NextResponse.json(
        { message: StatusMessages.NOT_AUTHENTICATED },
        { status: 401 }
    );

    const stageAvatarResponse = await fetch(`https://static.ponies.fyi/user_avatars_stage/${user.id}`);
    if (!stageAvatarResponse.ok) return NextResponse.json(
        { message: "A staged avatar object could not be located" },
        { status: 404 }
    );

    try {
        await moveObject(`user_avatars_stage/${user.id}`, `user_avatars/${user.id}`);
        return NextResponse.json({ message: "Updated avatar successfully" }, { status: 200 });
    } catch (error) {
        console.log(`Failed to update user avatar: ${error}`);
        return NextResponse.json(
            { message: "Failed to update user avatar" },
            { status: 500 }
        );
    }
}