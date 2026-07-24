import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GameCardProps {
  slug: string;
  name: string;
  imageUrl: string;
  offerCount: number;
}

export function GameCard({ slug, name, imageUrl, offerCount }: GameCardProps) {
  return (
    <Link href={`/games/${slug}`}>
      <Card className="group overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-white">{name}</h3>
            <Badge variant="secondary" className="mt-1 bg-white/20 text-white backdrop-blur-sm">
              {offerCount} offers
            </Badge>
          </div>
        </div>
        <CardContent className="p-0" />
      </Card>
    </Link>
  );
}
