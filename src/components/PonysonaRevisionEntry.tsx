"use client";

import { useState } from "react";
import { PonysonaRevision } from "@/generated/client";

// credit: https://dev.to/gauravadhikari1997/show-json-as-pretty-print-with-syntax-highlighting-3jpm
function syntaxHighlight(json: string) {
    if (!json) return ""; //no JSON from response

    json = json
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    return json.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        function (match: string) {
            var cls = "number";
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = "key";
                } else {
                    cls = "string";
                }
            } else if (/true|false/.test(match)) {
                cls = "boolean";
            } else if (/null/.test(match)) {
                cls = "null";
            }
            return '<span class="' + cls + '">' + match + "</span>";
        }
    );
}

export function PonysonaRevisionEntry({ revision }: {
    revision: PonysonaRevision
}) {
    const [snapshotVisible, setSnapshotVisible] = useState<boolean>(false);
    return (
        <div id={revision.id} className="p-2 border border-gray-400/50 rounded-md">
            <div
                onMouseDown={() => setSnapshotVisible(v => !v)}
                className="flex cursor-pointer border-b border-gray-400/50 pb-2"
            >
                <h1 className="flex-1 text-lg font-bold">{revision.id}</h1>
                <div className="flex gap-1 items-center">
                    <b>Created</b>
                    <p>{revision.createdAt.toISOString()}</p>
                </div>
            </div>
            {(revision.snapshot && snapshotVisible) && <div>
                <pre dangerouslySetInnerHTML={{
                    __html: syntaxHighlight(JSON.stringify(revision.snapshot, null, 4))
                }} />
            </div>}
        </div>
    )
}