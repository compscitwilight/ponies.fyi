import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "lib/prisma";

export async function createRouterClient(request: Request, response: NextResponse) {
    const cookieHeader = request.headers.get("cookie") ?? "";
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
            cookies: {
                getAll: () =>
                    cookieHeader
                        .split(";")
                        .map(v => v.trim())
                        .filter(Boolean)
                        .map(pair => {
                            const i = pair.indexOf("=");
                            return { name: pair.slice(0, i), value: pair.slice(i + 1) };
                        }),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                }
            }
        }
    );
}

export async function createClient() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
            cookies: {
                getAll: () => {
                    return cookieStore.getAll()
                }
            }
        }
    );
}

export async function getUserProfile(user: User) {
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    return profile;
}