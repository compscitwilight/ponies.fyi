"use client";

import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { Color, ColorTone, Pattern, Ponysona, PonysonaTag } from "@/generated/client";
import { Asterisk, Tags } from "lucide-react";

import { Tag } from "@/components/Tag";
import { MediaUpload } from "@/components/MediaUpload";

import { NamePill } from "@/components/pills/Name";
import { SourcePill } from "@/components/pills/Source";
import { CreatorPill } from "@/components/pills/Creator";

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
    const [sourceVal, setSourceVal] = useState<string>("");
    const [creatorVal, setCreatorVal] = useState<string>("");
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
        if (otherNames.includes(otherNameVal)) return;
        setOtherNames(on => [...on, otherNameVal]);
        setOtherNameVal("");
    }

    function removeOtherName(name: string) {
        if (!otherNames.includes(name)) return;
        setOtherNames(on => on.filter((e: string) => e !== name));
    }

    function addSource() {
        if (!sourceVal) return;
        if (sources.includes(sourceVal)) return;
        setSources(s => [...s, sourceVal]);
        setSourceVal("");
    }

    function removeSource(source: string) {
        if (!sources.includes(source)) return;
        setSources(s => s.filter((e: string) => e !== source));
    }

    function addCreator() {
        if (!creatorVal) return;
        if (creators.includes(creatorVal)) return;
        setCreators(c => [...c, creatorVal]);
        setCreatorVal("");
    }

    function removeCreator(creator: string) {
        if (!creators.includes(creator)) return;
        setCreators(c => c.filter((e: string) => e !== creator));
    }

    function toggleTag(tag: PonysonaTag) {
        if (tagIds.includes(tag.id)) {
            setTagIds(ids => ids.filter((id: number) => id !== tag.id));
        } else setTagIds(ids => [...ids, tag.id]);
    }

    useEffect(() => {
        document.title = "Submit a ponysona | ponies.fyi";
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
        <div className="mb-16">
            <h1 className="text-3xl font-bold">Submit a ponysona</h1>
            <hr className="h-px my-2 border-0 bg-gray-300" />
            <form onSubmit={onFormSubmit} className="flex flex-col gap-2">
                <div className="grid gap-1">
                    <label className="text-xl font-bold" htmlFor="media-upload">Primary artwork</label>
                    <MediaUpload destination="" id="media-upload" />
                </div>

                {/* Primary name */}
                <div className="grid gap-1">
                    <div className="flex gap-1">
                        <label htmlFor="primary-name-field" className="font-bold">Primary name</label>
                        <RequiredAsterisk />
                    </div>
                    <input id="primary-name-field" className="rounded-md p-1 border border-gray-300" onChange={(e) => setPrimaryName(e.target.value)} type="text" required />
                </div>

                {/* Other names */}
                <div className="flex gap-2">
                    <label htmlFor="include-other-names" className="font-bold">Include other names</label>
                    <input onChange={(e) => setIncludeOtherNames(e.target.checked)} id="include-other-names" type="checkbox" />
                </div>
                {includeOtherNames && (
                    <div className="grid gap-1 p-2 rounded-md border border-gray-300">
                        <div className="flex gap-1">
                            {
                                otherNames.map((name: string, index: number) =>
                                    <NamePill key={index} onClick={() => removeOtherName(name)} name={name} />
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

                {/* Description */}
                <div className="grid gap-1 mt-4">
                    <label htmlFor="description-field" className="font-bold">Description (optional)</label>
                    <textarea
                        className="resize-none rounded-md border border-gray-400/50"
                        id="description-field"
                    />
                </div>

                {/* Tags */}
                <div className="grid gap-1 mt-4">
                    <h2 className="text-xl font-bold">Tags</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-700">Species/race</h3>
                            <div className="grid gap-1">
                                {
                                    availableTags
                                        .filter((tag: PonysonaTag) => tag.type === "species")
                                        .map((tag: PonysonaTag, index: number) =>
                                            <Tag onClick={toggleTag} added={tagIds.includes(tag.id)} key={index} tag={tag} editing />
                                        )
                                }
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-700">Form</h3>
                            <div className="grid gap-1">
                                {
                                    availableTags
                                        .filter((tag: PonysonaTag) => tag.type === "form")
                                        .map((tag: PonysonaTag, index: number) =>
                                            <Tag onClick={toggleTag} added={tagIds.includes(tag.id)} key={index} tag={tag} editing />
                                        )
                                }
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-700">Role</h3>
                            <div className="grid gap-1">
                                {
                                    availableTags
                                        .filter((tag: PonysonaTag) => tag.type === "role")
                                        .map((tag: PonysonaTag, index: number) =>
                                            <Tag onClick={toggleTag} added={tagIds.includes(tag.id)} key={index} tag={tag} editing />
                                        )
                                }
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-700">Setting</h3>
                            <div className="grid gap-1">
                                {
                                    availableTags
                                        .filter((tag: PonysonaTag) => tag.type === "setting")
                                        .map((tag: PonysonaTag, index: number) =>
                                            <Tag onClick={toggleTag} added={tagIds.includes(tag.id)} key={index} tag={tag} editing />
                                        )
                                }
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-700">Genre</h3>
                            <div className="grid gap-1">
                                {
                                    availableTags
                                        .filter((tag: PonysonaTag) => tag.type === "genre")
                                        .map((tag: PonysonaTag, index: number) =>
                                            <Tag onClick={toggleTag} added={tagIds.includes(tag.id)} key={index} tag={tag} editing />
                                        )
                                }
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-700">Traits</h3>
                            <div className="grid gap-1">
                                {
                                    availableTags
                                        .filter((tag: PonysonaTag) => tag.type === "trait")
                                        .map((tag: PonysonaTag, index: number) =>
                                            <Tag onClick={toggleTag} added={tagIds.includes(tag.id)} key={index} tag={tag} editing />
                                        )
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sources */}
                <div className="grid gap-1">
                    <label htmlFor="new-source-field" className="font-bold">Sources</label>
                    <div className="flex gap-1">
                        {
                            sources.map((source: string, index: number) =>
                                <SourcePill key={index} onClick={() => removeSource(source)} source={source} />
                            )
                        }
                    </div>
                    <div className="flex gap-1">
                        <input
                            id="new-source-field"
                            placeholder="Type a source and press 'Enter'"
                            className="flex-1 rounded-md p-1 border border-gray-300"
                            onChange={(e) => setSourceVal(e.target.value)}
                            onKeyDown={(e) => {
                                console.log(e.key);
                                if (e.key === "Enter") addSource();
                            }}
                            value={sourceVal}
                            type="text"
                        />
                        <button
                            onMouseDown={addOtherName}
                            className="rounded-md border border-gray-400/50 px-2 cursor-pointer"
                            type="button"
                        >Add</button>
                    </div>
                </div>

                {/* Creators */}
                <div className="grid gap-1">
                    <label htmlFor="new-creator-field" className="font-bold">Creators</label>
                    <div className="flex gap-1">
                        {
                            creators.map((source: string, index: number) =>
                                <CreatorPill key={index} onClick={() => removeCreator(source)} creator={source} />
                            )
                        }
                    </div>
                    <div className="flex gap-1">
                        <input
                            id="new-creator-field"
                            placeholder="Paste a social URL or enter a name and press 'Enter'"
                            className="flex-1 rounded-md p-1 border border-gray-300"
                            onChange={(e) => setCreatorVal(e.target.value)}
                            onKeyDown={(e) => {
                                console.log(e.key);
                                if (e.key === "Enter") addCreator();
                            }}
                            value={creatorVal}
                            type="text"
                        />
                        <button
                            onMouseDown={addCreator}
                            className="rounded-md border border-gray-400/50 px-2 cursor-pointer"
                            type="button"
                        >Add</button>
                    </div>
                </div>

                {/* Colors */}
                <div className="grid gap-2">
                    <h2></h2>
                </div>

                {/* Attributes */}
                <div className="grid gap-2">
                    <h2 className="text-xl font-bold">Character attributes</h2>
                    <div className="flex gap-2 items-center">
                            
                    </div>
                </div>

                <hr className="h-px my-2 border-0 bg-gray-400" />
                <button type="button" className="p-2 rounded-md bg-emerald-300 border border-emerald-400 font-bold cursor-pointer transition duration-200 hover:bg-emerald-500/50">
                    Create
                </button>
            </form>
        </div>
    )
}