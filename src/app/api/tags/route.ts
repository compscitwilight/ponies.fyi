import { NextResponse } from "next/server";
import prisma from "lib/prisma";

export async function GET() {
    const tags = await prisma.ponysonaTag.findMany();
    return NextResponse.json(tags, { status: 200 });
}