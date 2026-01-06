"use client";

import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { Color, ColorTone, Pattern, Ponysona, PonysonaTag } from "@/generated/client";
import { Asterisk } from "lucide-react";

interface PonysonaAttributePayload {
    color: Color,
    tone: ColorTone,
    pattern: Pattern
}

const RequiredAsterisk = () => <Asterisk size={18} className="text-red-400" />;

export default function CreatePage() {
    const [primaryName, setPrimaryName] = useState<string>();
    const [otherNames, setOtherNames] = useState<Array<string>>(new Array<string>());
    const [description, setDescription] = useState<string>();
    const [tagIds, setTagIds] = useState<Array<number>>(new Array<number>());
    const [sources, setSources] = useState<Array<string>>(new Array<string>());
    const [creators, setCreators] = useState<Array<string>>(new Array<string>());
    const [colorsHex, setColorsHex] = useState<Array<string>>(new Array<string>());
    const [colorsName, setColorsName] = useState<Array<string>>(new Array<string>());
    const [attributes, setAttributes] = useState<Array<{
        mane?: PonysonaAttributePayload,
        tail?: PonysonaAttributePayload,
        coat?: PonysonaAttributePayload,
        wings?: PonysonaAttributePayload,
        horn?: PonysonaAttributePayload,
        eyes?: PonysonaAttributePayload
    }>>({} as any);

    const [includeOtherNames, setIncludeOtherNames] = useState<boolean>(false);
    const [otherNameVal, setOtherNameVal] = useState<string>("");
    const [availableTags, setAvailableTags] = useState<Array<PonysonaTag>>(new Array<PonysonaTag>());
    const [submitError, setSubmitError] = useState<string>();

    function onFormSubmit(ev: FormEvent) {
        const searchParams = useSearchParams();
        const router = useRouter();
        ev.preventDefault();
        fetch("/api/ponysonas/new", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                primaryName,
                otherNames,
                description,
                tagIds,
                sources,
                creators,
                colorsHex,
                colorsName,
                attributes
            })
        })
            .then((response) => response.json())
            .then((json: any) => {
                if (json.message) setSubmitError(json.message);
                else {
                    const result = json as Ponysona;
                    router.push(`/${result.slug}`);
                }
            })
    }

    function addOtherName() {
        if (!otherNameVal) return;
        setOtherNames(on => [...on, otherNameVal]);
        setOtherNameVal("");
    }

    function removeOtherName(name: string) {
        if (!otherNames.includes(name)) return;
        setOtherNames(on => on.filter((e: string) => e !== name));
    }

    useEffect(() => {
        fetch("/api/tags", { method: "GET" })
            .then((response) => response.json())
            .then((json: any) => {
                if (json.message) {
                    console.warn(`Failed to retrieve tags: ${json.message}`);
                    return;
                }

                const tagResults = json as Array<PonysonaTag>;
                setAvailableTags(tagResults);
            })
    }, [setAvailableTags])

    return (
        <div>
            <h1 className="text-3xl font-bold">Submit a ponysona</h1>
            <hr className="h-px my-2 border-0 bg-gray-300" />
            <form onSubmit={onFormSubmit} className="flex flex-col gap-2">
                <div className="grid gap-1">
                    <div className="flex gap-1">
                        <label className="font-bold">Primary name</label>
                        <RequiredAsterisk />
                    </div>
                    <input className="rounded-md p-1 border border-gray-300" onChange={(e) => setPrimaryName(e.target.value)} type="text" required />
                </div>
                <div className="flex gap-2">
                    <label htmlFor="include-other-names" className="font-bold">Include other names</label>
                    <input onChange={(e) => setIncludeOtherNames(e.target.checked)} id="include-other-names" type="checkbox" />
                </div>
                {includeOtherNames && (
                    <div className="grid gap-1 p-2 rounded-md border border-gray-300">
                        <div className="flex gap-1">
                            {
                                otherNames.map((name: string, index: number) =>
                                    <p
                                        onMouseDown={() => removeOtherName(name)}
                                        className="bg-green-200 border border-green-300 rounded-md p-1 cursor-pointer transition duration-300 hover:bg-red-300 hover:border-red-400"
                                        key={index}
                                    >{name}</p>
                                )
                            }
                        </div>
                        <div className="grid gap-1 p-2">
                            <label htmlFor="other-name-field" className="font-bold">Other names</label>
                            <div className="flex gap-1">
                                <input
                                    id="other-name-field"
                                    placeholder="Type a name and press 'Enter'"
                                    className="flex-1 rounded-md p-1 border border-gray-300"
                                    onChange={(e) => setOtherNameVal(e.target.value)}
                                    onKeyDown={(e) => {
                                        console.log(e.key);
                                        if (e.key === "Enter") addOtherName();
                                    }}
                                    value={otherNameVal}
                                    type="text"
                                    required
                                />
                                <button
                                    onMouseDown={addOtherName}
                                    className="rounded-md border border-gray-400/50 px-2 cursor-pointer"
                                    type="button"
                                >Add</button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="grid gap-1 mt-4">
                    <label htmlFor="description-field" className="font-bold">Description (optional)</label>
                    <textarea
                        className="resize-none rounded-md border border-gray-400/50"
                        id="description-field"
                    />
                </div>
                <div className="grid gap-1 mt-4">
                    <h2 className="text-xl font-bold">Tags</h2>
                    <div>

                    </div>

                </div>
            </form>
        </div>
    )
}