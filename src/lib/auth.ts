import { Profile } from "@/generated/client";
import { createBrowserClient } from "@supabase/ssr";
import { User } from "@supabase/supabase-js";

interface UserAndProfileResponse {
    user: User,
    profile: Profile | null
}

export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string,
    {
        auth: {
            flowType: "pkce"
        }
    }
);

export async function getUserAndProfile(): Promise<UserAndProfileResponse | null> {
    const response = await fetch("/api/me", { method: "GET" });
    return response.ok ? await response.json() as UserAndProfileResponse : null;
}