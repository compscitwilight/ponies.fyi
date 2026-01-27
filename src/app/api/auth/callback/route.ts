import { NextResponse } from "next/server";
import { createRouterClient } from "lib/supabase";

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

    return response;
}