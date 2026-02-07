"use client";

import { Dices } from "lucide-react";

export function RandomPage() {
    function redirectToRandomPage() {
        fetch("/api/ponysonas/random", { method: "GET" })
            .then(async (response) => [response.ok, await response.json()])
            .then(([ok, json]) => {
                if (ok) window.location.assign(`/${json.slug}`);
                else alert(json.message);
            })
    }

    return (
        <div
            onMouseDown={redirectToRandomPage}
            className="cursor-pointer"
            title="Go to a random ponysona entry"
        >
            <Dices />
        </div>
    )
}