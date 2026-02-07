import { NextResponse } from "next/server";
import prisma from "lib/prisma";
import { PonysonaStatus } from "@/generated/enums";
import { StatusMessages } from "lib/errors";

export async function GET(request: Request) {
    const rnd = Math.floor(Math.random() * (await prisma.ponysona.count()) - 1);
    const ponysona = await prisma.ponysona.findFirst({
        where: { status: PonysonaStatus.Approved },
        include: { tags: true, attributes: true },
        skip: rnd,
        take: 1
    })

    if (ponysona === null) return NextResponse.json(
        { message: StatusMessages.PONYSONA_NOT_FOUND },
        { status: 404 }
    );

    return NextResponse.json(ponysona, { status: 200 });
}