import { Ponysona } from "@/generated/client";
import { PonysonaStatus } from "@/generated/enums";
import prisma from "lib/prisma";

import { PendingPonysonaEntry } from "@/components/moderation/PendingPonysonaEntry";
import { SiteSettingsList } from "@/components/moderation/SiteSettingSettingsList";

export default async function ModerationPage() {
    const pendingPonysonas = await prisma.ponysona.findMany({
        where: {
            NOT: { status: PonysonaStatus.Approved }
        },
        orderBy: {
            updatedAt: "asc"
        }
    });

    const siteSettings = await prisma.siteSettings.findMany({
        orderBy: { key: "asc" }
    });

    return (
        <div className="grid gap-4 mt-2">
            <SiteSettingsList settings={siteSettings} />
            <div>
                <h2 className="text-2xl font-bold">Pending ponysonas</h2>
                <hr className="h-px my-2 border-0 bg-gray-400/50" />
                {pendingPonysonas.length > 0 ? pendingPonysonas.map((ponysona: Ponysona) =>
                    <PendingPonysonaEntry key={ponysona.id} ponysona={ponysona} />
                ) : <i>No ponysonas could be found.</i>}
            </div>
        </div>
    )
}