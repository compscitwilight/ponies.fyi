import Link from "next/link";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/client";

import { PonysonaStatus } from "@/generated/enums";
import prisma from "lib/prisma";
import { createClient } from "lib/supabase";
import { Ponysona } from "@/generated/client";
import { ListPonysonaResult } from "@/components/ponysonas/ListPonysonaResult";

const MAX_RESULTS = 50;

export default async function SubmissionsPage({ searchParams }: {
    searchParams: Promise<{
        page?: string,
        show?: string
    }>
}) {
    const { show, page } = await searchParams;
    if (show && !Object.values(PonysonaStatus).includes(show as any))
        redirect("/pages/submissions");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user === null) redirect("/?state=unauthorized");

    const where: Prisma.PonysonaWhereInput = {
        submittedById: user.id,
        ...(show !== undefined && {
            status: show as PonysonaStatus
        })
    }

    const submissions = await prisma.ponysona.findMany({
        where,
        take: MAX_RESULTS,
        skip: MAX_RESULTS * (Math.max(1, Number(parseInt(page ?? "1"))) - 1),
        orderBy: { updatedAt: "desc" }
    });

    const totalCount = await prisma.ponysona.count({ where });
    const totalPages = Math.max(1, Math.ceil(totalCount / MAX_RESULTS))

    const pageNavLinks = new Array();
    for (let i = 0; i < totalPages; i++)
        pageNavLinks.push(<Link
            className="text-lg font-bold text-sky-600 underline"
            key={i}
            href={`?page=${i + 1}`}
        >{i + 1}</Link>);

    return (
        <div>
            <h1 className="text-3xl font-bold">Submissions</h1>
            <p>
                You've submitted {totalCount} {show ? show.toLowerCase() : "total"} {totalCount === 1 ? "ponysona" : "ponysonas"}.
            </p>
            <hr className="my-2 h-px border-0 bg-gray-400/50" />
            <div className="flex flex-col lg:flex-row gap-2">
                <div className="self-start border border-gray-400/50 rounded-md p-2">
                    <div className="grid gap-2">
                        <Link href="/pages/submissions" className={`flex gap-1 items-center ${!show && "bg-neutral-200"}`}>
                            <div className="w-[16px] h-[16px] opacity-0" />
                            <b>All submissions</b>
                        </Link>
                        <Link href="?show=Approved" className={`flex gap-1 items-center ${show === "Approved" && "bg-neutral-200"}`}>
                            <div className="w-[16px] h-[16px] bg-emerald-500" />
                            <b>Approved submissions</b>
                        </Link>
                        <Link href="?show=Pending" className={`flex gap-1 items-center ${show === "Pending" && "bg-neutral-200"}`}>
                            <div className="w-[16px] h-[16px] bg-yellow-500" />
                            <b>Pending submissions</b>
                        </Link>
                        <Link href="?show=Hidden" className={`flex gap-1 items-center ${show === "Hidden" && "bg-neutral-200"}`}>
                            <div className="w-[16px] h-[16px] bg-gray-500" />
                            <b>Hidden submissions</b>
                        </Link>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 mb-6">
                    <div className="flex gap-1 items-center mb-2">
                        {...pageNavLinks}
                    </div>
                    {submissions.length > 0 ? <div className="grid gap-2">
                        {submissions.map((submission: Ponysona) =>
                            <ListPonysonaResult key={submission.id} data={submission} />
                        )}
                    </div> : <p className="text-center">No results could be found.</p>}
                </div>
            </div>
        </div>
    )
}