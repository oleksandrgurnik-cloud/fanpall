import Link from "next/link";
import { Circle } from "lucide-react";
import { RatingStars } from "./rating-stars";
import { PriceTag } from "./price-tag";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OfferCardProps {
  id: string;
  gameSlug: string;
  title: string;
  price: number;
  sellerName: string;
  sellerRating: number;
  isOnline: boolean;
  isVerified?: boolean;
  stock: number;
  categoryName?: string;
}

export function OfferCard({
  id,
  gameSlug,
  title,
  price,
  sellerName,
  sellerRating,
  isOnline,
  isVerified,
  stock,
  categoryName,
}: OfferCardProps) {
  return (
    <Link
      href={`/games/${gameSlug}/offers/${id}`}
      className="group flex flex-col gap-3 rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1">
        {categoryName && (
          <Badge variant="outline" className="mb-2">
            {categoryName}
          </Badge>
        )}
        <h3 className="truncate font-medium group-hover:text-primary">{title}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{sellerName}</span>
          {isVerified && (
            <Badge variant="success" className="text-[10px]">
              Verified
            </Badge>
          )}
          <RatingStars rating={sellerRating} size="sm" />
          <span className="flex items-center gap-1">
            <Circle
              className={cn(
                "h-2 w-2 fill-current",
                isOnline ? "text-emerald-500" : "text-muted-foreground/40"
              )}
            />
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <PriceTag price={price} />
        <span className="text-xs text-muted-foreground">{stock} in stock</span>
      </div>
    </Link>
  );
}
