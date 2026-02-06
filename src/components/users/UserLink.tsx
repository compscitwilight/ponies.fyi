import Link from "next/link";
import prisma from "lib/prisma";

/**
 * Given a UUID, creates the appropriate link redirecting to that profile.
 */
export async function UserLink({ id }: { id: string }) {
    const profile = await prisma.profile.findUnique({ where: { userId: id } });
    return (
        <Link className="text-sky-600 underline" href={`/u/${profile ? profile.alias : id}`}>
            {profile ? profile.alias : `User ${id}`}
        </Link>
    )
}