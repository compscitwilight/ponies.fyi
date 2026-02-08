/**
 * Component for searching for ponysonas by using primary names.
 * Shows previews while actively typing.
 */

"use client";
import { Ponysona, Media } from "@/generated/client";
import { useState, useEffect } from "react";

export type AutocompleteResult = Ponysona & { media: Array<Media> };

export function AutocompletePonysonaResult({
    ponysona,
    onMouseDown
}: {
    ponysona: AutocompleteResult,
    onMouseDown?: () => void
}) {
    const preview = ponysona.media.find((m) => m.type === "preview");
    console.log(preview)
    return (
        <div className="flex gap-2 border border-gray-400/50 p-1 cursor-pointer transition-bg duration-200 hover:bg-gray-400/50" onMouseDown={onMouseDown}>
            {preview && <img className="h-[32px]" src={`https://static.ponies.fyi/${preview.id}`} />}
            <div>
                <h1 className="font-bold">{ponysona.primaryName}</h1>
            </div>
        </div>
    )
}

export function PonysonaSearch({
    id,
    onSelect
}: {
    id?: string,
    onSelect?: (ponysona: AutocompleteResult) => void
}) {
    const [query, setQuery] = useState<string>();
    const [searching, setSearching] = useState<boolean>(false);
    const [autocompleteResults, setAutocompleteResults] = useState<Array<AutocompleteResult>>(new Array<AutocompleteResult>());

    useEffect(() => {
        if (!query) return;

        const params = new URLSearchParams();
        params.set("q", query);

        setSearching(true);
        fetch(`/api/ponysonas/search?${params.toString()}`, { method: "GET" })
            .then((response) => {
                setSearching(false);
                return response.json();
            })
            .then(setAutocompleteResults);
    }, [query])

    return (
        <div>
            <input
                id={id}
                className="border border-gray-400/50 rounded-md w-full"
                onChange={(e) => setQuery(e.target.value)}
                defaultValue={query}
                type="text"
            />
            {/* autocompleted results */}
            {searching && <p>Searching...</p>}
            {(query && query.length > 0 && !searching) && <div className="border border-gray-400/50">
                {
                    autocompleteResults.length === 0 ? <p>No ponysonas found.</p> :
                        autocompleteResults.map((result: AutocompleteResult) =>
                            <AutocompletePonysonaResult
                                key={result.id}
                                ponysona={result}
                                onMouseDown={() => {
                                    setQuery(undefined);
                                    if (onSelect) onSelect(result);
                                }}
                            />
                        )
                }
            </div>}
        </div>
    )
}