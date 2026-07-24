import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: parsed.data.orderId },
    });

    if (!order || order.buyerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only review completed orders" },
        { status: 400 }
      );
    }

    const existing = await prisma.review.findUnique({
      where: { orderId: parsed.data.orderId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Review already submitted" },
        { status: 409 }
      );
    }

    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          orderId: parsed.data.orderId,
          authorId: session.user.id,
          targetId: order.sellerId,
          rating: parsed.data.rating,
          comment: parsed.data.comment,
        },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
        },
      });

      const reviews = await tx.review.findMany({
        where: { targetId: order.sellerId },
      });

      const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await tx.user.update({
        where: { id: order.sellerId },
        data: {
          rating: avgRating,
          reviewCount: reviews.length,
        },
      });

      return newReview;
    });

    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
