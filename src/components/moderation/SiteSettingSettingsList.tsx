"use client";

import { useState } from "react";
import { SiteSettings } from "@/generated/client";

function SiteSetting({ setting }: { setting: SiteSettings }) {
    const [settingValue, setSettingValue] = useState<string | null>(setting.value);

    function saveChanges() {
        fetch("/api/site", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ [setting.key]: settingValue })
        })
            .then((response) => {
                if (response.ok) window.location.reload();
                else return response.json();
            })
            .then((json?: { message: string }) => {
                if (json) alert(json.message);
            })
    }

    return (
        <div className="flex border border-gray-400/50 p-2">
            <div className="flex flex-1 gap-2">
                <p>{setting.key}</p>
                <input
                    className="border border-gray-400/50 w-[128px]"
                    onChange={(e) => setSettingValue(e.target.value)}
                    type="text"
                    defaultValue={settingValue || ""}
                    placeholder="Value"
                />
            </div>
            <div className="flex gap-1 items-center">
                {(settingValue !== (setting.value || "")) &&
                    <p onMouseDown={saveChanges} className="text-sky-600 underline cursor-pointer">Save changes</p>}
            </div>
        </div>
    )
}

export function SiteSettingsList({ settings }: { settings: Array<SiteSettings> }) {
    const [newSettingKey, setNewSettingKey] = useState<string>();
    const [newSettingValue, setNewSettingValue] = useState<string>();

    function createSetting() {
        if (!newSettingKey) {
            alert("A setting key and value must be provided.");
            return;
        }

        fetch("/api/site", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ [newSettingKey as string]: newSettingValue || null })
        })
            .then((response) => {
                if (response.ok) window.location.reload();
                else return response.json();
            })
            .then((json?: { message: string }) => {
                if (json) alert(json.message)
            })
    }

    return (
        <div>
            <div className="flex">
                <h2 className="flex-1 text-2xl font-bold">Site settings</h2>
                <div className="flex gap-2">
                    <input
                        className="border border-gray-400/50 w-[128px]"
                        onChange={(e) => setNewSettingKey(e.target.value)}
                        defaultValue={newSettingKey}
                        placeholder="Key"
                        type="text"
                    />
                    <input
                        className="border border-gray-400/50 w-[128px]"
                        onChange={(e) => setNewSettingValue(e.target.value)}
                        defaultValue={newSettingValue}
                        placeholder="Value"
                        type="text"
                    />
                    <button
                        onMouseDown={createSetting}
                        className="border border-gray-400/50 px-2 rounded-md cursor-pointer"
                    >Add setting</button>
                </div>
            </div>
            <hr className="h-px my-2 border-0 bg-gray-400/50" />
            {settings.length > 0 ? settings.map((setting: SiteSettings) =>
                <SiteSetting key={setting.key} setting={setting} />
            ) : <i>There are no site settings.</i>}
        </div>
    )
}