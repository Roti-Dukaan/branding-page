"use client";

import { Skeleton } from "@shop/components/ui/skeleton";

export function PricingSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}
