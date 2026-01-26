"use client";

import { useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/auth";

export default function AuthPage() {
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session && session.user) window.location.assign("/");
        })
    }, []);

    async function handleDiscordLogin() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "discord",
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_NODE_ENV === "production" ? "https://ponies.fyi" : "http://localhost:3000"}/api/auth/callback?next=/`
            }
        });

        if (error) {
            alert("Failed to authenticate with Discord OAuth");
        }
    }

    return (
        <div>
            <p className="text-lg mb-2">
                A user account is required to revise existing ponysonas. Please review the <Link className="text-sky-600 underline" href="/pages/guidelines">user guidelines</Link> before authenticating.
            </p>
            <div
                className="flex gap-2 text-white bg-[#5865F2] py-2 rounded-sm cursor-pointer items-center justify-center"
                onMouseDown={handleDiscordLogin}
            >
                <img className="w-[32px]" src="/discord.svg" />
                <p className="text-lg font-bold">Log in with Discord</p>
            </div>
        </div>
    )
}