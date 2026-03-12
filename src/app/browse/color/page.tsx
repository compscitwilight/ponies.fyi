import { Metadata } from "next";
import { BodyPart } from "@/generated/enums";
import prisma from "lib/prisma";
import { NewColorFilter } from "@/components/ponysonas/browse/NewColorFilter";
import { PonysonaResult } from "@/components/PonysonaResult";
import { ActiveFilter } from "@/components/ponysonas/browse/ActiveFilter";

interface BrowseColorFilter {
    part: BodyPart,
    color: string
}

export const metadata: Metadata = {
    title: "Browse by color | ponies.fyi"
}

export default async function BrowseByColorPage({
    searchParams
}: {
    searchParams: Promise<{
        q?: string
    }>
}) {
    const { q: query } = await searchParams;
    const filters = query ? query.split(",")
        .filter((segment: string) => segment.split("|").length === 2)
        .map((segment: string) => ({
            part: segment.split("|")[0],
            color: segment.split("|")[1]
        }) as BrowseColorFilter) : new Array<BrowseColorFilter>();
    console.log(filters);

    const results = filters.length > 0 ? await prisma.ponysona.findMany({
        where: {
            AND: filters.map((filter: BrowseColorFilter) => ({
                colorTraits: {
                    some: {
                        part: filter.part,
                        colors: { has: filter.color }
                    }
                }
            }))
        },
        include: { attributes: true, tags: true }
    }) : [];

    console.log(filters.map((filter: BrowseColorFilter) => ({
        part: filter.part,
        colors: { has: filter.color }
    })));

    return (
        <div>
            <h1 className="text-3xl font-bold">Browse ponysonas by color</h1>
            <hr className="h-px my-2 border-0 bg-gray-400/50" />
            <div className="flex gap-8">
                {/* Filters Sidebar */}
                <div className="grid self-start gap-4">
                    <div>
                        <b>Add filter</b>
                        <NewColorFilter />
                    </div>
                    <div>
                        <b className="text-lg">Color / part filters:</b>
                        <div className="grid gap-1 items-center">
                            {filters.length === 0 && <p>No search filters.</p>}
                            {filters.length > 0 && (
                                filters.map((filter: BrowseColorFilter, index: number) => (
                                    <ActiveFilter key={index} bodyPart={filter.part} color={filter.color} />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h2 className="text-xl font-bold">Results {results.length > 0 && `(${results.length})`}</h2>
                    {filters.length > 0 ? (results.length > 0 ? (
                        <div className="grid mt-4 lg:grid-cols-3 gap-4">
                            {results.map((ponysona) =>
                                <PonysonaResult key={ponysona.id} ponysona={ponysona} />)}
                        </div>
                    ) : <p>No results could be found.</p>) : <p>Select color filters to search for ponysonas by color.</p>}
                </div>
            </div>
        </div>
    )
}