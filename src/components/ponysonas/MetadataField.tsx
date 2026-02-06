import { PropsWithChildren } from "react";

export function MetadataField({
    name, value, className, children
}: PropsWithChildren & { name: string, value?: any, className?: string }) {
    return (
        <div className={className || "flex"}>
            <b className="flex-1">{name}</b>
            <p className="flex-2">{value || children}</p>
        </div>
    )
}