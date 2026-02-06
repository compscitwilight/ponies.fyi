"use client";

import { useSearchParams, usePathname } from "next/navigation";

export function MaxResultsDropdown() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    return (
        <div className="flex gap-1">
            <label className="text-lg font-bold" htmlFor="max-results-dropdown">Max results</label>
            <select
                id="max-results-dropdown"
                className="border border-gray-400/50 rounded-md p-1 cursor-pointer"
                defaultValue={searchParams.get("max_results") || "15"}
                onChange={(e) => {
                    const value = e.target.value;
                    const params = new URLSearchParams(searchParams);
                    params.set("max_results", value);
                    window.location.assign(`${pathname}?${params.toString()}`);
                }}
            >
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
        </div>
    )
}