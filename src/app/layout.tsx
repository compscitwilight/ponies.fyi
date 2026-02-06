import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next"

import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Plus, Github } from "lucide-react";
import { SearchBox } from "@/components/SearchBox";
import "./globals.css";

import { createClient } from "lib/supabase";
import prisma from "lib/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ponies.fyi",
  description: "Open-source, community-maintained reference index for ponysonas and other fan-created characters.",
};

export const viewport: Viewport = {
  themeColor: "#844ae0ff"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user ? await prisma.profile.findUnique({ where: { userId: user.id } }) : null;

  const versionResponse = await fetch("https://api.github.com/repos/compscitwilight/ponies.fyi/commits?per_page=1");
  const commits = await versionResponse.json();
  const { sha } = commits[0] || { sha: "" };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense>
          <div className="flex flex-col lg:flex-row lg:w-2/3 pb-4 m-auto border-b border-gray-400/50">
            <div className="flex flex-col lg:flex-row flex-1 items-center gap-4">
              <div className="flex items-center gap-1">
                <img className="object-fit w-[64px] -m-4" src="/derpy.png" />
                <Link href="/" className="font-equestria ml-4">ponies.fyi</Link>
              </div>
              <div className="text-sky-600 underline text-lg flex flex-col lg:flex-row gap-2 items-center flex-wrap">
                <Link href="/">[ Home ]</Link>
                {user ? <Link href="/pages/auth/logout">[ Logout ]</Link> : <Link href="/pages/auth">[ Login ]</Link>}
                <Link href="/pages/guidelines">[ Guidelines & FAQ ]</Link>
                {profile?.isAdmin && <Link href="/pages/moderation">[ Moderation ]</Link>}
              </div>
              {/* <p className="self-end mb-2">An open-source index for discovering and referencing ponysonas</p> */}
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-4 mr-4">
              <SearchBox />
              <div className="flex gap-1">
                <a href="/pages/create" title="Add pony" className="cursor-pointer">
                  <Plus />
                </a>
                <a
                  href="https://github.com/compscitwilight/ponies.fyi"
                  target="_blank"
                  title="Source code"
                  className="flex items-center gap-1 cursor-pointer transition-text duration-200 hover:text-blue-500"
                >
                  <Github />
                  <p>{sha.slice(0, 7)}</p>
                </a>
              </div>
            </div>
          </div>

        </Suspense>
        {/* <div className="text-center w-full border border-yellow-300 bg-yellow-200/75 py-1 my-2 font-bold">
          <p>Testing this for development</p>
        </div> */}
        <div className="lg:w-1/2 m-auto mt-8">
          {children}
          <Analytics />
        </div>
      </body>
    </html>
  );
}
