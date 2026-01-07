export function NamePill({
    name,
    onClick
}: {
    name: string,
    onClick?: () => void
}) {
    return (
        <p
            className="bg-green-200 border border-green-300 rounded-md p-1 cursor-pointer transition duration-300 hover:bg-red-300 hover:border-red-400"
            onMouseDown={onClick}>
            {name}
        </p>
    );
}