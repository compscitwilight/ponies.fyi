import prisma from "lib/prisma";

import { Tag } from "@/components/Tag";
import { PonysonaTag } from "@/generated/client";

export default async function CharacterPage({ params }: {
    params: Promise<{
        characterId: string
    }>
}) {
    const { characterId } = await params;
    const ponysona = await prisma.ponysona.findFirst({
        where: { slug: characterId }
    });

    if (ponysona === null)
        return (
            <div>
                <p>not found</p>
            </div>
        );

    const tags = new Array<PonysonaTag>();
    for (const id of ponysona.tagIds) {
        const tag = await prisma.ponysonaTag.findUnique({ where: { id } });
        if (tag === null) continue;
        tags.push(tag);
    }

    return (
        <div className="flex gap-2">
            <div className="flex-2 rounded-lg border p-2 border-gray-400/50">
                <h1 className="font-bold text-3xl">{ponysona.primaryName}</h1>
                {ponysona.otherNames.length > 0 && <div className="flex gap-1 items-center">
                    <h2 className="text-lg">Other names:</h2>
                    <p className="font-bold">{ponysona.otherNames.join(", ")}</p>
                </div>}
                <div className="flex gap-1 items-center">
                    {tags.map((tag: PonysonaTag, index: number) =>
                        <Tag key={index} tag={tag} />
                    )}
                </div>

                <h2 className="mt-4 text-lg font-bold">Description</h2>
                <hr className="h-px my-2 border-0 bg-gray-400/50" />
                
            </div>
            <div className="flex-1 rounded-lg border p-2 border-gray-400/50">
                <img className="" src={`/api/ponysonas/${ponysona.id}/preview`} />
                {characterId}
            </div>
        </div>
    )
}