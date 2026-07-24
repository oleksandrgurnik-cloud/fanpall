import { cn, formatPrice } from "@/lib/utils";

interface PriceTagProps {
  price: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "text-sm font-semibold",
  md: "text-lg font-bold",
  lg: "text-2xl font-bold",
};

export function PriceTag({ price, size = "md", className }: PriceTagProps) {
  return (
    <span className={cn("text-emerald-600 dark:text-emerald-400", sizeMap[size], className)}>
      {formatPrice(price)}
    </span>
  );
}
