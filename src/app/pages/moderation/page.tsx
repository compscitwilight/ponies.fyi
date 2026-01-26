import { Ponysona } from "@/generated/client";
import { PonysonaStatus } from "@/generated/enums";
import prisma from "lib/prisma";

import { PendingPonysonaEntry } from "@/components/moderation/PendingPonysonaEntry";

export default async function ModerationPage() {
    const pendingPonysonas = await prisma.ponysona.findMany({
        where: {
            NOT: { status: PonysonaStatus.Approved }
        },
        orderBy: {
            updatedAt: "asc"
        }
    });

    return pendingPonysonas.length === 0 ? (
        <div>
            <p className="text-center">No ponysonas could be found.</p>
        </div>
    ) : (
        <div>
            <h2 className="text-2xl font-bold">Pending ponysonas</h2>
            <hr className="h-px my-2 border-0 bg-gray-400/50" />
            {pendingPonysonas.map((ponysona: Ponysona) =>
                <PendingPonysonaEntry key={ponysona.id} ponysona={ponysona} />
            )}
        </div>
    )
}