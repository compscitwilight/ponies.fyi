import { NextResponse } from "next/server";
import { createRouterClient, getUserProfile } from "lib/supabase";
import { createUserProfile } from "lib/accounts";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    console.log(searchParams);
    const code = searchParams.get("code");
    let next = searchParams.get("next") ?? "/";
    if (!next.startsWith("/")) next = "/";

    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";
    let redirectUrl = !isLocalEnv && forwardedHost ? `https://${forwardedHost}${next}` : `${origin}${next}`;
    const response = NextResponse.redirect(redirectUrl);

    if (!code) {
        console.log("couldn't retrieve code");
        return NextResponse.redirect(`${origin}/?state=auth_error`);
    }

    const supabase = await createRouterClient(request, response);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
        console.error(error);
        return NextResponse.redirect(`${origin}/?state=auth_error`);
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user !== null) {
            const existingProfile = await getUserProfile(user);
            if (existingProfile === null) await createUserProfile(user);
            else console.log("Existing profile found.");
        } else console.warn("Failed to retrieve user.");
    } catch (error) {
        console.log(`Failed to initialize user profile - ${error}`);
    }

    return response;
}