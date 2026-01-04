import prisma from "lib/prisma";

export default async function CharacterPage({ params }: {
    params: Promise<{
        characterId: string
    }>
}) {
    const { characterId } = await params;
    const ponysona = await prisma.ponysona.findUnique({ where: { id: characterId } });
    if (ponysona === null)
        return (
            <div>
                <p>not found</p>
            </div>
        );

    return (
        <div className="flex gap-2">
            <div className="flex-2 rounded-lg border p-2 border-gray-400/50">
                {ponysona.primaryName}
            </div>
            <div className="flex-1 rounded-lg border p-2 border-gray-400/50">
                {characterId}
            </div>
        </div>
    )
}