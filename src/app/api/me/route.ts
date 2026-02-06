import { NextResponse } from "next/server";

import { createClient, getUserProfile } from "lib/supabase";
import { StatusMessages } from "lib/errors";

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json(
        { message: StatusMessages.NOT_AUTHENTICATED },
        { status: 401 }
    )
    
    const profile = await getUserProfile(user);
    return NextResponse.json({
        user, profile
    }, { status: 200 });
}