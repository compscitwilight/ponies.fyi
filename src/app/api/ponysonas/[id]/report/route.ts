import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { object, string } from "yup";
import { StatusMessages } from "lib/errors";
import prisma from "lib/prisma";

const ReportRequestBody = object({
    cfToken: string().required(),
    reportType: string().required(), // temp
    message: string().nullable().optional()
});

export async function POST(request: Request, { params }: {
    params: Promise<{
        id: string
    }>
}) {
    const requestHeaders = await headers();
    if (requestHeaders.get("content-type") !== "application/json")
        return NextResponse.json(
            { message: StatusMessages.INVALID_CONTENT_TYPE },
            { status: 400 }
        );

    const { id } = await params;
    const ponysona = await prisma.ponysona.findUnique({ where: { id } });
    if (ponysona === null)
        return NextResponse.json(
            { message: StatusMessages.PONYSONA_NOT_FOUND },
            { status: 404 }
        );

    const body = await request.json();
}