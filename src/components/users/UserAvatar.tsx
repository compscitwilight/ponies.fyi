"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Profile } from "@/generated/client";

export function UserAvatar({
    profile,
    canModify
}: { profile: Profile, canModify?: boolean }) {
    const [error, setError] = useState<boolean>(false);

    function onEdit() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.click();

        input.onchange = (event: Event) => {
            const target = event.target as HTMLInputElement;
            if (target.files === null || target.files.length === 0) return;
            const file = target.files[0];
            fetch("/api/me/avatar/create", { method: "POST" })
                .then((response) => {
                    if (!response.ok) {
                        alert("Failed to upload avatar.");
                        return;
                    }

                    return response.json();
                })
                .then((json: { presignedUrl: string }) => {
                    const xhr = new XMLHttpRequest();
                    xhr.responseType = "json";
                    xhr.open("put", json.presignedUrl);
                    xhr.setRequestHeader("Content-Type", file.type);

                    xhr.onload = () => {
                        fetch("/api/me/avatar/commit", { method: "PUT" })
                            .then((response) => {
                                if (response.ok) window.location.reload();
                                else alert("Failed to update avatar.");
                            })
                    }

                    xhr.send(file);
                })
        }
    }

    return (
        <div className="relative rounded-md shadow-md group h-[128px] w-[128px]">
            {!error && <img
                className="absolute"
                onError={() => setError(true)}
                src={`https://static.ponies.fyi/user_avatars/${profile.userId}`} />
            }
            {canModify && <div
                title="Edit avatar"
                className="absolute z-10 bg-gray-300/50 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-350"
            >
                <Edit onMouseDown={onEdit} className="float-right m-2 shadow-md bg-white cursor-pointer" />
            </div>}
        </div>
    )
}