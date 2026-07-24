import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { GameCategoryClient } from "@/components/pages/game-category-client";
import { OfferListSkeleton } from "@/components/ui/skeleton";

interface Props {
  params: { gameSlug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const game = await prisma.game.findUnique({
    where: { slug: params.gameSlug },
  });
  if (!game) return { title: "Game Not Found" };
  return {
    title: `${game.name} — Buy & Sell`,
    description: `Browse ${game.name} offers: currency, accounts, items, skins, and boosting services.`,
  };
}

export default async function GameCategoryPage({ params }: Props) {
  const game = await prisma.game.findUnique({
    where: { slug: params.gameSlug },
    include: { categories: { orderBy: { name: "asc" } } },
  });

  if (!game) notFound();

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8"><OfferListSkeleton /></div>}>
      <GameCategoryClient
        gameSlug={game.slug}
        gameName={game.name}
        categories={game.categories}
      />
    </Suspense>
  );
}
