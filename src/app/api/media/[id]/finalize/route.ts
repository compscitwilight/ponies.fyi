import { NextResponse } from "next/server";
import bytes from "bytes";
import { MediaStatus } from "@/generated/enums";
import prisma from "lib/prisma";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const mediaObject = await prisma.media.findUnique({ where: { id } });
    if (mediaObject === null)
        return NextResponse.json(
            { message: `Media object with ID ${id} could not be found` },
            { status: 404 }
        );

    if (mediaObject.status !== MediaStatus.pending)
        return NextResponse.json(
            { message: "The media object requested has already been finalized or uploaded" },
            { status: 400 }
        );

    const staticImageResponse = await fetch(`https://static.ponies.fyi/${id}`);
    if (!staticImageResponse.ok)
        return NextResponse.json(
            { message: "The associated resource for this media object could not be found. Check that the object has fully been uploaded before committing." },
            { status: 400 }
        );

    const contentLength = staticImageResponse.headers.get("content-length");

    await prisma.media.update({
        where: { id },
        data: {
            status: MediaStatus.finalized,
            ...(contentLength !== null && { size: bytes(parseInt(contentLength)) })
        }
    });

    return NextResponse.json(
        { message: "Media object upload acknowledged" },
        { status: 200 }
    );
}