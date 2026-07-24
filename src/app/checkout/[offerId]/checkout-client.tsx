"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle2, Clock, Package, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

const statusSteps = [
  { key: "PENDING", label: "Pending", icon: Clock },
  { key: "PAID", label: "Paid", icon: Shield },
  { key: "DELIVERED", label: "Delivered", icon: Package },
  { key: "COMPLETED", label: "Completed", icon: CheckCircle2 },
];

interface Order {
  id: string;
  status: string;
  quantity: number;
  totalPrice: number;
  listing: {
    title: string;
    game: { name: string; slug: string };
  };
  seller: { id: string; name: string };
}

export default function CheckoutClient({
  params,
}: {
  params: { offerId: string };
}) {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quantity = parseInt(searchParams.get("quantity") ?? "1", 10);

  const [offer, setOffer] = useState<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    game: { name: string; slug: string };
    seller: { id: string; name: string };
  } | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;

    fetch(`/api/listings/${params.offerId}`)
      .then((r) => r.json())
      .then((data) => {
        setOffer(data);
        setLoading(false);
      });
  }, [status, params.offerId, router]);

  const createOrder = async () => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: params.offerId, quantity }),
    });
    const data = await res.json();
    if (res.ok) setOrder(data);
    return data;
  };

  const handleMockPay = async () => {
    setPaying(true);
    let currentOrder = order;
    if (!currentOrder) {
      currentOrder = await createOrder();
    }
    if (!currentOrder?.id) {
      setPaying(false);
      return;
    }
    const res = await fetch(`/api/orders/${currentOrder.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAID" }),
    });
    const updated = await res.json();
    setOrder(updated);
    setPaying(false);
  };

  const updateStatus = async (newStatus: string) => {
    if (!order) return;
    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const updated = await res.json();
    setOrder(updated);
  };

  if (loading || status === "loading") {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        Loading checkout...
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        Offer not found
      </div>
    );
  }

  const total = offer.price * quantity;
  const currentStatus = order?.status ?? "PENDING";

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Item</span>
            <span>{offer.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Game</span>
            <Link href={`/games/${offer.game.slug}`} className="text-primary hover:underline">
              {offer.game.name}
            </Link>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Seller</span>
            <span>{offer.seller.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Quantity</span>
            <span>{quantity}</span>
          </div>
          <div className="flex justify-between border-t pt-3 text-lg font-bold">
            <span>Total</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {formatPrice(total)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2">
            {statusSteps.map((step, i) => {
              const StepIcon = step.icon;
              const stepIndex = statusSteps.findIndex((s) => s.key === currentStatus);
              const isActive = i <= stepIndex;
              return (
                <div key={step.key} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-center">{step.label}</span>
                </div>
              );
            })}
          </div>
          {currentStatus === "DISPUTED" && (
            <Badge variant="destructive" className="mt-4">Disputed</Badge>
          )}
        </CardContent>
      </Card>

      {!order && (
        <Button className="w-full" size="lg" onClick={handleMockPay} disabled={paying}>
          {paying ? "Processing..." : "Mock Pay (Demo)"}
        </Button>
      )}

      {order?.status === "PAID" && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Payment received! Waiting for seller to deliver.
          </p>
          <Button variant="outline" className="w-full" onClick={() => updateStatus("DELIVERED")}>
            [Demo] Mark as Delivered (Seller)
          </Button>
        </div>
      )}

      {order?.status === "DELIVERED" && (
        <Button className="w-full" onClick={() => updateStatus("COMPLETED")}>
          Confirm Receipt & Complete Order
        </Button>
      )}

      {order?.status === "COMPLETED" && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
          <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
          <p className="font-medium">Order completed! Funds released to seller.</p>
          <Link href="/dashboard">
            <Button variant="outline" className="mt-4">Go to Dashboard</Button>
          </Link>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-muted-foreground">
        This is a demo checkout. No real payment is processed.
      </p>
    </div>
  );
}
