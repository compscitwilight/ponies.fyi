import { redirect } from "next/navigation";
import prisma from "lib/prisma";
import { createClient, getUserProfile } from "lib/supabase";
import { PonysonaRevision } from "@/generated/client";
import { PonysonaRevisionEntry } from "@/components/PonysonaRevisionEntry";

export default async function PonysonaRevisionsPage({
    params
}: {
    params: Promise<{ characterId: string }>
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const profile = user ? await getUserProfile(user) : null;

    const { characterId } = await params;
    const ponysona = await prisma.ponysona.findUnique({ where: { slug: characterId } });
    if (ponysona === null)
        redirect("/?state=ponysona_not_found");

    const revisions = await prisma.ponysonaRevision.findMany({
        where: { ponysonaId: ponysona.id },
        orderBy: { createdAt: "desc" }
    });
    
    return (
        <div>
            <h1 className="text-3xl font-bold">"{ponysona.primaryName}" revision history</h1>
            <hr className="h-px my-2 border-0 bg-gray-400/50" />
            {revisions.length > 0 ? <div className="grid gap-2">
                {revisions.map((revision: PonysonaRevision) =>
                    <PonysonaRevisionEntry key={revision.id} revision={revision} allowRevert={profile?.isAdmin} />
                )}
            </div> : <p className="text-center">No revisions found.</p>}
        </div>
    )
}