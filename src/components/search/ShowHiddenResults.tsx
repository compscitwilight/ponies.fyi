"use client";

import { useSearchParams } from "next/navigation";

export function ShowHiddenResults() {
	const params = useSearchParams();
    function onToggle() {
        const searchParams = new URLSearchParams(params);
        const prevValue = searchParams.get("hidden_results");
		if (prevValue !== "true") {
			searchParams.set("hidden_results", "true");
		} else searchParams.delete("hidden_results");
        window.location.assign(`/?${searchParams.toString()}`);
    }

    return (
        <div className="flex gap-1 items-center">
            <label
                htmlFor="show-hidden-results"
                className="text-lg font-bold"
            >Show hidden results</label>
            <input
				onChange={onToggle}
				id="show-hidden-results"
				defaultChecked={params.get("hidden_results") === "true"}
				type="checkbox"
			/>
        </div>
    )
}
