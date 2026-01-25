import { Metadata, ResolvingMetadata, Viewport } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getPonysonaPreview, getPonysonaMark, getPonysonaGallery } from "lib/ponysonas";
import prisma from "lib/prisma";

import { Tag } from "@/components/Tag";
import { Pattern, Ponysona, PonysonaAppearanceAttribute, PonysonaTag } from "@/generated/client";
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

// designed to be compatible with both attributes and accessories
function AttributeField({
    name, color, pattern 
}: { name: string, color: string, pattern?: Pattern }) {
    return (
        <div className="flex">
            <b className="flex-1">{name}</b>
            <div className="flex flex-2 gap-2 items-center">
                <p>{pattern}</p>
                <div
                    className="text-xs text-gray-400 p-2 border border-black"
                    style={{ backgroundColor: color }}
                >{color}</div>
            </div>
        </div>
    )
}

// internally used by next.js
export async function generateMetadata(
    { params }: {
        params: Promise<{ characterId: string }>
    },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { characterId } = await params;
    const ponysona = await prisma.ponysona.findUnique({ where: { slug: characterId } });

    if (ponysona === null) throw new Error("Failed to retrieve ponysona metadata");

    const previewObject = await getPonysonaPreview(ponysona);

    let description = new String();
    description = description.concat(ponysona.primaryName);
    if (ponysona.otherNames.length > 0)
        description = description.concat(` (other names: ${ponysona.otherNames.join(", ")}), `);

    description = description.concat(ponysona.description || "no description provided");

    return {
        title: `${ponysona.primaryName} | ponies.fyi`,
        description: description as string,
        ...((previewObject !== null) && {
            openGraph: {
                images: [`https://static.ponies.fyi/${previewObject.id}`]
            }
        })
    }
}

export async function generateViewport({ params }: {
    params: Promise<{
        characterId: string
    }>
}): Promise<Viewport> {
    const { characterId } = await params;
    const firstAttribute = await prisma.ponysonaAppearanceAttribute.findFirst({
        where: { ponysonaId: characterId },
        take: 1,
        orderBy: { bodyPart: "asc" }
    });

    return {
        themeColor: firstAttribute ? firstAttribute.color : "#3bb47eff"
    };
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
        redirect(`/?state=ponysona_not_found`);

    const previewImageRes = await getPonysonaPreview(ponysona);
    const markImageRes = await getPonysonaMark(ponysona);
    // const galleryObjects = await getPonysonaGallery(ponysona);

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
        <div className="flex flex-col w-9/10 m-auto lg:flex-row lg:w-full gap-2">
            {/* Information */}
            <div className="flex-2 rounded-lg border p-2 border-gray-400/50">
                <div className="flex items-center mr-4">
                    <h1 className="flex-1 font-bold text-3xl">{ponysona.primaryName}</h1>
                    <div className="flex items-center gap-2">
                        <Link className="text-sky-600 underline" href={`/${ponysona.id}/edit`}>Edit</Link>
                        <Link className="text-red-600 underline" href={`/${ponysona.id}/report`}>Report</Link>
                    </div>
                </div>
                {ponysona.otherNames.length > 0 && <div className="flex gap-1 items-center">
                    <h2 className="text-lg">Other names:</h2>
                    <p className="font-bold">{ponysona.otherNames.join(", ")}</p>
                </div>}

                {/* Tags */}
                <div className="flex gap-1 items-center">
                    {tags.map((tag: PonysonaTag) =>
                        <Tag key={tag.id} tag={tag} redirect />
                    )}
                </div>

                {/* Attributes */}
                {attributes.length > 0 && <>
                    <h2 className="mt-4 text-lg font-bold">Attributes</h2>
                    <hr className="h-px my-2 border-0 bg-gray-400/50" />
                    <div>
                        {attributes.map((attribute: PonysonaAppearanceAttribute) =>
                            <AttributeField key={attribute.id} name={attribute.bodyPart} color={attribute.color} pattern={attribute.pattern} />
                        )}
                    </div>
                </>}

                {/* Description */}
                <h2 className="mt-4 text-lg font-bold">Description</h2>
                <hr className="h-px my-2 border-0 bg-gray-400/50" />
                {
                    ponysona.description ? <p>{ponysona.description}</p> : <i>No description provided.</i>
                }

                {/* Metadata */}
                <h2 className="mt-4 text-lg font-bold">Metadata</h2>
                <hr className="h-px my-2 border-0 bg-gray-400/50" />
                <MetadataField name="Internal ID" value={ponysona.id} />
                <MetadataField name="Creators" value={ponysona.creators.length > 0 ? ponysona.creators.join(", ") : "not provided"} />
                <MetadataField name="Sources" value={ponysona.sources.length > 0 ? ponysona.sources.join(", ") : "not provided"} />
                <MetadataField name="Status" value={ponysona.status} />
                <MetadataField name="Added to ponies.fyi" value={`${ponysona.createdAt.toLocaleDateString()} ${ponysona.createdAt.toLocaleTimeString()}`} />
                <MetadataField name="Last modified" value={`${ponysona.updatedAt.toLocaleDateString()} ${ponysona.updatedAt.toLocaleTimeString()}`} />

                {/* Derivatives */}
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

            {/* Media */}
            <div className="grid grid-cols-2 lg:grid-cols-1 lg:w-auto w-full flex-1 self-start order-first lg:order-last rounded-lg border p-2 border-gray-400/50">
                <div>
                    <label className="text-lg font-bold" htmlFor="character-preview">Preview</label>
                    {previewImageRes ?
                        <img id="character-preview" src={`/api/ponysonas/${ponysona.id}/preview`} /> :
                        <p>No preview image provided</p>}
                </div>
                <div>
                    <label className="text-lg font-bold" htmlFor="character-mark">Cutie Mark</label>
                    {markImageRes ?
                        <img id="character-mark" src={`/api/ponysona/${ponysona.id}/mark`} /> :
                        <p>No cutie mark provided.</p>}
                </div>
            </div>
        </div>
    )
}