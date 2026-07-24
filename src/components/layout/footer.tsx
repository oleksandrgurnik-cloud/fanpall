import Link from "next/link";
import { Gamepad2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Gamepad2 className="h-5 w-5 text-primary" />
            FunPall
          </Link>
          <p className="text-sm text-muted-foreground">
            Peer-to-peer gaming marketplace. Escrow-protected transactions.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FunPall. Demo project — no real payments.
          </p>
        </div>
      </div>
    </footer>
  );
}
