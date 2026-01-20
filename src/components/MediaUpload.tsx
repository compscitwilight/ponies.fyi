"use client";

import { useState, ChangeEvent } from "react";
import { Image } from "lucide-react";
import { MediaType } from "@/generated/enums";

export function MediaUpload({
    type,
    id,
    maxResW,
    maxResH,
    supportedFormats,
    onUploadComplete
}: {
    type: MediaType,
    id?: string,
    maxResW?: number,
    maxResH?: number,
    supportedFormats?: Array<string>,
    onUploadComplete?: (uuid: string) => void
}) {
    const [uploadProgress, setUploadProgress] = useState<string>();
    const [uploadComplete, setUploadComplete] = useState<boolean>();
    const [finalizing, setFinalizing] = useState<boolean>();
    const [uploadError, setUploadError] = useState<string>();
    const [uuid, setUUID] = useState<string>();

    function onFileUpload(ev: ChangeEvent<HTMLInputElement>) {
        if (!ev.target.files) {
            console.warn("Files could not be found");
            return;
        }

        if (ev.target.files.length === 0) {
            console.warn("File could not be found");
            return;
        }

        const file = ev.target.files[0];
        fetch("/api/media/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type,
                mime: file.type
            })
        })
            .then((response) => response.json())
            .then((json: { uuid?: string, url?: string, message?: string }) => {
                if (json.message) {
                    setUploadError(json.message);
                    return;
                }

                if (json.url && json.uuid) {
                    setUUID(json.uuid);

                    const xhr = new XMLHttpRequest();
                    xhr.responseType = "json";
                    xhr.open("put", json.url);
                    xhr.setRequestHeader("Content-Type", file.type);

                    xhr.upload.onprogress = (uploadEv: ProgressEvent) => {
                        if (uploadEv.lengthComputable)
                            setUploadProgress(((uploadEv.loaded / uploadEv.total) * 100).toFixed(1));
                    }

                    xhr.onload = () => {
                        setFinalizing(true);
                        fetch(`/api/media/finalize/${json.uuid}`, { method: "PUT" })
                            .then((response) => {
                                setFinalizing(false);
                                if (response.status === 200) {
                                    setUploadComplete(true);
                                    if (onUploadComplete) onUploadComplete(json.uuid as string);
                                }
                                else return response.json();
                            })
                            .then((json) => {
                                if (json) setUploadError(json.message);
                            })
                    }

                    xhr.send(file);
                }
            })
    }

    return (
        <div>
            <div className="relative w-full h-[256px] rounded-md border border-gray-400/50 transition-border duration-200 hover:border-gray-400/75">
                {!uploadComplete ? <>
                    <input
                        id={id}
                        className="opacity-0 top-0 left-0 h-full w-full cursor-pointer"
                        onChange={onFileUpload}
                        accept={supportedFormats?.join(",")}
                        type="file"
                    />
                    <Image className="absolute top-0 left-0 h-full w-full text-gray-400 p-16 -z-1" />
                    <label className="text-sm text-gray-400" htmlFor={id}>
                        {(supportedFormats && supportedFormats.length > 0) && `Supported types ${supportedFormats?.join(",")}. `}
                        {(maxResW && maxResH) && `Max image size ${maxResW}x${maxResH}`}
                    </label>
                </> : <>
                    <img src={`https://static.ponies.fyi/${uuid}`} />
                </>}


                {/* upload indicator */}
                {(uploadProgress && !uploadComplete && !finalizing && !uploadError) && <div className="flex gap-2 items-center">
                    <div style={{
                        width: `${uploadProgress}%`
                    }} className="h-px my-2 p-2 bg-emerald-500 rounded-md"></div>
                    <div className="flex gap-1">
                        <p>{uploadProgress}</p>
                        <p>%</p>
                    </div>
                </div>}

                {/* upload status indicators */}
                {uploadError &&
                    <p className="text-red-500">An error occurred while uploading file: {uploadError}</p>
                }

                {finalizing &&
                    <p className="text-yellow-400">Finalizing upload...</p>
                }

                {uploadComplete &&
                    <p className="text-emerald-500">Upload complete!</p>
                }
            </div>
        </div>
    )
}