"use client";

// import { useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";

import { ArrowLeft, ArrowRight } from "lucide-react";

export function PageNavigation({
    currentPage,
    totalPages
}: {
    currentPage: number,
    totalPages: number
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    function goToPage(nextPage: number) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(nextPage));
        window.location.assign(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            {currentPage > 1 &&
                <ArrowLeft
                    className="cursor-pointer"
                    onMouseDown={() => goToPage(currentPage - 1)}
                />
            }
            <p className="text-lg font-bold">Page {currentPage} of {totalPages}</p>
            {currentPage < totalPages &&
                <ArrowRight
                    className="cursor-pointer"
                    onMouseDown={() => goToPage(currentPage + 1)}
                />
            }
        </div>
    )
}