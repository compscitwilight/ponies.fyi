"use client";

import { useState, useEffect } from "react";

import { BodyPart, Pattern } from "@/generated/enums";

export interface PonysonaAttributePayload {
    part: BodyPart,
    color?: string,
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
    const [color, setColor] = useState<string>(defaultValue?.color || "#000");
    const [pattern, setPattern] = useState<Pattern>(defaultValue?.pattern || Pattern.solid);

    useEffect(() => {
        if (onChange)
            onChange({
                part: bodyPart,
                color,
                pattern
            });
    }, [bodyPart, color, pattern])

    return (
        <div className="flex gap-1 gap-4">
            <div className="flex-1 grid gap-1">
                <label className="text-lg font-bold" htmlFor="character-attribute-color">Color</label>
                <div className="flex gap-2 items-center">
                    <input onChange={(e) => setColor(e.target.value)} id="character-attribute-color" defaultValue={color} type="color" />
                    <p>{color}</p>
                </div>
            </div>
            <div className="flex-1 grid gap-1">
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