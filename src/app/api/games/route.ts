import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      include: {
        _count: {
          select: {
            listings: { where: { status: "ACTIVE" } },
          },
        },
        categories: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      games.map((game) => ({
        ...game,
        offerCount: game._count.listings,
      }))
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
