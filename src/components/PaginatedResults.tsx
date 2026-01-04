"use client";

import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Ponysona } from "@/generated/client";
import { PonysonaResult } from "./PonysonaResult";

export function PaginatedResults({ items, page, pageSize, totalCount }: {
    items: Array<Ponysona>
    page: number,
    pageSize: number,
    totalCount: number
}) {
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    function goToPage(nextPage: number) {
        const router = useRouter();
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(nextPage));
        startTransition(() => {
            router.push(`?${params.toString()}`);
        })
    }

    return (
        <div>
            {items.length > 0 && <div className="grid lg:grid-cols-3 gap-2">
                {
                    items.map((item: Ponysona, index: number) =>
                        <PonysonaResult key={index} ponysona={item} />
                    )
                }
            </div>}

            {items.length === 0 && (
                <div className="text-center text-gray-700">
                    <p>No results found.</p>
                </div>
            )}

            {/* nav */}
            <div className="flex items-center justify-center gap-2">
                {page > 1 && <ArrowLeft onMouseDown={() => goToPage(page - 1)} />}
                {page < totalPages && <ArrowRight onMouseDown={() => goToPage(page + 1)} />}
            </div>
        </div>
    )
}