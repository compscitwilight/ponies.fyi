import { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "lib/supabase";

import { NewRelationshipForm } from "@/components/ponysonas/relationships/NewRelationshipForm"

export const metadata: Metadata = {
    title: "Create a relationship | ponies.fyi"
}

export default async function CreateRelationshipPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user === null) redirect("/?state=unauthorized");

    return (
        <NewRelationshipForm />
    )
}