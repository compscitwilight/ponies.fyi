import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Guidelines & FAQ | ponies.fyi",
    description: "Content guidelines and frequently asked questions about ponies.fyi"
};

export default function GuidelinesPage() {
    return (
        <div className="text-lg mb-8">
            <div className="mt-4">
                <h1 className="text-3xl font-bold">
                    About ponies.fyi
                </h1>
                <hr className="my-2 h-px border-0 bg-gray-400" />
                <p>
                    <b>ponies.fyi</b> is a community-maintained index of ponysonas (i.e. original characters) created within the My Little Pony fandom and adjacent communities.
                </p>
                <br />
                <p>ponies.fyi exists to document the long tradition of original characters within the fandom.
                    This page explains how submissions work, what the site does and does not do, and how we handle moderation.</p>
            </div>
            <br />
            <div>
                <h2 className="text-2xl font-bold">Ponysonas</h2>
                <hr className="my-2 h-px border-0 bg-gray-400" />
                <p>
                    This section covers guidelines concerning the submission and maintainence of ponysona pages on ponies.fyi
                </p>

                <h3 className="mt-4 text-xl font-bold">What can be submitted?</h3>
                <p>You may submit:</p>
                <ul className="list-disc ml-8">
                    <li>ponysonas</li>
                    <li>fan-created species or hybrids</li>
                    <li>non-pony OCs related to the brony fandom</li>
                </ul>
                <p>You may not submit:</p>
                <ul className="list-disc ml-8">
                    <li>canon characters (e.g. Twilight Sparkle, Sunny Starscout, etc)</li>
                    <li>characters unrelated to the brony fandom</li>
                    <li>joke, spam, or placeholder entries</li>
                </ul>

                <h3 className="mt-4 text-xl font-bold">What makes a good ponysona page?</h3>
                <h4 className="text-lg font-bold mt-2">Required information</h4>
                <ul className="list-disc ml-8">
                    <li>a primary name (and an optional credible list of alises)</li>
                    <li>a species and/or form classification</li>
                    <li>at least one external source or reference</li>
                    <li>basic descriptive metadata</li>
                </ul>
                <p>Gallery and other artwork uploads may be submitted after a ponysona has been approved by site administration.</p>

                <h4 className="text-lg font-bold mt-2">Tags & metadata</h4>
                <p>Tags on ponies.fyi are descriptive and follow a very procedural manner.
                    Tags must be consistent and accurate for every entry on ponies.fyi</p>
                <br />
                <p>Tags should describe:</p>
                <ul className="list-disc ml-8">
                    <li>species or form</li>
                    <li>narrative role (if applicable)</li>
                    <li>setting or universe type (if applicable)</li>
                    <li>notable physical or canonical traits</li>
                </ul>
            </div>
            <br />
            <div>
                <h2 className="text-2xl font-bold">Ownership & control</h2>
                <hr className="my-2 h-px border-0 bg-gray-400" />
                <p>ponies.fyi does <b>not</b> track legal or social ownership of characters.
                    Submitting a ponysona does not grant exclusive control over it.</p>
                <br />
                <p>Any ponysona may be documented if it is:</p>
                <ul className="list-disc ml-8">
                    <li>publicly shared by the creator</li>
                    <li>clearly attributed</li>
                    <li>represented accurately</li>
                </ul>
            </div>
            <br />
            <div>
                <h2 className="text-2xl font-bold">Editing & revisions</h2>
                <hr className="my-2 h-px border-0 bg-gray-400" />
                <p>Ponysona entries may be edited (by registered users) to:</p>
                <ul className="list-disc ml-8">
                    <li>correct factual errors</li>
                    <li>improve accuracy or clarity</li>
                    <li>update references</li>
                    <li>adjust metadata or tags</li>
                </ul>
                <p>
                    All changes are logged internally and may be reverted at the discretion of site administration.
                </p>
            </div>
            <br />
            <div>
                <h2 className="text-2xl font-bold">Moderation</h2>
                <hr className="my-2 h-px border-0 bg-gray-400" />
                <p>All new ponysona entries will initially enter a <b>pending</b> review state.
                    Each entry is manually reviewed for:</p>
                <ul className="list-disc ml-8">
                    <li>completeness</li>
                    <li>accuracy</li>
                    <li>attribution</li>
                    <li>guidelines compliance</li>
                </ul>
                <p>Approval does not imply mod endorsement, only that the entry meets documentation standards.</p>
            </div>
            <br />
            <div>
                <h2 className="text-2xl font-bold">Copyright & disclaimer</h2>
                <hr className="my-2 h-px border-0 bg-gray-400" />
                <p>My Little Pony and related properties are trademarks of Hasbro.</p>
                <br />
                <p>ponies.fyi is:</p>
                <ul className="list-disc ml-8">
                    <li>fan-run</li>
                    <li>non-commercialy</li>
                    <li>and unaffiliated with Hasbro</li>
                </ul>
                <p>All ponysona entries represent fan-created works and are credited to their respective creators.</p>
            </div>
        </div>
    )
}