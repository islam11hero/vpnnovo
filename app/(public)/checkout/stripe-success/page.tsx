import { Suspense } from "react";

import StripeSuccessClient from "./StripeSuccessClient";

function StripeSuccessFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
      Loading payment status…
    </div>
  );
}

export default function StripeSuccessPage() {
  return (
    <Suspense fallback={<StripeSuccessFallback />}>
      <StripeSuccessClient />
    </Suspense>
  );
}
