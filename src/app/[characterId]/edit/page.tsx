import { redirect } from "next/navigation";

export default async function PonysonaEditRedirectPage({
    params
}: {
    params: Promise<{
        characterId: string
    }>
}) {
    const { characterId } = await params;
    redirect(`/pages/create?editing=${characterId}`);
}