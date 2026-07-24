"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MessageSquare, ShoppingCart } from "lucide-react";
import { PriceTag } from "@/components/marketplace/price-tag";
import { SellerCard } from "@/components/marketplace/seller-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface OfferDetailClientProps {
  offer: {
    id: string;
    title: string;
    description: string;
    price: number;
    quantity: number;
    images: string[];
    seller: {
      id: string;
      name: string;
      avatar: string | null;
      rating: number;
      reviewCount: number;
      isOnline: boolean;
      isVerified: boolean;
      responseTime: string | null;
    };
    game: { name: string; slug: string };
    category: { name: string; slug: string };
  };
}

export function OfferDetailClient({ offer }: OfferDetailClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const total = offer.price * quantity;

  const handleBuyNow = () => {
    router.push(`/checkout/${offer.id}?quantity=${quantity}`);
  };

  const handleChat = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId: offer.seller.id }),
    });
    const conversation = await res.json();
    setLoading(false);
    router.push(`/messages/${conversation.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>
        {" / "}
        <Link href={`/games/${offer.game.slug}`} className="hover:text-primary">
          {offer.game.name}
        </Link>
        {" / "}
        <span>{offer.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <Badge variant="outline" className="mb-2">{offer.category.name}</Badge>
            <h1 className="text-3xl font-bold">{offer.title}</h1>
          </div>

          {offer.images.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {offer.images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={img}
                  alt={`${offer.title} ${i + 1}`}
                  className="rounded-lg border object-cover aspect-video w-full"
                />
              ))}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {offer.description}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <PriceTag price={offer.price} size="lg" />
              <p className="text-sm text-muted-foreground">
                {offer.quantity} available
              </p>

              <div className="space-y-2">
                <Label htmlFor="qty">Quantity</Label>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  max={offer.quantity}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.min(
                        offer.quantity,
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    )
                  }
                />
              </div>

              <div className="flex justify-between border-t pt-4 font-semibold">
                <span>Total</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatPrice(total)}
                </span>
              </div>

              <Button className="w-full" size="lg" onClick={handleBuyNow}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Buy Now
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleChat}
                disabled={loading}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat with seller
              </Button>
            </CardContent>
          </Card>

          <SellerCard
            sellerId={offer.seller.id}
            name={offer.seller.name}
            avatar={offer.seller.avatar}
            rating={offer.seller.rating}
            reviewCount={offer.seller.reviewCount}
            isOnline={offer.seller.isOnline}
            isVerified={offer.seller.isVerified}
            responseTime={offer.seller.responseTime}
          />
        </div>
      </div>
    </div>
  );
}
