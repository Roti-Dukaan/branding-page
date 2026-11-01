"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OrderHistoryRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    router.replace(
      orderId ? `/profile?tab=orders&orderId=${orderId}` : "/profile?tab=orders",
    );
  }, [router, orderId]);

  return null;
}

export default function OrderHistoryPage() {
  return (
    <Suspense fallback={null}>
      <OrderHistoryRedirect />
    </Suspense>
  );
}
