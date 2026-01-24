import prisma from "lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Tag } from "@/components/Tag";
import { Ponysona, PonysonaAppearanceAttribute, PonysonaTag } from "@/generated/client";
import { ColorPaletteEntry } from "@/components/ColorPaletteEntry";
import { PonysonaResult } from "@/components/PonysonaResult";

function MetadataField({
    name, value, className
}: { name: string, value: any, className?: string }) {
    return (
        <div className={className || "flex"}>
            <b className="flex-1">{name}</b>
            <p className="flex-2">{value}</p>
        </div>
    )
}

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
        redirect(`/?state=not_found&q=${characterId}`);

    const attributes = await prisma.ponysonaAppearanceAttribute.findMany({
        where: { ponysonaId: ponysona.id }
    });

    const derivatives = await prisma.ponysona.findMany({
        where: { originalId: ponysona.id }
    });

    const tags = new Array<PonysonaTag>();
    for (const id of ponysona.tagIds) {
        const tag = await prisma.ponysonaTag.findUnique({ where: { id } });
        if (tag === null) continue;
        tags.push(tag);
    }

    const colors = attributes.map((att: PonysonaAppearanceAttribute) => att.color);

    return (
        <div className="flex gap-2">
            <div className="flex-2 rounded-lg border p-2 border-gray-400/50">
                <h1 className="font-bold text-3xl">{ponysona.primaryName}</h1>
                {ponysona.otherNames.length > 0 && <div className="flex gap-1 items-center">
                    <h2 className="text-lg">Other names:</h2>
                    <p className="font-bold">{ponysona.otherNames.join(", ")}</p>
                </div>}
                <div className="flex gap-1 items-center">
                    {tags.map((tag: PonysonaTag) =>
                        <Tag key={tag.id} tag={tag} />
                    )}
                </div>

                {attributes.length > 0 && <>
                    <h2 className="mt-4 text-lg font-bold">Attributes</h2>
                    <hr className="h-px my-2 border-0 bg-gray-400/50" />
                    <div>
                        {/* {attributes.map((attribute: PonysonaAppearanceAttribute) => )} */}
                    </div>
                </>}

                {colors.length > 0 && <>
                    <h2 className="mt-4 text-lg font-bold">Color Palette</h2>
                    <hr className="h-px my-2 border-0 bg-gray-400/50" />
                    <div>
                        {colors.map((color: string) =>
                            <ColorPaletteEntry key={color} hex={color} />
                        )}
                    </div>
                </>}


                <h2 className="mt-4 text-lg font-bold">Description</h2>
                <hr className="h-px my-2 border-0 bg-gray-400/50" />
                {
                    ponysona.description ? <p>{ponysona.description}</p> : <i>No description provided.</i>
                }

                <h2 className="mt-4 text-lg font-bold">Metadata</h2>
                <hr className="h-px my-2 border-0 bg-gray-400/50" />
                <MetadataField name="Creators" value={ponysona.creators.length > 0 ? ponysona.creators.join(", ") : "not provided"} />
                <MetadataField name="Sources" value={ponysona.sources.length > 0 ? ponysona.sources.join(", ") : "not provided"} />
                <MetadataField name="Status" value={ponysona.status} />
                <MetadataField name="Added to ponies.fyi" value={`${ponysona.createdAt.toLocaleDateString()} ${ponysona.createdAt.toLocaleTimeString()}`} />
                <MetadataField name="Last modified" value={`${ponysona.updatedAt.toLocaleDateString()} ${ponysona.updatedAt.toLocaleTimeString()}`} />

                <h2 className="mt-4 text-lg font-bold">Derivatives</h2>
                <hr className="h-px my-2 border-0 bg-gray-400/50" />
                {
                    derivatives.length > 0 ? (
                        <div>
                            {
                                derivatives.map((derivative: Ponysona) =>
                                    <PonysonaResult key={derivative.id} ponysona={derivative} />
                                )
                            }
                        </div>
                    ) : (
                        <div className="font-bold">
                            <p>No derivative ponysonas could be found.</p>
                            <Link
                                className="text-sky-600 underline"
                                href={`/pages/create?derivativeof=${ponysona.id}`}
                            >Consider adding one if relevant!</Link>
                        </div>
                    )
                }
            </div>
            <div className="flex-1 rounded-lg border p-2 border-gray-400/50">
                <img className="" src={`/api/ponysonas/${ponysona.id}/preview`} />
                {characterId}
            </div>
        </div>
    )
}