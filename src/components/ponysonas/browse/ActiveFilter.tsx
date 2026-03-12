"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { BodyPart } from "@/generated/enums";
import { colors } from "@/lib/colors";

export function ActiveFilter({ bodyPart, color }: {
    bodyPart: BodyPart,
    color: string
}) {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    function removeFilter() {
        const params = new URLSearchParams(searchParams.toString());
        const existingFilters = params.get("q")?.split(",") || [];
        params.set("q", existingFilters.filter((ef: string) => ef !== `${bodyPart}|${color}`).join(","));
        window.location.assign(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex items-center w-full relative group">
            <b className="flex-1">{bodyPart[0].toUpperCase().concat(bodyPart.slice(1))}</b>
            <div className="flex gap-2 items-center">
                <p>{color}</p>
                <div className="w-[12px] h-[12px]" style={{ backgroundColor: (colors as { [color: string]: string })[color] }} />
            </div>
            <X
                onMouseDown={removeFilter}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-red-500 ml-2 cursor-pointer"
            />
        </div>
    )
}