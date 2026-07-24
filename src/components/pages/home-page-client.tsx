"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/marketplace/game-card";
import { Badge } from "@/components/ui/badge";

interface Game {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  offerCount: number;
  categories: { name: string; slug: string }[];
}

const trendingCategories = [
  "Currency",
  "Accounts",
  "Items",
  "Skins",
  "Boosting",
];

export function HomePageClient({ games }: { games: Game[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (filtered.length === 1) {
      router.push(`/games/${filtered[0].slug}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          Buy & Sell Gaming Items
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          Peer-to-peer marketplace for in-game currency, accounts, items, skins,
          and boosting services. Escrow-protected transactions.
        </p>
        <form onSubmit={handleSearch} className="mx-auto flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </section>

      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Trending Categories</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingCategories.map((cat) => (
            <Badge key={cat} variant="secondary" className="px-4 py-1.5 text-sm">
              {cat}
            </Badge>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-semibold">Popular Games</h2>
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
            No games found matching &quot;{search}&quot;
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((game) => (
              <GameCard
                key={game.id}
                slug={game.slug}
                name={game.name}
                imageUrl={game.imageUrl}
                offerCount={game.offerCount}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
