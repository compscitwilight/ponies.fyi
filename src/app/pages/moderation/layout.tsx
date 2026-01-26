import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, getUserProfile } from "lib/supabase";

export const metadata: Metadata = {
    title: "Moderation | ponies.fyi"
}

export default async function ModerationLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/?state=unauthorized");

    const profile = await getUserProfile(user);
    if (!profile || !profile.isAdmin) redirect("/?state=unauthorized");

    return (
        <div>
            {children}
        </div>
    )
}