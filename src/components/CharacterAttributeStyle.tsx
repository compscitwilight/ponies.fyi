"use client";

import { useState, useEffect } from "react";

import { BodyPart, Pattern } from "@/generated/enums";
import { Plus, Trash } from "lucide-react";

export interface PonysonaAttributePayload {
    part: BodyPart,
    colors: Array<string>,
    pattern?: Pattern
}

export function CharacterAttributeStyle({
    bodyPart,
    defaultValue,
    onChange
}: {
    bodyPart: BodyPart,
    defaultValue?: PonysonaAttributePayload,
    onChange?: (payload: PonysonaAttributePayload) => void
}) {
    const [colors, setColors] = useState<Array<string>>(defaultValue?.colors || ["#000"]);
    const [pattern, setPattern] = useState<Pattern>(defaultValue?.pattern || Pattern.solid);

    function addColor(color: string) {
        console.log(`add ${color}`);
        const copy = [...colors, color];
        setColors(copy);
    }

    function setColor(order: number, color: string) {
        console.log(`set ${order} to ${color}`);
        const copy = [...colors];
        copy[order] = color;
        setColors(copy);
    }

    function removeColor(order: number) {
        console.log(`remove ${order}`);
        const copy = [...colors].filter((_, index) => index !== order);
        setColors(copy);
    }

    useEffect(() => {
        if (onChange)
            onChange({
                part: bodyPart,
                colors,
                pattern
            });
    }, [bodyPart, pattern, colors])

    return (
        <div className="flex gap-1 gap-4">
            <div className="flex-1 grid gap-1">
                <label className="text-lg font-bold" htmlFor="character-attribute-color">Color</label>
                <div className="grid gap-2 items-center">
                    {
                        colors.map((color: string, index: number) =>
                        (
                            <div key={index} className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    defaultValue={color}
                                    onChange={(e) => setColor(index, e.target.value)}
                                />
                                <p>{colors[index]}</p>
                                <Trash onMouseDown={() => removeColor(index)} className="flex-1 cursor-pointer" />
                            </div>
                        ))
                    }
                    <div onMouseDown={() => addColor("#000")} className="flex cursor-pointer">
                        <Plus />
                        <p>Add color</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 self-start grid gap-1">
                <label className="text-lg font-bold" htmlFor="character-attribute-pattern">Pattern</label>
                <select className="border p-1 rounded-md border-gray-400/50 cursor-pointer" defaultValue={pattern} onChange={(e) => setPattern(e.target.value as Pattern)}>
                    {
                        Object.values(Pattern).map((pattern: Pattern, index: number) =>
                            <option key={index} value={pattern}>{pattern}</option>
                        )
                    }
                </select>
            </div>
        </div>
    )
}