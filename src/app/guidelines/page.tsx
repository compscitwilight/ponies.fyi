import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Guidelines & FAQ | ponies.fyi",
    description: "Content guidelines and frequently asked questions about ponies.fyi"
};

export default function GuidelinesPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-center">
                Guidelines and (not so frequently asked) questions
            </h1>

        </div>
    )
}