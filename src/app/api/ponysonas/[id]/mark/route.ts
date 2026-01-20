import { NextResponse } from "next/server"
import { redirect } from "next/navigation";
import prisma from "lib/prisma";
import { StatusMessages } from "lib/errors";
import { MediaType } from "@/generated/enums";

export async function GET(
    request: Request,
    { params }: {
        params: Promise<{
            id: string
        }>
    }
) {
    const { id } = await params;
    const ponysona = await prisma.ponysona.findUnique({ where: { id } });
    if (ponysona === null)
        return NextResponse.json({ message: StatusMessages.PONYSONA_NOT_FOUND }, { status: 404 });

    const markObject = await prisma.media.findFirst({
        where: {
            ponysonaId: ponysona.id,
            type: MediaType.mark
        }
    });

    if (markObject === null)
        return NextResponse.json({ message: StatusMessages.MEDIA_NOT_FOUND }, { status: 404 });

    return redirect(`https://static.ponies.fyi/${markObject.id}`);
}