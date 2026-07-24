import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { sellerId: string } }
) {
  try {
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

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json(seller);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch seller" },
      { status: 500 }
    );
  }
}
