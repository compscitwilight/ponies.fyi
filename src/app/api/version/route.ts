import { StatusMessages } from "lib/errors";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const response = await fetch("https://api.github.com/repos/compscitwilight/ponies.fyi/commits?per_page=1");
    if (!response.ok)
        return NextResponse.json(
            { message: StatusMessages.INTERNAL_SERVER_ERROR },
            { status: response.status }
        );
    
    const commits = await response.json() as Array<{ sha: string }>;
    if (commits.length === 0)
        return NextResponse.json(
            { message: StatusMessages.INTERNAL_SERVER_ERROR },
            { status: 500 }
        );

    const { sha } = commits[0];
    return NextResponse.json({ sha }, { status: 200 });
}