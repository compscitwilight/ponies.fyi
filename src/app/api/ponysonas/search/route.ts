import { NextResponse } from "next/server";

import prisma from "lib/prisma";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const query = searchParams.get("q");
    const maxResults = searchParams.get("max_results");
    if (query === null) return NextResponse.json(
        { message: "A query was not provided" },
        { status: 400 }
    )

    const results = await prisma.ponysona.findMany({
        where: {
            primaryName: { contains: query, mode: "insensitive" }
        },
        include: { media: true },
        take: parseInt(maxResults || "") || 5
    });
    
    return NextResponse.json(results, { status: 200 })
}