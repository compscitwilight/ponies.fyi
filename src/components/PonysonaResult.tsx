"use client";

import Link from "next/link";
import { Ponysona } from "@/generated/client";

export function PonysonaResult({ ponysona }: {
    ponysona: Ponysona
}) {
    function onEntryReport() {
        
    }

    return (
        <div className="">
            <div className="overflow-hidden">
                <img className="object-fit max-h-[256px] max-w-[256px] m-auto" src="https://static.ponyaggregate.com/users/avatars/1" />
            </div>
            <h1 className="text-2xl text-center">{ponysona.primaryName}</h1>
            <div className="flex items-center gap-1">
                <b>Tags:</b>
                <p>{ponysona.tags.join(", ")}</p>
            </div>
            <div className="grid grid-cols-2 text-center">
                <Link href={`/${ponysona.slug}`} className="text-sky-600 underline">Visit page</Link>
                <p className="text-red-500 underline cursor-pointer">Report entry</p>
            </div>
        </div>
    )
}