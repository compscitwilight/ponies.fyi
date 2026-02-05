"use client";

import { useState, useEffect } from "react";

import { BodyPart, Pattern } from "@/generated/enums";
import { Plus, Trash } from "lucide-react";
import { NewColor } from "./ponysonas/NewColor";
import { PatternDropdown } from "./ponysonas/PatternDropdown";

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
                            <NewColor
                                key={index}
                                defaultValue={color}
                                onChange={(color: string) => setColor(index, color)}
                                onRemove={() => removeColor(index)}
                            />
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
                <PatternDropdown defaultValue={pattern} onChange={setPattern} />
            </div>
        </div>
    )
}