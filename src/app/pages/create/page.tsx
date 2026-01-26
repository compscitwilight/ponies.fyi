"use client";

import React, { FormEvent, useState, useEffect, PropsWithChildren } from "react";
// import { redirect } from "next/navigation";
import type { Ponysona, BodyPart, MediaType, PonysonaTag, PonysonaAppearanceAttribute, Media } from "@/generated/client";
import { Asterisk } from "lucide-react";
import { supabase } from "@/lib/auth";
import { PonysonaAttributePayload } from "@/components/CharacterAttributeStyle";

import { Tag } from "@/components/Tag";
import { MediaUpload } from "@/components/MediaUpload";
import { CharacterAttributeStyle } from "@/components/CharacterAttributeStyle";

import { NamePill } from "@/components/pills/Name";
import { SourcePill } from "@/components/pills/Source";
import { CreatorPill } from "@/components/pills/Creator";

const RequiredAsterisk = () => <Asterisk size={18} className="text-red-400" />;

interface PonysonaAttributeKV<V> {
    mane?: V,
    tail?: V,
    coat?: V,
    wings?: V,
    horn?: V,
    eyes?: V
}

function PonysonaAttributeHeader({
    onToggle,
    toggled,
    children
}: {
    toggled?: boolean,
    onToggle: () => void,
} & PropsWithChildren) {
    const bodyPart = children as string;
    return (
        <div className="flex gap-1 items-center">
            <h2 className="flex-1 text-xl font-bold">{bodyPart}</h2>
            <button type="button" onMouseDown={onToggle} className="border rounded-md p-1 border-gray-300 cursor-pointer">
                {toggled ? "Exclude" : "Include"}
            </button>
        </div>
    )
}

export default function CreatePage({
    searchParams
}: {
    searchParams: Promise<{
        derivativeof?: string,
        editing?: string
    }>
}) {
    const { derivativeof: derivativeOf, editing } = React.use(searchParams);

    // used when editing for redirecting
    const [existingSlug, setExistingSlug] = useState<string>();

    const [primaryName, setPrimaryName] = useState<string>();
    const [otherNames, setOtherNames] = useState<Array<string>>(new Array<string>());
    const [description, setDescription] = useState<string>();
    const [tagIds, setTagIds] = useState<Array<number>>(new Array<number>());
    const [sources, setSources] = useState<Array<string>>(new Array<string>());
    const [creators, setCreators] = useState<Array<string>>(new Array<string>());
    const [attributes, setAttributes] = useState<PonysonaAttributeKV<PonysonaAttributePayload>>({} as any);
    const [media, setMedia] = useState<{ preview?: string, mark?: string }>({} as any);

    const [includeOtherNames, setIncludeOtherNames] = useState<boolean>(false);
    const [attributesVisibility, setAttributesVisibility] = useState<PonysonaAttributeKV<boolean>>({} as any);
    const [otherNameVal, setOtherNameVal] = useState<string>("");
    const [sourceVal, setSourceVal] = useState<string>("");
    const [creatorVal, setCreatorVal] = useState<string>("");
    const [availableTags, setAvailableTags] = useState<Array<PonysonaTag>>(new Array<PonysonaTag>());
    const [submitError, setSubmitError] = useState<string>();

    function onFormSubmit(ev: FormEvent) {
        ev.preventDefault();
        const reqPayload = {
            primaryName,
            otherNames,
            description,
            tagIds,
            sources,
            creators,
            attributes,
            media
        };
        console.log(reqPayload);

        if (!editing) {
            fetch("/api/ponysonas/new", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(reqPayload)
            })
                .then((response) => response.json())
                .then((json: any) => {
                    if (json.message) setSubmitError(json.message);
                    else {
                        const result = json as Ponysona;
                        window.location.assign(`/${result.slug}`)
                        // router.push(`/${result.slug}`);
                    }
                })
        } else {
            fetch(`/api/ponysonas/${editing}/update`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(reqPayload)
            })
                .then((response) => {
                    if (response.status !== 200) return response.json();
                    else window.location.assign(`/${existingSlug}`);
                })
                .then((json: any) => {
                    if (json && json.message) setSubmitError(json.message);
                })
        }
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

    function assignAttribute(part: BodyPart, data: PonysonaAttributePayload) {
        const copy = Object.assign({}, attributes);
        copy[part] = data;
        setAttributes(copy);
    }

    function toggleAttributeStylizer(bodyPart: BodyPart) {
        const copy = Object.assign({}, attributesVisibility);
        if (copy[bodyPart]) {
            const attributesCopy = Object.assign({}, attributes);
            delete attributesCopy[bodyPart];
            setAttributes(_ => attributesCopy);
        }
        copy[bodyPart] = !copy[bodyPart];
        setAttributesVisibility(copy);
    }

    function assignMedia(type: MediaType, uuid: string) {
        const copy = Object.assign({}, media) as any;
        copy[type] = uuid;
        setMedia(copy);
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

        if (editing)
            fetch(`/api/ponysonas/${editing}`, { method: "GET" })
                .then((response) => {
                    if (response.status !== 200) window.location.assign("/pages/create");
                    return response.json();
                })
                .then((json: any) => {
                    const data = json as Ponysona & {
                        attributes: Array<PonysonaAppearanceAttribute>
                    };

                    setPrimaryName(data.primaryName);

                    setOtherNames(data.otherNames);
                    if (data.otherNames.length > 0) setIncludeOtherNames(true);

                    if (data.description) setDescription(data.description);
                    setTagIds(data.tagIds);
                    setSources(data.sources);
                    setCreators(data.creators);
                    if (data.attributes) {
                        for (const attribute of data.attributes) {
                            assignAttribute(attribute.bodyPart, {
                                part: attribute.bodyPart,
                                colors: attribute.colors,
                                pattern: attribute.pattern
                            } as PonysonaAttributePayload);
                            toggleAttributeStylizer(attribute.bodyPart);
                        }
                    };

                    fetch(`/api/ponysonas/${data.id}/media`, { method: "GET" })
                        .then((response) => response.json())
                        .then((json: any) => {
                            if (!json.message) {
                                const data = json as Array<Media>;
                                const preview = data.find((d: Media) => d.type === "preview");
                                if (preview) assignMedia("preview", preview.id);

                                const mark = data.find((d: Media) => d.type === "mark");
                                if (mark) assignMedia("mark", mark.id);
                            }
                        })
                        .finally(() => setExistingSlug(data.slug));
                })

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) window.location.assign("/?state=unauthorized");
        })
    }, [setAvailableTags])

    return (editing ? editing && existingSlug : true) && (
        <div className="mb-16">
            <h1 className="text-3xl font-bold">{editing ? `Editing "${primaryName}"` : "Submit a ponysona"}</h1>
            <hr className="h-px my-2 border-0 bg-gray-300" />
            <div className="flex flex-col gap-2">
                <div className="flex flex-col lg:flex-row gap-2">
                    <div className="flex-1 grid gap-1">
                        <label className="text-xl font-bold" htmlFor="media-upload">Primary artwork</label>
                        <MediaUpload
                            onUploadComplete={(uuid: string) => assignMedia("preview", uuid)}
                            type="preview"
                            id="media-upload"
                            defaultValue={media.preview}
                        />
                    </div>
                    <div className="grid gap-1 align-center self-start">
                        <label className="text-xl font-bold" htmlFor="cutie-mark-upload">Cutie mark</label>
                        <MediaUpload
                            onUploadComplete={(uuid: string) => assignMedia("mark", uuid)}
                            type="mark"
                            id="cutie-mark-upload"
                            defaultValue={media.mark}
                        />
                    </div>
                </div>

                {/* Primary name */}
                <div className="grid gap-1">
                    <div className="flex gap-1">
                        <label htmlFor="primary-name-field" className="font-bold">Primary name</label>
                        <RequiredAsterisk />
                    </div>
                    <input id="primary-name-field" className="rounded-md p-1 border border-gray-300" onChange={(e) => setPrimaryName(e.target.value)} type="text" defaultValue={primaryName} required />
                </div>

                {/* Other names */}
                <div className="flex gap-2">
                    <label htmlFor="include-other-names" className="font-bold">Include other names</label>
                    <input onChange={(e) => setIncludeOtherNames(e.target.checked)} defaultChecked={includeOtherNames} id="include-other-names" type="checkbox" />
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
                        onChange={(e) => setDescription(e.target.value)}
                        className="resize-none rounded-md border border-gray-400/50"
                        defaultValue={description}
                        id="description-field"
                    />
                </div>

                {/* Tags */}
                <div className="grid gap-1 mt-4">
                    <h2 className="text-xl font-bold">Tags</h2>
                    <p>
                        Select tags that most accurately describes this ponysona.
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-700">Species</h3>
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

                {/* Attributes */}
                <div className="grid gap-2">
                    <div>
                        <h2 className="text-xl font-bold">Character attributes</h2>
                        <hr className="h-px my-2 border-0 bg-gray-300" />
                    </div>
                    <div className="grid gap-2 items-center">
                        <div>
                            <PonysonaAttributeHeader
                                toggled={attributesVisibility["tail"]}
                                onToggle={() => toggleAttributeStylizer("tail")}
                            >Tail</PonysonaAttributeHeader>
                            {attributesVisibility["tail"] && <CharacterAttributeStyle
                                onChange={(payload: PonysonaAttributePayload) => assignAttribute("tail", payload)}
                                bodyPart="tail"
                                defaultValue={attributes.tail}
                            />}
                        </div>
                        <div>
                            <PonysonaAttributeHeader
                                toggled={attributesVisibility["coat"]}
                                onToggle={() => toggleAttributeStylizer("coat")}
                            >Coat</PonysonaAttributeHeader>
                            {attributesVisibility["coat"] && <CharacterAttributeStyle
                                onChange={(payload: PonysonaAttributePayload) => assignAttribute("coat", payload)}
                                bodyPart="coat"
                                defaultValue={attributes.coat}
                            />}
                        </div>
                        <div>
                            <PonysonaAttributeHeader
                                toggled={attributesVisibility["wings"]}
                                onToggle={() => toggleAttributeStylizer("wings")}
                            >Wings</PonysonaAttributeHeader>
                            {attributesVisibility["wings"] && <CharacterAttributeStyle
                                onChange={(payload: PonysonaAttributePayload) => assignAttribute("wings", payload)}
                                bodyPart="wings"
                                defaultValue={attributes.wings}
                            />}
                        </div>
                        <div>
                            <PonysonaAttributeHeader
                                toggled={attributesVisibility["horn"]}
                                onToggle={() => toggleAttributeStylizer("horn")}
                            >Horn</PonysonaAttributeHeader>
                            {attributesVisibility["horn"] && <CharacterAttributeStyle
                                onChange={(payload: PonysonaAttributePayload) => assignAttribute("horn", payload)}
                                bodyPart="horn"
                                defaultValue={attributes.horn}
                            />}
                        </div>
                        <div>
                            <PonysonaAttributeHeader
                                toggled={attributesVisibility["eyes"]}
                                onToggle={() => toggleAttributeStylizer("eyes")}
                            >Eyes</PonysonaAttributeHeader>
                            {attributesVisibility["eyes"] && <CharacterAttributeStyle
                                onChange={(payload: PonysonaAttributePayload) => assignAttribute("eyes", payload)}
                                bodyPart="eyes"
                                defaultValue={attributes.eyes}
                            />}
                        </div>
                    </div>
                </div>

                <hr className="h-px my-2 border-0 bg-gray-400" />
                <button onMouseDown={onFormSubmit} type="button" className="p-2 rounded-md bg-emerald-400 border border-emerald-400 font-bold cursor-pointer transition duration-200 hover:bg-emerald-500/50">
                    {!editing ? "Create" : "Submit Changes"}
                </button>
            </div>
        </div>
    )
}