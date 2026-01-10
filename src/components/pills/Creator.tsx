export function CreatorPill({
    creator,
    onClick
}: {
    creator: string,
    onClick?: () => void
}) {
    return (
        <p
            className="bg-orange-200 border border-orange-300 rounded-md p-1 cursor-pointer transition duration-300 hover:bg-red-300 hover:border-red-400"
            onMouseDown={onClick}>
            {creator}
        </p>
    );
}