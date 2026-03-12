import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Browse | ponies.fyi"
}

export default function BrowsePage() {
    return (
        <div>
            <h1 className="text-3xl font-bold">Browse ponies.fyi</h1>
            <i>Not to be confused with <Link className="text-sky-600 underline" href="/">search</Link></i>
            <hr className="h-px my-2 border-0 bg-gray-400/50" />
            <div className="p-2 grid gap-2">
                <div className="flex gap-4 p-2 border border-gray-400/50 rounded-md">
                    <div className="flex-1">
                        <Link
                            className="text-xl font-bold text-sky-600 underline"
                            href="/browse/color"
                        >Browse ponysonas by color</Link>
                        <p className="text-lg">
                            Find ponysonas by the colors of their physical attributes
                        </p>
                    </div>
                    <img className="border border-gray-400/50 p-1 object-fit w-[394px]" src="/browse-ponysonas-by-color.webp" />
                </div>
            </div>
        </div>
    )
}