"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { colors } from "@/lib/colors";

export function ColorDropdown({
    onChange
}: {
    onChange?: (color: string) => void
}) {
    const [selected, setSelected] = useState<string>();
    const [colorName, setColorName] = useState<string>();
    const [active, setActive] = useState<boolean>(false);


    useEffect(() => {
        setActive(false);

        if (onChange && selected && selected.length > 0) {
            for (const [name, hex] of Object.entries(colors))
                if (hex === selected) {
                    setColorName(name);
                    onChange(name);
                }
        }
    }, [selected])

    return (
        <div>
            <div onMouseDown={() => setActive(!active)} className="flex w-fit">
                <div className="flex-1 flex items-center gap-1 cursor-pointer">
                    {selected ? (
                        <>
                            <div className="w-[12px] h-[12px]" style={{ backgroundColor: selected }} />
                            <p>{colorName}</p>
                        </>
                    ) : <p>Select a color</p>}
                </div>
                <ChevronDown />
            </div>
            {active && <div className="absolute z-99 bg-white grid h-[128px] overflow-y-scroll w-fit">
                {
                    Object.entries(colors).map(([name, color]) => (
                        <div
                            key={name}
                            onMouseDown={() => setSelected(color)}
                            className="flex items-center gap-1 py-1 cursor-pointer hover:bg-gray-300 transition-bg duration-50"
                        >
                            <div className="w-[12px] h-[12px]" style={{ backgroundColor: color }} />
                            <p>{name}</p>
                        </div>
                    ))
                }
            </div>}
        </div>
    );
}