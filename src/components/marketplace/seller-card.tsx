import { ShieldCheck } from "lucide-react";
import { RatingStars } from "./rating-stars";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SellerCardProps {
  sellerId: string;
  name: string;
  avatar?: string | null;
  rating: number;
  reviewCount: number;
  isOnline: boolean;
  isVerified: boolean;
  responseTime?: string | null;
  compact?: boolean;
}

export function SellerCard({
  sellerId,
  name,
  avatar,
  rating,
  reviewCount,
  isOnline,
  isVerified,
  responseTime,
  compact = false,
}: SellerCardProps) {
  return (
    <Link
      href={`/sellers/${sellerId}`}
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50",
        compact && "p-3"
      )}
    >
      <div className="relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={name} className="h-12 w-12 rounded-full object-cover" />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card",
            isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{name}</span>
          {isVerified && (
            <Badge variant="success" className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>
        <RatingStars rating={rating} size="sm" showValue />
        <p className="text-xs text-muted-foreground">
          {reviewCount} reviews
          {responseTime && ` · Responds in ${responseTime}`}
        </p>
      </div>
    </Link>
  );
}
