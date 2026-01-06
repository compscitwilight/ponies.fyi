import prisma from "lib/prisma";
import { PaginatedResults } from "@/components/PaginatedResults";

export default async function HomePage({ searchParams }: {
  searchParams: {
    page?: string,
    q?: string
  }
}) {
  const { page: pageParam, q: query } = await searchParams;
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
  });

  const ponysonasCount = await prisma.ponysona.count();

  return (
    <div>
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
