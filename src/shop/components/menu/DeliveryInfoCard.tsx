"use client";

import { MapPin, Flame } from "lucide-react";

export default function DeliveryInfoCard() {
  return (
    <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
            Delivering To
          </p>
          <p className="text-sm font-semibold text-foreground">
            Hyderabad
          </p>
          <p className="text-xs text-muted-foreground">500089</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Flame className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
            Freshness Promise
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your meal will only start cooking after your order is confirmed.
          </p>
        </div>
      </div>
    </div>
  );
}
