import { NextResponse } from "next/server";
import { object, array, string, number, ValidationError } from "yup";
import { TransactionClient } from "@/generated/internal/prismaNamespace";
import { Pattern } from "@/generated/enums";

import prisma from "lib/prisma";
import { createClient } from "lib/supabase";
import { StatusMessages } from "lib/errors";
import { createPonysonaRevision, PonysonaAccessoryBody } from "lib/ponysonas";

const AccessoriesPatchBody = object({
    add: array(PonysonaAccessoryBody.required()).default(new Array<any>()),
    edit: array(object({
        name: string().required(),
        data: PonysonaAccessoryBody.required()
    }).required()).default(new Array<any>()),
    remove: array(number().required()).default(new Array<number>())
});

export async function PATCH(
    request: Request,
    { params }: {
        params: Promise<{
            id: string
        }>
    }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json(
        { message: StatusMessages.NOT_AUTHENTICATED },
        { status: 401 }
    );

    const { id } = await params;
    if (request.headers.get("content-type") !== "application/json")
        return NextResponse.json(
            { message: StatusMessages.INVALID_CONTENT_TYPE },
            { status: 400 }
        );

    const body = await request.json();
    try { AccessoriesPatchBody.validateSync(body) } catch (error) {
        return NextResponse.json(
            { message: (error as ValidationError).message },
            { status: 400 }
        )
    }

    const validatedBody = await AccessoriesPatchBody.validate(body);
    try {
        return await prisma.$transaction(async (tx: TransactionClient) => {
            const ponysona = await tx.ponysona.findUnique({ where: { id }, include: { tags: true } });
            if (ponysona === null) return NextResponse.json(
                { message: StatusMessages.PONYSONA_NOT_FOUND },
                { status: 404 }
            );

            if (ponysona.locked) return NextResponse.json(
                { message: StatusMessages.PONYSONA_LOCKED },
                { status: 403 }
            );

            for (const accessoryToAdd of validatedBody.add) {
                await tx.ponysonaAccessory.create({
                    data: {
                        ponysonaId: ponysona.id,
                        name: accessoryToAdd.name,
                        colors: accessoryToAdd.colors || [],
                        pattern: accessoryToAdd.pattern || Pattern.solid
                    }
                });
            }

            for (const accessoryToEdit of validatedBody.edit) {
                await tx.ponysonaAccessory.update({
                    where: {
                        ponysonaId_name: {
                            ponysonaId: ponysona.id,
                            name: accessoryToEdit.name
                        }
                    },
                    data: {
                        name: accessoryToEdit.data.name,
                        colors: accessoryToEdit.data.colors,
                        pattern: accessoryToEdit.data.pattern
                    }
                });
            }

            for (const accessoryToRemove of validatedBody.remove) {
                await tx.ponysonaAccessory.delete({
                    where: {
                        id: accessoryToRemove,
                        ponysonaId: ponysona.id
                    }
                });
            }

            await tx.ponysona.update({
                where: { id: ponysona.id },
                data: { updatedAt: new Date() }
            });
            
            await createPonysonaRevision(tx, ponysona, user);
            return NextResponse.json(
                { message: "Successfully modified ponysona accessories" },
                { status: 200 }
            );
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: StatusMessages.INTERNAL_SERVER_ERROR }, { status: 500 });
    }
}