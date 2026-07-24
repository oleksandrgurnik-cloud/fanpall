import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listingSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sellerId = request.nextUrl.searchParams.get("sellerId");

    const listings = await prisma.listing.findMany({
      where: {
        ...(sellerId ? { sellerId } : { sellerId: session.user.id }),
        status: { not: "INACTIVE" },
      },
      include: {
        game: { select: { name: true, slug: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(listings);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = listingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.create({
      data: {
        ...parsed.data,
        sellerId: session.user.id,
      },
      include: {
        game: { select: { name: true, slug: true } },
        category: { select: { name: true } },
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
