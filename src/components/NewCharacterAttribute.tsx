"use client";

import { useState } from "react";

import { BodyPart } from "@/generated/enums";

export function NewCharacterAttribute() {
    const [bodyPart, setBodyPart] = useState<BodyPart>(BodyPart.coat);

    return (
        <div>
            <form>
                <select defaultValue={bodyPart}>
                    
                </select>
            </form>
        </div>
    )
}