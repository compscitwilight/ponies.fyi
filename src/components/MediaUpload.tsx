"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Image } from "lucide-react";

export function MediaUpload({
    destination,
    id
}: {
    destination: string,
    id?: string
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
            <div className="relative w-full h-[256px] rounded-md border border-gray-400/50">
                <input id={id} className="opacity-0 top-0 left-0 h-full w-full cursor-pointer" onChange={onFileUpload} type="file" />
                <Image className="absolute top-0 left-0 h-full w-full text-gray-400 p-16 -z-1" />
            </div>
        </div>
    )
}