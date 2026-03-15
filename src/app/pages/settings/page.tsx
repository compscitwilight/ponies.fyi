import { redirect } from "next/navigation";

import { createClient, getUserProfile } from "lib/supabase";
import { SettingsField } from "@/components/settings/SettingsField";

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user === null) redirect("/?state=unauthorized");

    const profile = await getUserProfile(user);

    return (
        <div className="m-auto lg:w-3/4">
            <h1 className="text-3xl font-bold">Settings</h1>
            <hr className="h-px my-2 border-0 bg-gray-400/50" />

            <div>
                <h2 className="text-2xl font-bold">Profile</h2>
                <SettingsField
                    name="Alias"
                    setting="alias"
                    type="text"
                    defaultValue={profile?.alias}
                />
                <SettingsField
                    name="About me"
                    setting="bio"
                    type="bigtext"
                    defaultValue={profile?.bio}
                />
            </div>
        </div>
    )
}