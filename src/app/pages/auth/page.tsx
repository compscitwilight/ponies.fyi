"use client";

import { useState, useEffect, FormEvent } from "react";
import { AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/lib/auth";

export default function AuthPage() {
    const [loading, setLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [session, setSession] = useState<any>(null);

    const params = new URLSearchParams(location.search);
    const hasTokenHash = params.get("token_hash");
    const [verifying, setVerifying] = useState<boolean>(!!hasTokenHash);
    const [authError, setAuthError] = useState<string | null>(null);
    const [authSuccess, setAuthSuccess] = useState<boolean>(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenHash = params.get("tokenHash");
        const type = params.get("type");

        if (tokenHash && type) {
            supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: (type as any) || "email"
            })
                .then(({ error }) => {
                    if (error) {
                        setAuthError(error.message);
                    } else {
                        setAuthSuccess(true);
                        window.history.replaceState({}, document.title, "/");
                    }
                    setVerifying(false);
                });
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        })

        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session) => {
            setSession(session);
        })

        return () => subscription.unsubscribe();
    }, []);

    async function handleDiscordLogin() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "discord",
            options: {
                redirectTo: process.env.NEXT_PUBLIC_NODE_ENV === "production" ?
                    "https://ponies.fyi/api/auth/callback" :
                    "http://localhost:3000/api/auth/callback"
            }
        });

        if (error) {
            alert("Failed to authenticate with Discord OAuth");
        }
    }

    return (
        <div>
            <button onMouseDown={handleDiscordLogin}>do it</button>
        </div>
    )
}