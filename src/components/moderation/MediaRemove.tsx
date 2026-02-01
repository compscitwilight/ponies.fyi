"use client";

import { useState } from "react";
import { Media } from "@/generated/client";

export function MediaRemove({ media }: {
    media: Media
}) {
    const [success, setSuccess] = useState<boolean>();
    const [error, setError] = useState<string>();

    function onRemove() {
        fetch(`/api/media/${media.id}/remove`, { method: "POST" })
            .then((response) => {
                setSuccess(response.status === 200);
                if (response.status !== 200) return response.json();
            })
            .then((json?: { message: string }) => {
                if (json) setError(json.message);
            })
    }

    return success === undefined ? (
        <button
            onMouseDown={onRemove}
            className="text-white bg-red-500 px-2 py-1 cursor-pointer"
        >Remove</button>
    ) : success ? <p>Removed media object.</p> : <p>Failed to remove media object. {error}</p>
}