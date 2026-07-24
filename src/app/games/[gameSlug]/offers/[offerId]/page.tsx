import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { OfferDetailClient } from "@/components/pages/offer-detail-client";

interface Props {
  params: { gameSlug: string; offerId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await prisma.listing.findUnique({
    where: { id: params.offerId },
    include: { game: true },
  });
  if (!listing) return { title: "Offer Not Found" };
  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
  };
}

export default async function OfferDetailPage({ params }: Props) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.offerId },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          avatar: true,
          rating: true,
          reviewCount: true,
          isOnline: true,
          isVerified: true,
          responseTime: true,
        },
      },
      game: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
    },
  });

  if (!listing || listing.game.slug !== params.gameSlug) notFound();
  if (listing.status !== "ACTIVE") notFound();

  return <OfferDetailClient offer={listing} />;
}
