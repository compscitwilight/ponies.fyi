import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { array, mixed, number, object, string, ValidationError } from "yup";

import prisma from "lib/prisma";
import { TransactionClient } from "@/generated/internal/prismaNamespace";
import { Color, ColorTone, Pattern } from "@/generated/enums";

const PonysonaAttributeBody = object({
    color: mixed<Color>().oneOf(Object.values(Color)).required(),
    tone: mixed<ColorTone>().oneOf(Object.values(ColorTone)).required(),
    pattern: mixed<Pattern>().oneOf(Object.values(Pattern)).optional()
});

const NewPonysonaBody = object({
    primaryName: string().required(),
    otherNames: array(string()).nullable().optional(),
    description: string().nullable().optional(),
    tagIds: array(number()).required(),
    sources: array(string()).nullable().optional(),
    creators: array(string()).nullable().optional(),
    colorsHex: array(string()).required(),
    colorsName: array(string()).required(),
    attributes: object({
        mane: PonysonaAttributeBody.nullable().optional(),
        tail: PonysonaAttributeBody.nullable().optional(),
        coat: PonysonaAttributeBody.nullable().optional(),
        wings: PonysonaAttributeBody.nullable().optional(),
        horn: PonysonaAttributeBody.nullable().optional(),
        eyes: PonysonaAttributeBody.nullable().optional()
    })
});

export async function POST(request: Request) {
    const requestHeaders = await headers();
    if (requestHeaders.get("content-type") !== "application/json")
        return NextResponse.json(
            { message: "'Content-Type' must be application/json" },
            { status: 400 }
        );

    const requestBody = await request.json();
    try { NewPonysonaBody.validateSync(requestBody) } catch (error) {
        if (error instanceof ValidationError)
            return NextResponse.json(
                { message: (error as ValidationError).message },
                { status: 400 }
            )
    }

    const validatedBody = await NewPonysonaBody.validate(requestBody);
    try {
        await prisma.$transaction(async (tx: TransactionClient) => {
            // const newPonysona = await tx.ponysona.create({
            //     data: {

            //     }
            // });

            
        })
    } catch (error) {
        return NextResponse.json(
            { message: (error as Error).message },
            { status: 500 }
        );
    }
}