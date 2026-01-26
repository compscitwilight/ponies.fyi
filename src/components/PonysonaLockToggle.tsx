"use client";

import { useState } from "react";
import { Ponysona } from "@/generated/client";

export function PonysonaLockToggle({ ponysona }: { ponysona: Ponysona }) {
    const [current, setCurrent] = useState<boolean>(ponysona.locked);

    function onToggle() {
        fetch(`/api/ponysonas/${ponysona.id}/toggleLock`, { method: "POST" })
            .then((response) => {
                if (response.status === 200) setCurrent(c => !c);
                else alert("Failed to toggle ponysona lock");
            })
    }

    return (
        <p
            onMouseDown={onToggle}
            className="text-yellow-500 underline cursor-pointer"
        >{current ? "Unlock" : "Lock"}</p>
    )
}