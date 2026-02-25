"use client";

export function BarGraph({ series }: { series: Array<number> }) {
    const maxValue = Math.max(...series, 1);
    const bars = series.map((num: number, index: number) => {
        const heightPercent = (num / maxValue) * 100;
        return (
            <div
                title={String(num)}
                className="w-full bg-indigo-400 transition-all duration-300"
                style={{ height: `${heightPercent}%` }}
            />
        )
    })

    return (
        <div className="flex items-end gap-2 h-32">
            {bars}
        </div>
    );
}