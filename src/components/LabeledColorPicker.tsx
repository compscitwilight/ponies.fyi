"use client";

import { useState } from "react";

export function LabeledColorPicker({

}) {
    return (
        <div className="flex gap-2 p-2 rounded-md border border-gray-400">
            <input type="color" />
        </div>
    )
}