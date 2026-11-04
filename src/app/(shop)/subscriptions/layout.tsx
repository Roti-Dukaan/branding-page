import type { ReactNode } from "react";

/** Shared marketing typography + leaf CTAs for subscription checkout funnel */
export default function SubscriptionsLayout({ children }: { children: ReactNode }) {
  return <div data-brand-subscriptions>{children}</div>;
}
