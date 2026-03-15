import { User } from "@supabase/supabase-js";
import prisma from "lib/prisma";

export async function createUserProfile(user: User) {
    const profile = await prisma.profile.create({
        data: { userId: user.id }
    });
    return profile;
}