"use client";

import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/generated/client";

export function AccountNav({ user, profile }: {
    user: User,
    profile: Profile | null
}) {
    return (
        <div className="relative group cursor-pointer">
            <p className="text-sky-600 underline">[ Account ]</p>
            <div className="absolute z-10 p-1 bg-gray-100 opacity-0 group-hover:opacity-100 w-min-32 w-max shadow-md">
                <div className="grid gap-1 text-black">
                    <Link
                        className="hover:bg-gray-300/50 transition-bg duration-200"
                        href={`/u/${profile?.alias || profile?.userId}`}
                    >Your profile</Link>
                    <Link
                        className="hover:bg-gray-300/50 transition-bg duration-200"
                        href="/pages/submissions"
                    >Your submissions</Link>
                    <Link
                        className="hover:bg-gray-300/50 transition-bg duration-200"
                        href="/pages/settings"
                    >Settings</Link>
                    <Link
                        className="hover:bg-gray-300/50 transition-bg text-red-700 duration-200"
                        href="/pages/auth/logout"
                    >Logout</Link>
                </div>
            </div>
        </div>
    )
}