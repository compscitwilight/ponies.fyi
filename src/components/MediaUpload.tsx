"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Image } from "lucide-react";

export function MediaUpload({
    destination,
    id,
    maxResW,
    maxResH,
    supportedFormats
}: {
    destination: string,
    id?: string,
    maxResW?: number,
    maxResH?: number,
    supportedFormats?: Array<string>
}) {
    const [uploadProgress, setUploadProgress] = useState<string>();

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
        const xhr = new XMLHttpRequest();
        xhr.open("put", destination);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (uploadEv: ProgressEvent) => {
            if (uploadEv.lengthComputable)
                setUploadProgress(((uploadEv.loaded / uploadEv.total) * 100).toFixed(1));
        }

        xhr.onload = () => {

        }

        xhr.send(file);
    }

    return (
        <div>
            <div className="relative w-full h-[256px] rounded-md border border-gray-400/50 transition-border duration-200 hover:border-gray-400/75">
                <input
                    id={id}
                    className="opacity-0 top-0 left-0 h-full w-full cursor-pointer"
                    onChange={onFileUpload}
                    accept={supportedFormats?.join(",")}
                    type="file"
                />
                <Image className="absolute top-0 left-0 h-full w-full text-gray-400 p-16 -z-1" />
                <label className="text-sm text-gray-400" htmlFor={id}>
                    {(supportedFormats && supportedFormats.length > 0) && `Supported types ${supportedFormats?.join(",")}. ` }
                    {(maxResW && maxResH) && `Max image size ${maxResW}x${maxResH}`}
                </label>
            </div>
        </div>
    )
}