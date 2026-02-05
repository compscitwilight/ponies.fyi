"use client";

import { useSearchParams } from "next/navigation";

export function SearchBox() {
    const searchParams = useSearchParams();
    return (
        <form method="GET" action="/" className="flex items-center gap-1">
            <input name="q" defaultValue={searchParams.get("q") || ""} className="border rounded-md p-1 border-gray-400/50 focus:outline-none" placeholder="Search ponysonas" type="text" required />
            <button
                type="submit"
                className="duration-200 transition-bg hover:bg-gray-300/50 border border-gray-400/50 rounded-md p-1 cursor-pointer"
            >Search</button>
        </form>
    )
}