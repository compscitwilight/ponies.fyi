"use client"

import { FormEvent, useState } from "react";

export function SettingsField({
    name,
    setting,
    defaultValue,
    type = "text"
}: {
    name: string,
    setting: string,
    defaultValue?: any,
    type?: "text" | "bigtext" | "number" | "toggle"
}) {
    const [value, setValue] = useState<any>(defaultValue);
    const [saving, setSaving] = useState<boolean>(false);
    const [status, setStatus] = useState<"saved" | "failed">();

    function onUpdate(event: FormEvent) {
        event.preventDefault();
        setSaving(true);
        fetch("/api/me/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [setting]: value })
        })
            .then((response) => {
                setSaving(false);
                setStatus(response.ok ? "saved" : "failed");
                if (!response.ok)
                    alert(`An error occurred when saving this setting. Status ${response.status}`);
            })
    }

    return (
        <div className={`flex ${type === "bigtext" && "flex-col"} gap-2`}>
            <p className="flex-1 text-lg self-start font-bold">{name}</p>
            <form onSubmit={onUpdate} className="flex items-center gap-4">
                {type === "bigtext" && (
                    <textarea
                        className="border border-gray-400/50 w-full"
                        onChange={(e) => setValue(e.target.value)}
                        defaultValue={value}
                    />
                )}
                {(type === "text" || type === "number") && (
                    <input
                        type={type}
                        className="border border-gray-400/50"
                        onChange={(e) => setValue(e.target.value)}
                        defaultValue={value}
                    />
                )}

                {/* todo: toggle once needed */}
                <div className="flex items-center gap-2">
                    <button className="border border-gray-400/50 p-2 rounded-md cursor-pointer">Save</button>
                    {saving && <p className="text-yellow-400">Saving...</p>}
                    {status === "failed" && <p className="text-red-500">Failed to save</p>}
                    {status === "saved" && <p className="text-emerald-600">Saved!</p>}
                </div>
            </form>
        </div>
    )
}