"use client";

import tinycolor from "tinycolor2";

export function HexCode({ color }: { color: string }) {
    return (
        <div
            key={color}
            className="text-xs font-bold p-2 border border-gray-500"
            style={{
                backgroundColor: color,
                color: tinycolor(color).isDark() ? "#dbdbdbff" : "#000"
            }}
        >
            {color}
        </div>
    )
}