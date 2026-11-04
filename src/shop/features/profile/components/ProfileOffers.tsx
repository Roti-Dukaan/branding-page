"use client";

import { useProfileStore } from "@shop/lib/stores/profile-store";
import { Card, CardContent } from "@shop/components/ui/card";
import { Button } from "@shop/components/ui/button";
import { Badge } from "@shop/components/ui/badge";
import { toast } from "@shop/lib/toast";
import {
  Gift,
  Copy,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export function ProfileOffers() {
  const { coupons } = useProfileStore();

  const activeCoupons = coupons.filter((c) => c.isActive && !c.isComingSoon);
  const comingSoonCoupons = coupons.filter((c) => c.isComingSoon);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied!`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground">
          Offers & Coupons
        </h2>
        <p className="text-sm text-muted-foreground">
          Apply coupon codes at checkout for discounts
        </p>
      </div>

      {/* Active Coupons */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Gift className="size-4 text-primary" />
          Available Coupons
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {activeCoupons.map((coupon) => (
            <Card key={coupon.id} className="overflow-hidden">
              <div className="flex border-b border-dashed border-muted-foreground/30">
                <div className="flex flex-1 items-center justify-center border-r border-dashed border-muted-foreground/30 p-4">
                  <span className="font-heading text-2xl font-bold text-primary">
                    {coupon.discount}
                  </span>
                </div>
                <div className="flex flex-1 items-center justify-center p-4">
                  <div className="text-center">
                    <p className="font-mono text-base font-bold tracking-wider text-foreground">
                      {coupon.code}
                    </p>
                    {coupon.minOrder && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Min. order ₹{coupon.minOrder}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <CardContent className="flex items-center justify-between gap-2">
                <p className="min-w-0 flex-1 text-xs text-muted-foreground">
                  {coupon.description}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(coupon.code)}
                  className="shrink-0"
                >
                  <Copy className="size-3.5" />
                  Copy
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Coming Soon */}
      {comingSoonCoupons.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="size-4 text-amber-500" />
            Coming Soon
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {comingSoonCoupons.map((coupon) => (
              <Card key={coupon.id} className="opacity-60">
                <CardContent className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cream-deep">
                    <Sparkles className="size-5 text-amber-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {coupon.code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {coupon.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 shrink-0">
                    Soon
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
