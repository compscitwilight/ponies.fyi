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

export function PonysonaRevisionEntry({ revision, allowRevert }: {
    revision: PonysonaRevision,
    allowRevert?: boolean
}) {
    const [snapshotVisible, setSnapshotVisible] = useState<boolean>(false);
    const [reverting, setReverting] = useState<boolean>(false);
    const [revertError, setRevertError] = useState<string>();

    function revertToRevision() {
        setReverting(true);
        fetch(`/api/ponysonas/${revision.ponysonaId}/revision/${revision.id}`, {
            method: "PATCH"
        })
            .then((response) => {
                setReverting(false);
                if (response.status === 200) window.location.reload();
                else return response.json();
            })
            .then((json?: { message: string }) => {
                if (json) setRevertError(json.message);
            })
    }

    return (
        <div id={revision.id} className="p-2 border border-gray-400/50 rounded-md">
            <div
                onMouseDown={() => setSnapshotVisible(v => !v)}
                className="flex items-center gap-4 cursor-pointer border-b border-gray-400/50 pb-2"
            >
                <h1 className="flex-1 text-lg font-bold">{revision.id}</h1>
                <div className="flex gap-1 items-center">
                    <b>Created</b>
                    <p>{revision.createdAt.toISOString()}</p>
                </div>
                {allowRevert && (reverting ? <p>Reverting...</p> : <p
                    className="underline cursor-pointer"
                    onMouseDown={revertToRevision}
                >Revert to revision</p>)}
            </div>
            {(revision.snapshot && snapshotVisible) && <div>
                <pre dangerouslySetInnerHTML={{
                    __html: syntaxHighlight(JSON.stringify(revision.snapshot, null, 4))
                }} />
            </div>}
        </div>
    )
}