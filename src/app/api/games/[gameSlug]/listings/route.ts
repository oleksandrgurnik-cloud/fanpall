import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { gameSlug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const sortBy = searchParams.get("sort") ?? "newest";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const onlineOnly = searchParams.get("onlineOnly") === "true";

    const game = await prisma.game.findUnique({
      where: { slug: params.gameSlug },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const where: Prisma.ListingWhereInput = {
      gameId: game.id,
      status: "ACTIVE",
    };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (onlineOnly) {
      where.seller = { isOnline: true };
    }

    let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: "desc" };
    switch (sortBy) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "rating":
        orderBy = { seller: { rating: "desc" } };
        break;
    }

    const listings = await prisma.listing.findMany({
      where,
      orderBy,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            rating: true,
            isOnline: true,
            isVerified: true,
          },
        },
        category: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json(listings);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
