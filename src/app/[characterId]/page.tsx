import { Metadata, ResolvingMetadata, Viewport } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import moment from "moment";
import tinycolor from "tinycolor2";

import { getPonysonaPreview, getPonysonaMark, getPonysonaGallery } from "lib/ponysonas";
import prisma from "lib/prisma";
import { createClient, getUserProfile } from "lib/supabase";

import { Tag } from "@/components/Tag";
import { Pattern, Ponysona, PonysonaAppearanceAttribute, PonysonaTag } from "@/generated/client";
import { PonysonaResult } from "@/components/PonysonaResult";
import { PonysonaLockToggle } from "@/components/PonysonaLockToggle";
import { PonysonaStatusDropdown } from "@/components/moderation/PonysonaStatusDropdown";
import { PonysonaGallery } from "@/components/PonysonaGallery";
import { MetadataField } from "@/components/ponysonas/MetadataField";
import { Accessories } from "@/components/ponysonas/Accessories";
import { Description } from "@/components/ponysonas/Description";
import { HexCode } from "@/components/ponysonas/HexCode";

// designed to be compatible with both attributes and accessories
function AttributeField({
    name, colors, pattern
}: { name: string, colors: Array<string>, pattern?: Pattern }) {
    return (
        <div className="flex">
            <b className="flex-1 text-lg">{name[0].toUpperCase().concat(name.slice(1))}</b>
            <div className="flex flex-2 gap-2 items-center">
                <p>{pattern}</p>
                {
                    colors.map((color: string) =>
                        <HexCode color={color} />
                    )
                }
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

    description = description.concat("\n", ponysona.description || "no description provided");

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
        where: { ponysona: { slug: characterId } },
        orderBy: { bodyPart: "asc" }
    });
    return {
        themeColor: (firstAttribute && firstAttribute.colors.length > 0) ? firstAttribute.colors[0] : "#3bb47eff"
    };
}

export default async function CharacterPage({ params }: {
    params: Promise<{
        characterId: string
    }>
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const profile = user ? await getUserProfile(user) : null;

    const { characterId } = await params;
    const ponysona = await prisma.ponysona.findFirst({
        where: { slug: characterId },
        include: { attributes: true, accessories: true, tags: true }
    });

    if (ponysona === null)
        redirect(`/?state=ponysona_not_found`);

    const previewImageRes = await getPonysonaPreview(ponysona);
    const markImageRes = await getPonysonaMark(ponysona);
    const galleryObjects = await getPonysonaGallery(ponysona);

    const derivatives = await prisma.ponysona.findMany({
        where: { originalId: ponysona.id },
        include: { attributes: true, tags: true }
    });

    return (
        <div className="flex flex-col w-9/10 m-auto lg:flex-row lg:w-full gap-2">
            <div className="grid gap-4 flex-2">
                {/* Information */}
                <div className="rounded-lg border p-2 border-gray-400/50">
                    <div className="flex items-center mr-4">
                        <h1 className="flex-1 font-bold text-3xl">{ponysona.primaryName}</h1>
                        <div className="flex items-center gap-2">
                            <Link href={`/${ponysona.slug}/revisions`} className="text-green-600 underline">Revisions</Link>
                            {(user !== null) && <Link className="text-sky-600 underline" href={`/${ponysona.id}/edit`}>Edit</Link>}
                            {/* {(user !== null && profile?.isAdmin) && <form action={test}>
                            <button type="submit" className="text-yellow-600 underline cursor-pointer">Lock</button>
                        </form>} */}
                            {(profile && profile.isAdmin) && <>
                                <PonysonaLockToggle ponysona={ponysona} />
                                <PonysonaStatusDropdown ponysona={ponysona} />
                            </>}
                        </div>
                    </div>
                    {ponysona.otherNames.length > 0 && <div className="flex gap-1 items-center">
                        <h2 className="text-lg">Other names:</h2>
                        <p className="font-bold">{ponysona.otherNames.join(", ")}</p>
                    </div>}

                    {/* Tags */}
                    <div className="flex gap-1 items-center">
                        {ponysona.tags.map((tag: PonysonaTag) =>
                            <Tag key={tag.id} tag={tag} redirect />
                        )}
                    </div>

                    {/* Attributes */}
                    {ponysona.attributes.length > 0 && <>
                        <h2 className="mt-4 text-lg font-lexie-bold">Attributes</h2>
                        <hr className="h-px my-2 border-0 bg-gray-400/50" />
                        <div>
                            {ponysona.attributes.map((attribute: PonysonaAppearanceAttribute) =>
                                <AttributeField key={attribute.id} name={attribute.bodyPart} colors={attribute.colors} pattern={attribute.pattern} />
                            )}
                        </div>
                    </>}

                    {/* Accessories */}
                    <div className="mt-2">
                        <Accessories
                            ponysona={ponysona}
                            accessories={ponysona.accessories}
                            allowEditing={user !== null}
                        />
                    </div>

                    {/* Description */}
                    <h2 className="mt-4 text-lg font-lexie-bold">Description</h2>
                    <hr className="h-px my-2 border-0 bg-gray-400/50" />
                    {ponysona.description ? <Description description={ponysona.description} /> : <i>No description provided.</i>}

                    {/* Metadata */}
                    <h2 className="mt-4 text-lg font-lexie-bold">Metadata</h2>
                    <hr className="h-px my-2 border-0 bg-gray-400/50" />
                    <MetadataField name="Internal ID" value={ponysona.id} />
                    <MetadataField name="Creators" value={ponysona.creators.length > 0 ? ponysona.creators.join(", ") : "not provided"} />
                    <MetadataField name="Sources" value={ponysona.sources.length > 0 ? ponysona.sources.join(", ") : "not provided"} />
                    <MetadataField name="Status" value={ponysona.status} />
                    {
                        ponysona.submittedById &&
                        <MetadataField name="Added by" value={`User ${ponysona.submittedById}`} />
                    }
                    <MetadataField name="Added to ponies.fyi" value={`${ponysona.createdAt.toLocaleDateString()} ${ponysona.createdAt.toLocaleTimeString()} (${moment(ponysona.createdAt).fromNow()})`} />
                    <MetadataField name="Last modified" value={`${ponysona.updatedAt.toLocaleDateString()} ${ponysona.updatedAt.toLocaleTimeString()} (${moment(ponysona.updatedAt).fromNow()})`} />

                    {/* Derivatives */}
                    <h2 className="mt-4 text-lg font-lexie-bold">Derivatives</h2>
                    <hr className="h-px my-2 border-0 bg-gray-400/50" />
                    {
                        derivatives.length > 0 ? (
                            <div>
                                {
                                    derivatives.map((derivative: Ponysona & { attributes: Array<PonysonaAppearanceAttribute>, tags: Array<PonysonaTag> }) =>
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

                {/* Gallery */}
                <PonysonaGallery
                    ponysona={ponysona}
                    gallery={galleryObjects}
                    mediaUploads={profile === null || profile.canUpload}
                />
            </div>

            {/* Media */}
            <div className="grid grid-cols-2 lg:grid-cols-1 lg:w-auto w-full flex-1 self-start order-first lg:order-last rounded-lg border p-2 border-gray-400/50">
                <div>
                    <label className="text-lg font-bold" htmlFor="character-preview">Preview</label>
                    {previewImageRes ?
                        <Link href={`/media/${previewImageRes.id}`}>
                            <img id="character-preview" src={`/api/ponysonas/${ponysona.id}/preview`} />
                        </Link> :
                        <p>No preview image provided</p>}
                </div>
                <div>
                    <label className="text-lg font-bold" htmlFor="character-mark">Cutie Mark</label>
                    {markImageRes ?
                        <Link href={`/media/${markImageRes.id}`}>
                            <img id="character-mark" src={`/api/ponysonas/${ponysona.id}/mark`} />
                        </Link> :
                        <p>No cutie mark provided.</p>}
                </div>
            </div>
        </div>
    )
}