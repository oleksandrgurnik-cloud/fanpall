import { prisma } from "@/lib/prisma";
import { HomePageClient } from "@/components/pages/home-page-client";

export default async function HomePage() {
  const games = await prisma.game.findMany({
    include: {
      categories: true,
      _count: {
        select: { listings: { where: { status: "ACTIVE" } } },
      },
    },
    orderBy: { name: "asc" },
  });

  const gamesWithCount = games.map((game) => ({
    id: game.id,
    name: game.name,
    slug: game.slug,
    imageUrl: game.imageUrl,
    offerCount: game._count.listings,
    categories: game.categories.map((c) => ({ name: c.name, slug: c.slug })),
  }));

  return <HomePageClient games={gamesWithCount} />;
}
