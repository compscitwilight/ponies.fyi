import Link from "next/link";
import { PropsWithChildren } from "react";
import prisma from "lib/prisma";
import { Ponysona, PonysonaAppearanceAttribute, PonysonaStatus, PonysonaTag, Prisma } from "@/generated/client";
import { PonysonaResult } from "@/components/PonysonaResult";
import { PageNavigation } from "@/components/search/PageNavigation";
import { MaxResultsDropdown } from "@/components/search/MaxResultsDropdown";

function PageWarning({ children }: PropsWithChildren) {
  return (
    <div>
      <div className="flex p-2 text-center gap-1 border rounded-md bg-yellow-300/50 border-yellow-400">
        <div className="flex-1">{children}</div>
        <Link className="text-sky-600 font-bold underline" href="/">Close</Link>
      </div>
    </div>
  )
}

export default async function HomePage({ searchParams }: {
  searchParams: Promise<{
    page?: string,
    q?: string,
    max_results?: string,
    state?: "ponysona_not_found" |
      "page_not_found" |
      "media_not_found" |
      "user_not_found" |
      "auth_error" |
      "logged_out" |
      "unauthorized"
  }>
}) {
  const {
    page: pageParam,
    q: query,
    max_results,
    state: pageState
  } = await searchParams;

  const page = Math.max(1, Number(parseInt(pageParam ?? "1")));
  const parsedMaxResults = Math.min(parseInt(max_results as string) || 15, 100);
  const searchTerms = query ? query.split(",").map((t: string) => t.trim()) : [];

  const conditions = searchTerms.map((term: string) => ({
    OR: [
      { primaryName: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { tags: { some: { name: { contains: term, mode: "insensitive" } } } }
    ]
  }))

  const where: Prisma.PonysonaWhereInput | any = {
    ...(searchTerms.length ? (searchTerms.length > 1 ? { AND: conditions } : { OR: conditions }) : {}),
    status: PonysonaStatus.Approved
  };

  const ponysonas = await prisma.ponysona.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { attributes: true, tags: true },
    skip: (page - 1) * parsedMaxResults,
    take: parsedMaxResults
  });

  const ponysonasCount = await prisma.ponysona.count({ where });
  const totalPages = Math.max(1, Math.ceil(ponysonasCount / parsedMaxResults));

  return (
    <div className="pb-4">
      {pageState === "page_not_found" && <PageWarning>The page requested could not be found.</PageWarning>}
      {pageState === "ponysona_not_found" && <PageWarning>The ponysona requested could not be found.</PageWarning>}
      {pageState === "media_not_found" && <PageWarning>The media requested could not be found.</PageWarning>}
      {pageState === "user_not_found" && <PageWarning>The user requested could not be found.</PageWarning>}
      {pageState === "auth_error" && <PageWarning>An unexpected error occurred while authenticating.</PageWarning>}
      {pageState === "logged_out" && <PageWarning>Logged out successfully.</PageWarning>}
      {pageState === "unauthorized" && <PageWarning>You are not allowed to access that page.</PageWarning>}

      <h1 className="text-3xl font-bold">Home</h1>
      <hr className="h-px my-2 border-0 bg-gray-300" />
      <div>
        <MaxResultsDropdown />
        {ponysonas.length > 0 && <div className="grid lg:grid-cols-3 gap-2">
          {
            ponysonas.map((item: Ponysona & { attributes: Array<PonysonaAppearanceAttribute>, tags: Array<PonysonaTag> }, index: number) =>
              <PonysonaResult key={index} ponysona={item} />
            )
          }
        </div>}

        {ponysonas.length === 0 && (
          <div className="text-center text-gray-700">
            <p>No results found.</p>
          </div>
        )}

        <PageNavigation currentPage={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
