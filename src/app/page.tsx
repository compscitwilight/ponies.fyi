import Link from "next/link";
import { PropsWithChildren } from "react";
import prisma from "lib/prisma";
import { Ponysona, PonysonaTag } from "@/generated/client";
import { PaginatedResults } from "@/components/PaginatedResults";

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
    state?: "ponysona_not_found" | "page_not_found" | "auth_error" | "logged_out" | "unauthorized"
  }>
}) {
  const { page: pageParam, q: query, state: pageState } = await searchParams;
  const page = Math.max(1, Number(parseInt(pageParam ?? "1")));
  const itemsPerPage = 50;

  const ponysonas = await prisma.ponysona.findMany({
    where: {
      ...(query && {
        OR: [
          { primaryName: { contains: query, mode: "insensitive" } },
          { otherNames: { has: query } },
          { description: { contains: query, mode: "default" } }
        ]
      })
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * itemsPerPage,
    take: itemsPerPage
  }) as Array<Ponysona & { tags: Array<PonysonaTag> }>;

  for (const ponysona of ponysonas)
    ponysona.tags = await Promise.all(ponysona.tagIds.map((tagId: number) =>
      prisma.ponysonaTag.findUnique({ where: { id: tagId } })
    )) as Array<PonysonaTag>;

  const ponysonasCount = await prisma.ponysona.count();

  return (
    <div>
      {
        pageState === "page_not_found" &&
        <PageWarning>The page requested could not be found.</PageWarning>
      }

      {
        pageState === "ponysona_not_found" &&
        <PageWarning>The ponysona requested could not be found</PageWarning>
      }

      {
        pageState === "auth_error" &&
        <PageWarning>An unexpected error occurred while authenticating.</PageWarning>
      }

      {
        pageState === "logged_out" &&
        <PageWarning>Logged out successfully.</PageWarning>
      }

      {
        pageState === "unauthorized" &&
        <PageWarning>You are not allowed to access that page.</PageWarning>
      }

      <h1 className="text-3xl font-bold">Home</h1>
      <hr className="h-px my-2 border-0 bg-gray-300" />
      <PaginatedResults
        items={ponysonas}
        page={page}
        pageSize={itemsPerPage}
        totalCount={ponysonasCount}
      />
    </div>
  );
}
