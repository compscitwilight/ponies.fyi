"use client";

import { useState } from "react";
import { Pattern, Ponysona, PonysonaAccessory } from "@/generated/client";
import { Plus } from "lucide-react";
import { NewColor } from "./NewColor";
import { PatternDropdown } from "./PatternDropdown";
import { HexCode } from "./HexCode";

function AccessoryListing({
    accessory,
    allowEdit,
    onSelect,
    onRemove
}: {
    accessory: PonysonaAccessory,
    allowEdit?: boolean,
    onSelect?: () => void,
    onRemove?: () => void
}) {
    const deduplicatedColors = [...new Set(accessory.colors)];

    return (
        <div className="flex">
            <div className="flex-1 flex gap-2 items-center">
                <h3 className="text-lg font-bold">{accessory.name}</h3>
                <p>{accessory.pattern}</p>
                <div className="flex gap-2">
                    {deduplicatedColors.map((color: string) =>
                        <HexCode key={color} color={color} />
                    )}
                </div>
            </div>
            {allowEdit && <div className="flex gap-2">
                <button className="text-red-600 underline cursor-pointer" onMouseDown={onRemove}>Remove</button>
                <button className="text-sky-600 underline cursor-pointer" onMouseDown={onSelect}>Edit</button>
            </div>}
        </div>
    )
}

export function Accessories({
    ponysona,
    accessories,
    allowEditing
}: {
    ponysona: Ponysona,
    accessories: Array<PonysonaAccessory>,
    allowEditing?: boolean
}) {
    const [mode, setMode] = useState<"add" | "edit">();
    const [editingAccessoryName, setEditingAccessoryName] = useState<string>();

    const [nameField, setNameField] = useState<string>();
    const [colors, setColors] = useState<Array<string>>(["#000"]);
    const [pattern, setPattern] = useState<Pattern>("solid");

    const [pending, setPending] = useState<boolean>(false);

    function submitChanges() {
        if (!mode) return;
        if (!nameField) {
            alert("Please provide an accessory name before proceeding.");
            return;
        }

        const body = mode === "add" ? [
            { name: nameField, colors, pattern }
        ] : [
            {
                name: editingAccessoryName,
                data: { name: nameField, colors, pattern }
            }
        ]

        setPending(true);
        fetch(`/api/ponysonas/${ponysona.id}/accessories`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ [mode]: body })
        })
            .then((response) => {
                setPending(false);
                if (response.ok) window.location.reload();
                else return response.json();
            })
            .then((json?: { message: string }) => {
                if (json) alert(json.message);
            })
    }

    function removeAccessory(accessory: PonysonaAccessory) {
        fetch(`/api/ponysonas/${ponysona.id}/accessories`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ remove: [accessory.id] })
        })
            .then((response) => {
                if (response.ok) window.location.reload();
                else return response.json();
            })
            .then((json?: { message: string }) => {
                if (json) alert(json.message);
            })
    }

    function setColor(order: number, color: string) {
        const copy = [...colors];
        copy[order] = color;
        setColors(copy);
    }

    function removeColor(order: number) {
        const copy = [...colors].filter((_, index) => index !== order);
        setColors(copy);
    }

    function selectAccessoryForEditing(accessory: PonysonaAccessory) {
        setMode("edit");
        setEditingAccessoryName(accessory.name);
        setNameField(accessory.name);
        setColors(accessory.colors);
        setPattern(accessory.pattern);
    }

    return (
        <div>
            <div className="flex items-center">
                <h2 className="flex-1 text-lg font-lexie-bold">Accessories</h2>
                {allowEditing && (
                    <div
                        onMouseDown={() => setMode(c => c !== undefined ? undefined : "add")}
                        className="flex cursor-pointer underline font-bold"
                    >
                        {mode === undefined ? (
                            <>
                                <Plus />
                                <p>Add accessory</p>
                            </>
                        ) : <p>Cancel</p>}
                    </div>
                )}
            </div>
            {mode !== undefined && (
                <div className="border border-gray-400/50 p-2 mt-2">
                    <div className="grid gap-1">
                        <label className="text-lg font-bold" htmlFor="accessory-name">Name</label>
                        <input
                            onChange={(e) => setNameField(e.target.value)}
                            defaultValue={nameField}
                            className="border border-gray-300"
                            id="accessory-name"
                        />
                    </div>
                    <div>
                        <div className="flex items-center">
                            <h3 className="flex-1 text-lg font-bold">Colors</h3>
                            <div
                                onMouseDown={() => setColors(c => [...c, "#000"])}
                                className="flex underline cursor-pointer"
                            >
                                <Plus />
                                <p>Add color</p>
                            </div>
                        </div>
                        <div>
                            {
                                colors.map((color: string, index: number) =>
                                    <NewColor
                                        key={index}
                                        onChange={(newColor: string) => setColor(index, newColor)}
                                        onRemove={() => removeColor(index)}
                                        defaultValue={color}
                                    />
                                )
                            }
                        </div>
                    </div>
                    <div className="grid gap-1">
                        <label className="text-lg font-bold" htmlFor="accessory-pattern">Pattern</label>
                        <PatternDropdown id="accessory-pattern" onChange={setPattern} />
                    </div>
                    <button onMouseDown={submitChanges} className="mt-2 border border-gray-400/50 p-1 cursor-pointer">
                        {mode === "add" ? "Add accessory" : "Finish"}
                    </button>
                </div>
            )}
            <hr className="h-px my-2 border-0 bg-gray-400/50" />
            <div className="grid gap-2">
                {
                    accessories.length > 0 ? accessories.map((accessory: PonysonaAccessory) =>
                        <AccessoryListing
                            key={accessory.id}
                            accessory={accessory}
                            allowEdit={allowEditing}
                            onSelect={() => selectAccessoryForEditing(accessory)}
                            onRemove={() => removeAccessory(accessory)}
                        />
                    ) : <p>There are no accessories.</p>
                }
            </div>
        </div>
    )
}