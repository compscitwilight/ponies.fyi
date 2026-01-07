import { PonysonaTag } from "@/generated/client";
import { Plus, Minus } from "lucide-react";

export function Tag({
    tag,
    editing,
    added,
    onClick
}: {
    tag: PonysonaTag,
    editing?: boolean,
    added?: boolean,
    onClick?: (tag: PonysonaTag) => void
}) {
    return (
        <div className={`flex w-fit items-center p-1 rounded-md border gap-1 ${tag.type === "form" ? "bg-orange-300 border-orange-400" :
            tag.type === "genre" ? "bg-blue-400 boder-blue-500" :
                tag.type === "role" ? "bg-cyan-300 border-cyan-400" :
                    tag.type === "setting" ? "bg-neutral-300 border-neutral-400" :
                        tag.type === "species" ? "bg-emerald-300 border-emerald-400" :
                            tag.type === "trait" && "bg-orange-500 border-orange-600"
            }`}>
            <p className="text-sm text-gray-700">{tag.type}:</p>
            <p className="text-gray-800 font-bold">{tag.name}</p>
            <div onMouseDown={() => {
                if (onClick) onClick(tag);
            }} >
                {editing && (
                    !added ? <Plus className="cursor-pointer text-gray-600 rounded-lg bg-white" /> :
                        <Minus className="cursor-pointer text-gray-600 rounded-lg bg-white" />
                )}
            </div>
        </div>
    )
}