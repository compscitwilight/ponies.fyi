"use client";

import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import { Color, ColorTone, Pattern, Ponysona } from "@/generated/client";
import { FormEvent, useState } from "react";

interface PonysonaAttributePayload {
    color: Color,
    tone: ColorTone,
    pattern: Pattern
}

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
    const [otherNameVal, setOtherNameVal] = useState<string>();
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
        setOtherNameVal(undefined);
    }

    function removeOtherName(name: string) {
        if (!otherNames.includes(name)) return;
        setOtherNames(on => on.filter((e: string) => e !== name));
    }

    return (
        <div>
            <h1 className="text-3xl font-bold">Submit a ponysona</h1>
            <hr className="h-px my-2 border-0 bg-gray-300" />
            <form onSubmit={onFormSubmit} className="flex flex-col">
                <div className="grid gap-1">
                    <label className="font-bold">Primary name</label>
                    <input className="rounded-md p-1 border border-gray-300" onChange={(e) => setPrimaryName(e.target.value)} type="text" required />
                </div>
                <div className="flex gap-2">
                    <label htmlFor="include-other-names" className="font-bold">Include other names</label>
                    <input onChange={(e) => setIncludeOtherNames(e.target.checked)} id="include-other-names" type="checkbox" />
                </div>
                {includeOtherNames && (
                    <div className="grid gap-1 p-2 rounded-md border border-gray-300">
                        <div>

                        </div>
                        <form>
                            <label className="font-bold">Other names</label>
                            <input className="rounded-md p-1 border border-gray-300" onChange={(e) => setPrimaryName(e.target.value)} type="text" required />
                        </form>
                    </div>
                )}
                <div className="grid gap-1">
                    <label className="font-bold">Primary name</label>
                    <input className="rounded-md p-1 border border-gray-300" onChange={(e) => setPrimaryName(e.target.value)} type="text" required />
                </div>

            </form>
        </div>
    )
}