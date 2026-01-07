export function SourcePill({
    source,
    onClick
}: {
    source: string,
    onClick?: () => void
}) {
    return (
        <p
            className="bg-blue-300 border border-blue-400 rounded-md p-1 cursor-pointer transition duration-300 hover:bg-red-300 hover:border-red-400"
            onMouseDown={onClick}
        >
            {source}
        </p>
    );
}