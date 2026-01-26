"use client";

import { useState } from "react";
import { Ponysona, PonysonaStatus } from "@/generated/client";

export function PonysonaStatusDropdown({ ponysona, id }: {
    ponysona: Ponysona,
    id?: string
}) {
    const [status, setStatus] = useState<PonysonaStatus>(ponysona.status);
    const [updating, setUpdating] = useState<boolean>(false);

    function changeStatus(newStatus: PonysonaStatus) {
        setUpdating(true);
        fetch(`/api/ponysonas/${ponysona.id}/status`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        })
            .then((response) => {
                if (response.status !== 200) return response.json();
                else setStatus(newStatus);
            })
            .then((json?: { message: string }) => {
                if (json) alert(json.message);
            })
            .finally(() => setUpdating(false));
    }

    return updating ? (
        <p>Updating...</p>
    ) : (
        <select
            value={status}
            onChange={(e) => changeStatus(e.target.value as PonysonaStatus)}
            id={id}
            className="border border-gray-400/50 rounded-md p-1 cursor-pointer"
        >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Hidden">Hidden</option>
        </select>
    )
}