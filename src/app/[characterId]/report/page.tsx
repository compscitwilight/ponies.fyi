"use client";

import React, { FormEvent, useState, useEffect } from "react";
import { Ponysona } from "@/generated/client";

export default function PonysonaReportPage({
    params
}: {
    params: Promise<{
        characterId: string
    }>
}) {
    const { characterId } = React.use(params);

    const [ponysona, setPonysona] = useState<Ponysona>();
    const [reportError, setReportError] = useState<string>();

    function onReportSubmit(ev: FormEvent) {
        ev.preventDefault();
        fetch(``)
    }

    useEffect(() => {
        fetch(`/api/ponysonas/${characterId}`, { method: "GET" })
            .then((response) => response.json())
            .then((json: any) => {
                if (json.message) setReportError(json.message);
                else setPonysona(json);
            })
    }, [])

    if (ponysona)
        return (
            <div>
                <h1 className="text-3xl font-bold">Report {ponysona.primaryName}</h1>
                <form onSubmit={onReportSubmit}>
                    <div>

                    </div>
                    <button type="submit">Report</button>
                </form>
            </div>
        );
}