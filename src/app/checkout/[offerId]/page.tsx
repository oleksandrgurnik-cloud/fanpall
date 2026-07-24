import { Suspense } from "react";
import CheckoutClient from "./checkout-client";

export default function CheckoutPage({
  params,
}: {
  params: { offerId: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12 text-center">
          Loading checkout...
        </div>
      }
    >
      <CheckoutClient params={params} />
    </Suspense>
  );
}
