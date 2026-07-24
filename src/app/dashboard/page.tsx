"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

interface Listing {
  id: string;
  title: string;
  price: number;
  quantity: number;
  status: string;
  game: { name: string; slug: string };
  category: { name: string };
}

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  quantity: number;
  createdAt: string;
  listing: { title: string; game: { name: string; slug: string } };
  buyer?: { name: string };
  seller?: { name: string };
}

interface UserProfile {
  balance: number;
  name: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;

    Promise.all([
      fetch("/api/listings").then((r) => r.json()),
      fetch("/api/orders?type=purchases").then((r) => r.json()),
      fetch("/api/orders?type=sales").then((r) => r.json()),
      fetch("/api/user/me").then((r) => r.json()),
    ]).then(([l, p, s, u]) => {
      setListings(l);
      setPurchases(p);
      setSales(s);
      setProfile(u);
      setLoading(false);
    });
  }, [status, router]);

  const deleteListing = async (id: string) => {
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  const statusColor: Record<string, "default" | "secondary" | "success" | "destructive"> = {
    PENDING: "secondary",
    PAID: "default",
    DELIVERED: "default",
    COMPLETED: "success",
    DISPUTED: "destructive",
    CANCELLED: "destructive",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session?.user?.name}</p>
        </div>
        <Link href="/dashboard/listings/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="purchases">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          <TabsTrigger value="sales">My Sales</TabsTrigger>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases">
          {purchases.length === 0 ? (
            <EmptyState message="No purchases yet" />
          ) : (
            <div className="space-y-3">
              {purchases.map((order) => (
                <OrderRow key={order.id} order={order} statusColor={statusColor} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sales">
          {sales.length === 0 ? (
            <EmptyState message="No sales yet" />
          ) : (
            <div className="space-y-3">
              {sales.map((order) => (
                <OrderRow key={order.id} order={order} statusColor={statusColor} showBuyer />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="listings">
          {listings.length === 0 ? (
            <EmptyState message="No listings yet">
              <Link href="/dashboard/listings/new">
                <Button className="mt-4">Create your first listing</Button>
              </Link>
            </EmptyState>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <Card key={listing.id}>
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{listing.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {listing.game.name} · {listing.category.name}
                      </p>
                      <p className="text-emerald-600 dark:text-emerald-400">
                        {formatPrice(listing.price)} · {listing.quantity} stock
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={listing.status === "ACTIVE" ? "success" : "secondary"}>
                        {listing.status}
                      </Badge>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteListing(listing.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Account Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatPrice(profile?.balance ?? 0)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Withdrawals are not available in this demo version.
              </p>
              <Button variant="outline" className="mt-4" disabled>
                Withdraw (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({
  message,
  children,
}: {
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
      {message}
      {children}
    </div>
  );
}

function OrderRow({
  order,
  statusColor,
  showBuyer,
}: {
  order: Order;
  statusColor: Record<string, "default" | "secondary" | "success" | "destructive">;
  showBuyer?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">{order.listing.title}</p>
          <p className="text-sm text-muted-foreground">
            {order.listing.game.name}
            {showBuyer && order.buyer && ` · Buyer: ${order.buyer.name}`}
            {!showBuyer && order.seller && ` · Seller: ${order.seller.name}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-semibold">{formatPrice(order.totalPrice)}</span>
          <Badge variant={statusColor[order.status] ?? "secondary"}>
            {order.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
