import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const statusUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "PAID",
    "DELIVERED",
    "COMPLETED",
    "DISPUTED",
    "CANCELLED",
  ]),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        listing: {
          include: {
            game: { select: { name: true, slug: true } },
            category: { select: { name: true } },
          },
        },
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (
      order.buyerId !== session.user.id &&
      order.sellerId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: { listing: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = statusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { status } = parsed.data;
    const isBuyer = order.buyerId === session.user.id;
    const isSeller = order.sellerId === session.user.id;

    // Mock escrow flow transitions
    const validTransitions: Record<string, { roles: string[]; from: string[] }> = {
      PAID: { roles: ["buyer"], from: ["PENDING"] },
      DELIVERED: { roles: ["seller"], from: ["PAID"] },
      COMPLETED: { roles: ["buyer"], from: ["DELIVERED"] },
      DISPUTED: { roles: ["buyer", "seller"], from: ["PAID", "DELIVERED"] },
      CANCELLED: { roles: ["buyer"], from: ["PENDING"] },
    };

    const transition = validTransitions[status];
    if (!transition) {
      return NextResponse.json({ error: "Invalid transition" }, { status: 400 });
    }

    if (!transition.from.includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${order.status} to ${status}` },
        { status: 400 }
      );
    }

    const role = isBuyer ? "buyer" : isSeller ? "seller" : null;
    if (!role || !transition.roles.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: params.orderId },
        data: { status },
      });

      // Mock payment: deduct from buyer balance on PAID
      if (status === "PAID") {
        await tx.user.update({
          where: { id: order.buyerId },
          data: { balance: { decrement: order.totalPrice } },
        });
      }

      // Release funds to seller on COMPLETED
      if (status === "COMPLETED") {
        await tx.user.update({
          where: { id: order.sellerId },
          data: { balance: { increment: order.totalPrice } },
        });
        await tx.listing.update({
          where: { id: order.listingId },
          data: { quantity: { decrement: order.quantity } },
        });
      }

      // Refund on CANCELLED
      if (status === "CANCELLED" && order.status === "PENDING") {
        // No charge yet at PENDING
      }

      return updatedOrder;
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
