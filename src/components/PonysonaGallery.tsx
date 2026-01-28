"use client";

import { Media, Ponysona } from "@/generated/client";
import { MediaUpload } from "./MediaUpload";
import Link from "next/link";

export function PonysonaGallery({ ponysona, gallery, mediaUploads }: {
    ponysona: Ponysona,
    gallery: Array<Media>,
    mediaUploads?: boolean
}) {
    function onImageUploadComplete(uuid: string) {
        fetch(`/api/ponysonas/${ponysona.id}/gallery`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ add: [uuid] })
        })
            .then((response) => {
                if (response.status === 200)
                    window.location.reload();
            })
    }

    return (
        <div id="gallery">
            <h1 className="text-3xl font-bold">Gallery</h1>
            <hr className="h-px my-2 border-0 bg-gray-400/50" />
            {mediaUploads && <MediaUpload onUploadComplete={onImageUploadComplete} type="gallery" />}
            {
                gallery.length === 0 ?
                    <p>There are no images in {ponysona.primaryName}'s gallery.</p> :
                    <div className="grid lg:grid-cols-3">
                        {
                            gallery.map((object: Media) =>
                                <Link key={object.id} href={`/media/${object.id}`}>
                                    <img
                                        src={`https://static.ponies.fyi/${object.id}`}
                                    />
                                </Link>
                            )
                        }
                    </div>
            }
        </div>
    )
}