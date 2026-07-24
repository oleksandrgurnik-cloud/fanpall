import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const type = request.nextUrl.searchParams.get("type") ?? "purchases";

    const orders = await prisma.order.findMany({
      where:
        type === "sales"
          ? { sellerId: session.user.id }
          : { buyerId: session.user.id },
      include: {
        listing: {
          include: {
            game: { select: { name: true, slug: true } },
          },
        },
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
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
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: parsed.data.listingId },
    });

    if (!listing || listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Listing not available" },
        { status: 404 }
      );
    }

    if (listing.sellerId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot buy your own listing" },
        { status: 400 }
      );
    }

    if (parsed.data.quantity > listing.quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      );
    }

    const totalPrice = listing.price * parsed.data.quantity;

    const order = await prisma.order.create({
      data: {
        buyerId: session.user.id,
        sellerId: listing.sellerId,
        listingId: listing.id,
        quantity: parsed.data.quantity,
        totalPrice,
        status: "PENDING",
      },
      include: {
        listing: {
          include: { game: { select: { name: true, slug: true } } },
        },
        seller: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
