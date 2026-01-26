"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/auth";

export default function LogoutPage() {
    const [logoutError, setLogoutError] = useState<string>();

    useEffect(() => {
        supabase.auth.signOut().then(({ error }) => {
            if (!error) {
                window.location.assign("/?state=logged_out");
            } else setLogoutError(error.message);
        })
    }, []);

    return logoutError ? (
        <div>
            <h1 className="text-3xl font-bold">An error occurred while logging out</h1>
            <p>{logoutError}</p>
        </div>
    ) : <></>;
}