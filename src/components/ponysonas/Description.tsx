export function Description({ description }: { description: string }) {
    return (
        <div className="grid gap-1">
            {
                description.split("\n").map((line: string, index: number) =>
                    <span key={index}>{line}</span>
                )
            }
        </div>
    )
}