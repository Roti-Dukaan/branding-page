"use client";

import { Alert, AlertDescription, AlertTitle } from "@shop/components/ui/alert";
import { MapPin, Info } from "lucide-react";

export default function DeliveryRestriction() {
  return (
    <Alert className="border-amber-200 bg-cream-deep/50">
      <Info className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 text-sm font-semibold">
        Currently Delivering Only in Hyderabad
      </AlertTitle>
      <AlertDescription className="text-amber-700 text-xs">
        We&apos;re currently serving Hyderabad only. More cities coming soon!{" "}
        <MapPin className="inline h-3 w-3" />
      </AlertDescription>
    </Alert>
  );
}
