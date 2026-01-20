import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { object, string, mixed, ValidationError } from "yup";
import { MediaType } from "@/generated/enums";

import prisma from "lib/prisma";
import { StatusMessages } from "lib/errors";
import { generatePresignedUploadURL } from "lib/aws";

const MediaCreateBody = object({
    type: mixed<MediaType>().oneOf(Object.values(MediaType)).required(),
    mime: string().required()
});

export async function POST(request: Request) {
    const requestHeaders = await headers();
    if (requestHeaders.get("content-type") !== "application/json")
        return NextResponse.json({ message: StatusMessages.INVALID_CONTENT_TYPE }, { status: 400 });

    const body = await request.json();
    try { MediaCreateBody.validateSync(body) } catch (error) {
        return NextResponse.json({
            message: (error as ValidationError).message,
            status: 400
        })
    }

    const validatedBody = await MediaCreateBody.validate(body);
    const mediaObject = await prisma.media.create({
        data: { type: validatedBody.type }
    });

    const url = await generatePresignedUploadURL(mediaObject.id, validatedBody.mime);
    return NextResponse.json({ uuid: mediaObject.id, url }, { status: 200 });
}