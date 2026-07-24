"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { OfferCard } from "@/components/marketplace/offer-card";
import { OfferListSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useFilterStore } from "@/store/use-filter-store";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  quantity: number;
  seller: {
    id: string;
    name: string;
    rating: number;
    isOnline: boolean;
    isVerified: boolean;
  };
  category: { name: string; slug: string };
}

interface GameCategoryClientProps {
  gameSlug: string;
  gameName: string;
  categories: Category[];
}

export function GameCategoryClient({
  gameSlug,
  gameName,
  categories,
}: GameCategoryClientProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";
  const {
    sortBy,
    minPrice,
    maxPrice,
    onlineOnly,
    setSortBy,
    setMinPrice,
    setMaxPrice,
    setOnlineOnly,
  } = useFilterStore();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeCategory) params.set("category", activeCategory);
      params.set("sort", sortBy);
      if (minPrice) params.set("minPrice", String(minPrice));
      if (maxPrice) params.set("maxPrice", String(maxPrice));
      if (onlineOnly) params.set("onlineOnly", "true");

      const res = await fetch(
        `/api/games/${gameSlug}/listings?${params.toString()}`
      );
      const data = await res.json();
      setListings(data);
      setLoading(false);
    };

    fetchListings();
  }, [gameSlug, activeCategory, sortBy, minPrice, maxPrice, onlineOnly]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{gameName}</h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 space-y-6 lg:w-64">
          <div>
            <h3 className="mb-3 font-semibold">Categories</h3>
            <nav className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              <Link
                href={`/games/${gameSlug}`}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                  !activeCategory && "bg-primary/10 font-medium text-primary"
                )}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/games/${gameSlug}?category=${cat.slug}`}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                    activeCategory === cat.slug &&
                      "bg-primary/10 font-medium text-primary"
                  )}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">Filters</h3>
            <div className="space-y-2">
              <Label htmlFor="sort">Sort by</Label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as typeof sortBy)
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Seller Rating</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="minPrice">Min $</Label>
                <Input
                  id="minPrice"
                  type="number"
                  min={0}
                  value={minPrice ?? ""}
                  onChange={(e) =>
                    setMinPrice(e.target.value ? Number(e.target.value) : null)
                  }
                />
              </div>
              <div>
                <Label htmlFor="maxPrice">Max $</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  min={0}
                  value={maxPrice ?? ""}
                  onChange={(e) =>
                    setMaxPrice(e.target.value ? Number(e.target.value) : null)
                  }
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={onlineOnly}
                onChange={(e) => setOnlineOnly(e.target.checked)}
                className="rounded"
              />
              Online sellers only
            </label>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {loading ? (
            <OfferListSkeleton />
          ) : listings.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <p className="mb-2 text-lg font-medium">No offers found</p>
              <p className="text-muted-foreground">
                No offers found for this game yet. Try adjusting your filters or
                check back later.
              </p>
              <Link href="/dashboard/listings/new">
                <Button className="mt-4">Create a listing</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <OfferCard
                  key={listing.id}
                  id={listing.id}
                  gameSlug={gameSlug}
                  title={listing.title}
                  price={listing.price}
                  sellerName={listing.seller.name}
                  sellerRating={listing.seller.rating}
                  isOnline={listing.seller.isOnline}
                  isVerified={listing.seller.isVerified}
                  stock={listing.quantity}
                  categoryName={listing.category.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
