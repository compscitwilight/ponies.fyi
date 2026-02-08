import { NextResponse } from "next/server";
import { ValidationError, mixed, object, string } from "yup";
import { RelationshipDirection, RelationshipType } from "@/generated/enums";

import prisma from "lib/prisma";
import { createClient } from "lib/supabase";
import { StatusMessages } from "lib/errors";
import { TransactionClient } from "@/generated/internal/prismaNamespace";

const NewRelationshipBody = object({
    a: string().required(),
    b: string().required(),
    direction: mixed<RelationshipDirection>()
        .oneOf(Object.values(RelationshipDirection))
        .required()
        .default(RelationshipDirection.AB),
    type: mixed<RelationshipType>()
        .oneOf(Object.values(RelationshipType))
        .required()
        .default(RelationshipType.friends),
    label: string().optional()
});

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user === null) return NextResponse.json(
        { message: StatusMessages.NOT_AUTHENTICATED },
        { status: 401 }
    );

    if (request.headers.get("content-type") !== "application/json")
        return NextResponse.json(
            { message: StatusMessages.INVALID_CONTENT_TYPE },
            { status: 400 }
        );

    const body = await request.json();
    try { NewRelationshipBody.validateSync(body) } catch (error) {
        return NextResponse.json(
            { message: (error as ValidationError).message },
            { status: 400 }
        );
    }

    const validatedBody = await NewRelationshipBody.validate(body);
    try {
        return await prisma.$transaction(async (tx: TransactionClient) => {
            const ponysonaA = await tx.ponysona.findUnique({ where: { id: validatedBody.a } });
            if (ponysonaA === null) return NextResponse.json(
                { message: StatusMessages.PONYSONA_NOT_FOUND },
                { status: 404 }
            );

            const ponysonaB = await tx.ponysona.findUnique({ where: { id: validatedBody.b } });
            if (ponysonaB === null) return NextResponse.json(
                { message: StatusMessages.PONYSONA_NOT_FOUND },
                { status: 404 }
            );

            const newRelationship = await tx.ponysonaRelationship.create({
                data: {
                    ponysonaA: ponysonaA.id,
                    ponysonaB: ponysonaB.id,
                    type: validatedBody.type,
                    direction: validatedBody.direction
                }
            });

            return NextResponse.json(newRelationship, { status: 200 });
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: StatusMessages.INTERNAL_SERVER_ERROR },
            { status: 500 }
        );
    }
}