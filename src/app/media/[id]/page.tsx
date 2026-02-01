import { redirect } from "next/navigation";
import { Metadata } from "next";
import moment from "moment";
import prisma from "lib/prisma";
import { createClient, getUserProfile } from "lib/supabase";

import { MediaRemove } from "@/components/moderation/MediaRemove";
import { MetadataField } from "@/components/ponysonas/MetadataField";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const mediaObject = await prisma.media.findUnique({ where: { id } });

    if (mediaObject === null)
        throw new Error("The media object requested could not be found.");

    return {
        title: `${mediaObject.id} | ponies.fyi`,
        openGraph: {
            images: [`https://static.ponies.fyi/${mediaObject.id}`]
        }
    } as Metadata;
}

export default async function MediaPage({
    params
}: {
    params: Promise<{
        id: string
    }>
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const profile = user ? await getUserProfile(user) : null;

    const { id } = await params;
    const mediaObject = await prisma.media.findUnique({ where: { id } });
    if (mediaObject === null)
        redirect("/?state=media_not_found");

    return (
        <div>
            <h1 className="text-3xl font-bold">{mediaObject.id}</h1>
            <hr className="h-px my-2 border-0 bg-gray-400/50" />
            <img src={`https://static.ponies.fyi/${id}`} alt={id} />
            <hr className="h-px my-2 border-0 bg-gray-400/50" />
            <div>
                <div>
                    <h2 className="text-2xl font-bold">Metadata</h2>
                    <MetadataField name="Description" value={mediaObject.description || "No description provided."} />
                    <MetadataField name="Size" value={mediaObject.size} />
                    <MetadataField name="Status" value={mediaObject.status} />
                    <MetadataField name="Media type" value={mediaObject.type} />
                    <MetadataField
                        name="Created"
                        value={`${mediaObject.createdAt.toLocaleDateString()} ${mediaObject.createdAt.toLocaleTimeString()} (${moment(mediaObject.createdAt).fromNow()})`}
                    />
                    <MetadataField
                        name="Last updated"
                        value={`${mediaObject.updatedAt.toLocaleDateString()} ${mediaObject.updatedAt.toLocaleTimeString()} (${moment(mediaObject.updatedAt).fromNow()})`}
                    />
                </div>
                {(profile && profile.isAdmin) && <div className="mt-2">
                    <h2 className="text-2xl font-bold">Actions</h2>
                    <MediaRemove media={mediaObject} />
                </div>}
            </div>
        </div>
    )
}