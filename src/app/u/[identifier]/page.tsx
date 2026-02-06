import { Metadata } from "next";
import prisma from "lib/prisma";
import { createClient } from "lib/supabase";
import { redirect } from "next/navigation";

async function getUserProfileByID(id: string) {
    return await prisma.profile.findFirst({
        where: {
            OR: [
                { userId: id },
                { alias: id }
            ]
        }
    });
}

export async function generateMetadata({ params }: {
    params: Promise<{ identifier: string }>
}): Promise<Metadata | undefined> {
    const { identifier } = await params;
    const profile = await getUserProfileByID(identifier);
    if (profile) return {
        title: `${profile.alias || `User ${profile.userId}`} | ponies.fyi`
    };
}

export default async function UserProfilePage({ params }: {
    params: Promise<{ identifier: string }>
}) {
    const { identifier } = await params;
    const profile = await getUserProfileByID(identifier);

    if (profile === null)
        redirect("/?state=user_not_found");

    const ponysonasAdded = await prisma.ponysona.count({ where: { submittedById: profile.userId } });
    const revisionsCreated = await prisma.ponysonaRevision.count({ where: { createdById: profile.userId } });

    return (
        <div>
            <div className="p-2 border border-gray-400/50 rounded-md">
                <div className="flex gap-2 items-center">
                    <h2 className="text-2xl font-bold">{profile.alias || `User ${profile.userId}`}</h2>
                    {profile.isAdmin &&
                        <p className="border rounded-md w-fit p-1 text-sm bg-purple-100 text-purple-500 font-bold">admin</p>
                    }
                </div>
                <div className="flex gap-4 flex-wrap">
                    <div className="flex gap-1 items-center">
                        <p className="text-lg font-bold">Ponysonas added</p>
                        <p>{ponysonasAdded}</p>
                    </div>
                    <div className="flex gap-1 items-center">
                        <p className="text-lg font-bold">Revisions created</p>
                        <p>{revisionsCreated}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}