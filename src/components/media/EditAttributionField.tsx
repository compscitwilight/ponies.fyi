"use client";

import { Media } from "@/generated/client";
import { useState } from "react";

export function EditAttributionField({
    media,
    type
}: {
    media: Media,
    type: "creator" | "source"
}) {
    const [value, setValue] = useState<string>();
    const [editing, setEditing] = useState<boolean>(false);
    const [pending, setPending] = useState<boolean>(false);
    const [error, setError] = useState<string>();

    function editAttribution() {
        if (!value) {
            alert(`Please provide a valid ${type} value.`);
            return;
        }

        setPending(true);
        fetch(`/api/media/${media.id}/attribute`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ [type]: value })
        })
            .then((response) => {
                setPending(false);
                if (response.ok) window.location.reload();
                else return response.json();
            })
            .then((json?: { message: string }) => {
                if (json) setError(json.message);
            })
    }

    if (pending) return <p>Pending changes...</p>;

    return editing ? (
        <div className="flex gap-1">
            <input
                className="border border-gray-300 p-1"
                onChange={(e) => setValue(e.target.value)}
                type="text"
                placeholder={`Provide ${type}`}
            />
            <button onMouseDown={editAttribution} className="border border-gray-300 p-1 cursor-pointer">Save</button>
            {error && <p className="text-sky-600">{error}</p>}
        </div>
    ) : <p
        onMouseDown={() => setEditing(true)}
        className="text-sky-600 underline cursor-pointer"
    >Edit {type}</p>
}