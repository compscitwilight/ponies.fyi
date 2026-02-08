"use client";

import { useState } from "react";
import { RelationshipDirection, RelationshipType } from "@/generated/enums";

import { PonysonaSearch, AutocompletePonysonaResult } from "../PonysonaSearch";
import type { AutocompleteResult } from "../PonysonaSearch";

export function NewRelationshipForm() {
    const [a, setA] = useState<string>();
    const [b, setB] = useState<string>();
    const [direction, setDirection] = useState<RelationshipDirection>(RelationshipDirection.AB);
    const [type, setType] = useState<RelationshipType>(RelationshipType.friends);
    const [label, setLabel] = useState<string>();

    const [aData, setAData] = useState<AutocompleteResult>();
    const [bData, setBData] = useState<AutocompleteResult>();

    function onCreate() {
        fetch("/api/relationships/new", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                a, b, direction, type, label
            })
        })
            .then(async (response) => ([response.ok, await response.json()]))
            .then(([ok, json]) => {
                if (ok) window.location.assign(`/${json.id}`);
                else alert(json.message);
            })
    }

    return (
        <div>
            <h1 className="text-3xl font-bold">Creating relationship</h1>
            <div className="grid gap-2">
                {/* Ponysona A & B */}
                <div className="grid gap-1">
                    <label htmlFor="ponysona-a" className="font-bold text-lg">Ponysona A</label>
                    <PonysonaSearch onSelect={(ponysona) => {
                        setA(ponysona.id);
                        setAData(ponysona);
                    }} id="ponysona-a" />
                    {aData && (
                        <>
                            <h2 className="text-lg font-bold">Selected</h2>
                            <AutocompletePonysonaResult ponysona={aData} />
                        </>
                    )}
                </div>
                <div className="grid gap-1">
                    <label htmlFor="ponysona-b" className="font-bold text-lg">Ponysona B</label>
                    <PonysonaSearch onSelect={(ponysona) => {
                        setB(ponysona.id);
                        setBData(ponysona);
                    }} id="ponysona-b" />
                    {bData && (
                        <>
                            <h2 className="text-lg font-bold">Selected</h2>
                            <AutocompletePonysonaResult ponysona={bData} />
                        </>
                    )}
                </div>

                {/* Relationship Direction */}
                <div className="grid gap-1">
                    <label htmlFor="relationship-direction" className="font-bold text-lg">Direction</label>
                    <select
                        className="border border-gray-400/50 rounded-md p-1 cursor-pointer"
                        onChange={(e) => setDirection(e.target.value as RelationshipDirection)}
                    >
                        <option value="AB">{"A -> B"}</option>
                        <option value="BA">{"B -> A"}</option>
                    </select>
                </div>

                {/* Relationship Type */}
                <div className="grid gap-1">
                    <label htmlFor="relationship-type" className="font-bold text-lg">Type</label>
                    <select
                        className="border border-gray-400/50 rounded-md p-1 cursor-pointer"
                        onChange={(e) => setType(e.target.value as RelationshipType)}
                        defaultValue={type}
                    >
                        <option value="friends">Friends</option>
                        <option value="siblings">Siblings</option>
                        <option value="parent_child">Parent-child</option>
                        <option value="enemies">Enemies</option>
                    </select>
                </div>

                {/* Label */}
                <div className="grid gap-1">
                    <label htmlFor="relationship-label" className="font-bold text-lg">Label</label>
                    <input
                        className="border border-gray-400/50 rounded-md"
                        onChange={(e) => setLabel(e.target.value)}
                        type="text"
                    />
                </div>

                <button
                    className="border border-gray-400/50 cursor-pointer"
                    onMouseDown={onCreate}
                >Create relationship</button>
            </div>
        </div>
    )
}