"use client";

import { useEffect, useState } from "react";
import { Trash } from "lucide-react";

export function NewColor({
    defaultValue,
    onChange,
    onRemove
}: {
    defaultValue?: string,
    onChange?: (newColor: string) => void,
    onRemove?: () => void
}) {
    const [color, setColor] = useState<string>(defaultValue || "#000");

    useEffect(() => {
        if (onChange && color) onChange(color);
    }, [color])

    return (
        <div className="flex gap-2 items-center">
            <input
                type="color"
                defaultValue={color}
                onChange={(e) => setColor(e.target.value)}
            />
            <p>{color}</p>
            <Trash onMouseDown={onRemove} className="flex-1 cursor-pointer" />
        </div>
    )
}