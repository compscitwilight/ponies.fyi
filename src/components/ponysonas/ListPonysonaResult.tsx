"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Flag, Clock } from "lucide-react";
import { Ponysona } from "@/generated/client";

export function ListPonysonaResult({ data }: {
    data: Ponysona
}) {
    return (
        <Link href={`/${data.slug}`} target="_blank" className="flex gap-4 border border-gray-400/50 rounded-md p-2">
            <img className="h-[64px] object-fit" src={`/api/ponysonas/${data.id}/preview`} />
            <div className="grid gap-2">
                <div className="flex gap-1 items-center">
                    <h1 className="text-xl font-bold">{data.primaryName}</h1>
                    {data.otherNames.length > 0 && <i>aka {data.otherNames.join(", ")}</i>}
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex gap-1 items-center">
                        <Flag />
                        <b>Status</b>
                        <p>{data.status}</p>
                    </div>
                    <div className="flex gap-1 items-center">
                        <Clock />
                        <b>Created</b>
                        <p>{format(data.createdAt, "dd MMMM yyyy")}</p>
                    </div>
                    {data.updatedAt.getTime() !== data.createdAt.getTime() && <div className="flex gap-1 items-center">
                        <Clock />
                        <b>Last updated</b>
                        <p>{format(data.updatedAt, "dd MMMM yyyy")}</p>
                    </div>}
                </div>
            </div>
        </Link>
    )
}