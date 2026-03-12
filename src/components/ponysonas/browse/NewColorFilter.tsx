"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { BodyPart } from "@/generated/enums";
import { ColorDropdown } from "@/components/ponysonas/browse/ColorDropdown";

export function NewColorFilter() {
    const [bodyPart, setBodyPart] = useState<BodyPart>(Object.values(BodyPart)[0]);
    const [color, setColor] = useState<string>();

    const pathname = usePathname();
    const searchParams = useSearchParams();
    console.log(searchParams);
    function onFilterAdd() {
        if (!bodyPart || !color) {
            alert("Please select a body part and color.");
            return;
        }

        const params = new URLSearchParams(searchParams.toString());
        const query = params.get("q");
        params.set("q", `${query ? query.concat(",") : ""}${bodyPart}|${color}`);
        console.log(`${pathname}?${params.toString()}`);
        window.location.assign(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex gap-2 items-center">
            <select onChange={(e) => setBodyPart(e.target.value as BodyPart)} className="cursor-pointer">
                {Object.keys(BodyPart).map((bp: string) =>
                    <option value={bp}>{bp[0].toUpperCase().concat(bp.slice(1))}</option>
                )}
            </select>
            <ColorDropdown onChange={setColor} />
            <button onMouseDown={onFilterAdd} className="bg-emerald-500 px-2 py-1 rounded-md text-white cursor-pointer">Add</button>
        </div>
    )
}