"use client";

import { useState } from "react";
import Link from "next/link";
import { Ponysona, PonysonaStatus } from "@/generated/client";
import { PonysonaStatusDropdown } from "./PonysonaStatusDropdown";

export function PendingPonysonaEntry({ ponysona }: {
    ponysona: Ponysona
}) {
    const [status, setStatus] = useState<PonysonaStatus>(ponysona.status);
    const [statusPatchError, setStatusPatchError] = useState<string>();

    function changeStatus(value: PonysonaStatus) {
        fetch(`/api/ponysonas/${ponysona.id}/status`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ status: value })
        })
            .then((response) => {
                if (response.status !== 200) return response.json();
                else setStatus(value);
            })
            .then((json?: { message: string }) => {
                if (json) setStatusPatchError(json.message);
            })
    }

    return (
        <div id={ponysona.slug} className="flex items-center border p-2 border-gray-400/50">
            <div className="flex items-center gap-2 flex-1">
                <img className="self-start w-[48px]" src={`/api/ponysonas/${ponysona.id}/preview`} />
                <div>
                    <Link className="text-xl font-bold" href={`/${ponysona.slug}`}>{ponysona.primaryName}</Link>
                    {ponysona.otherNames.length > 0 && <div className="flex items-center gap-1">
                        <b>Other names:</b>
                        <p>{ponysona.otherNames.join(", ")}</p>
                    </div>}
                </div>
            </div>
            <div>
                <div className="flex gap-1">
                    <label className="text-lg font-bold" htmlFor="ponysona-status">Status</label>
                    <PonysonaStatusDropdown ponysona={ponysona} id="ponysona-status" />
                </div>
            </div>
        </div>
    )
}