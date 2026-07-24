import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { gameSlug: string } }
) {
  try {
    const game = await prisma.game.findUnique({
      where: { slug: params.gameSlug },
      include: {
        categories: { orderBy: { name: "asc" } },
        _count: {
          select: { listings: { where: { status: "ACTIVE" } } },
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...game,
      offerCount: game._count.listings,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch game" },
      { status: 500 }
    );
  }
}
