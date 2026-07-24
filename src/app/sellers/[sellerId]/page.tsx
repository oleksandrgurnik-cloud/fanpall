import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SellerCard } from "@/components/marketplace/seller-card";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { PriceTag } from "@/components/marketplace/price-tag";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface Props {
  params: { sellerId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const seller = await prisma.user.findUnique({
    where: { id: params.sellerId },
    select: { name: true },
  });
  if (!seller) return { title: "Seller Not Found" };
  return {
    title: `${seller.name} — Seller Profile`,
    description: `View ${seller.name}'s listings and reviews on FunPall.`,
  };
}

export default async function SellerProfilePage({ params }: Props) {
  const seller = await prisma.user.findUnique({
    where: { id: params.sellerId },
    select: {
      id: true,
      name: true,
      avatar: true,
      rating: true,
      reviewCount: true,
      isVerified: true,
      isOnline: true,
      responseTime: true,
      createdAt: true,
      listings: {
        where: { status: "ACTIVE" },
        include: {
          game: { select: { name: true, slug: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      reviewsReceived: {
        include: {
          author: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!seller) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SellerCard
            sellerId={seller.id}
            name={seller.name}
            avatar={seller.avatar}
            rating={seller.rating}
            reviewCount={seller.reviewCount}
            isOnline={seller.isOnline}
            isVerified={seller.isVerified}
            responseTime={seller.responseTime}
          />
          <p className="mt-4 text-sm text-muted-foreground">
            Member since {seller.createdAt.toLocaleDateString()}
          </p>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Active Listings ({seller.listings.length})
            </h2>
            {seller.listings.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                No active listings
              </div>
            ) : (
              <div className="space-y-3">
                {seller.listings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/games/${listing.game.slug}/offers/${listing.id}`}
                  >
                    <Card className="transition-colors hover:bg-accent/50">
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium">{listing.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {listing.game.name} · {listing.category.name}
                          </p>
                        </div>
                        <PriceTag price={listing.price} />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Reviews ({seller.reviewsReceived.length})
            </h2>
            {seller.reviewsReceived.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                No reviews yet
              </div>
            ) : (
              <div className="space-y-4">
                {seller.reviewsReceived.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.author.name}</span>
                          <RatingStars rating={review.rating} size="sm" />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
