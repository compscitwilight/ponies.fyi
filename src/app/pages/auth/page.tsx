"use client";

import { useEffect } from "react";
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
                redirectTo: `${window.location.protocol}//${window.location.host}/api/auth/callback?next=/`
            }
        });

        if (error) {
            alert("Failed to authenticate with Discord OAuth");
        }
    }

    return (
        <div>
            <title>Auth | ponies.fyi</title>

            <h1 className="text-3xl font-bold">Join ponies.fyi</h1>
            <hr className="my-2 h-px border-0 bg-gray-400/50" />
            <div className="flex flex-col lg:flex-row gap-2 items-center my-4">
                <a href="https://derpibooru.org/images/1948150" target="_blank">
                    <img className="w-[384]" src="/auth.png" />
                </a>
                <div className="flex-1 text-lg">
                    <span>
                        <b>ponies.fyi</b> is an open-source platform for cataloging the long tradition of
                        ponysonas in the MLP fandom.
                    </span>
                    <p className="mt-2">Registering a ponies.fyi account gives you the following benefits:</p>
                    <ul className="p-2 list-disc list-inside border rounded-md border-green-300 bg-green-200 m-4">
                        <li>Modify existing ponysona entries (including ones you made anonymously)</li>
                        <li>Build a submission history and credibility</li>
                        <li>Have a profile with personalization options (e.g. avatar, bio)</li>
                        {/* <li>Contribute to moderation and notability discourse</li> */}
                    </ul>
                    <div
                        className="flex gap-2 m-auto w-fit text-white bg-[#5865F2] p-2 rounded-sm cursor-pointer items-center justify-center"
                        onMouseDown={handleDiscordLogin}
                    >
                        <img className="w-[32px]" src="/discord.svg" />
                        <p className="text-lg font-bold">Connect your Discord account</p>
                    </div>
                </div>
            </div>

        </div>
    )
}