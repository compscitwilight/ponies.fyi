import { NextResponse } from "next/server";
import prisma from "lib/prisma";
import { StatusMessages } from "lib/errors";

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
        return NextResponse.json(
            { message: StatusMessages.PONYSONA_NOT_FOUND },
            { status: 404 }
        );

    const objects = await prisma.media.findMany({
        where: { ponysonaId: ponysona.id }
    });

    return NextResponse.json(objects, { status: 200 });
}