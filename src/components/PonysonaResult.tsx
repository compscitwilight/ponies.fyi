import Link from "next/link";
import { Ponysona, PonysonaAppearanceAttribute, PonysonaTag } from "@/generated/client";
import { Tag } from "./Tag";

export function PonysonaResult({ ponysona }: {
    ponysona: Ponysona & { attributes: Array<PonysonaAppearanceAttribute>, tags: Array<PonysonaTag> }
}) {
    const colors = [...new Set(
        ponysona.attributes.map((att: PonysonaAppearanceAttribute) => att.colors).flat()
    )];

    return (
        <div className="border border-gray-400/50 rounded-md p-2">
            <div className="overflow-hidden">
                <img
                    className="object-fit max-h-[256px] max-w-[256px] m-auto"
                    src={`/api/ponysonas/${ponysona.id}/preview`}
                />
                {colors.length > 0 && <div className="flex justify-center mt-2">
                    {
                        colors.map((color: string) =>
                            <span key={color} title={color} className="w-8 h-4" style={{ backgroundColor: color }}></span>
                        )
                    }
                </div>}
            </div>
            <b className="text-2xl">{ponysona.primaryName}</b>
            <div className="flex items-center gap-1">
                <b className="self-start">Tags:</b>
                <div className="flex gap-1 flex-wrap">
                    {ponysona.tags.map((tag: PonysonaTag) =>
                        <Tag key={tag.id} tag={tag} />
                    )}
                </div>
                {/* <p>{ponysona.tags.join(", ")}</p> */}
            </div>
            <div className="text-center mt-2">
                <Link
                    href={`/${ponysona.slug}`}
                    className="text-sky-600 font-bold text-xl underline"
                >Visit page</Link>
            </div>
        </div>
    )
}