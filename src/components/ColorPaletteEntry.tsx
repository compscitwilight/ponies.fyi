"use client";

export function ColorPaletteEntry({
    hex
}: { hex: string }) {
    hex = hex.trim();
    if (!hex.startsWith("#"))
        hex = "#".concat(hex);

    return (
        <div style={{
            backgroundColor: hex
        }} className="px-8 py-4">
            <div className="transition duration-200 hover:opacity-100 opacity-0"></div>
            <p className="relative">{hex}</p>
        </div>
    )
}