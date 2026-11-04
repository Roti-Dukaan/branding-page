"use client";

import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@shop/components/ui/button";

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
  estimatedTime?: string;
  branchName?: string;
  onTrackOrder: () => void;
  onContinueShopping: () => void;
}

export default function SuccessModal({
  open,
  onOpenChange,
  orderId,
  estimatedTime,
  branchName,
  onTrackOrder,
  onContinueShopping,
}: SuccessModalProps) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-sm bg-background rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            <div className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
              >
                <CheckCircle2 className="h-8 w-8" />
              </motion.div>

              <h2 className="text-xl font-bold text-foreground mb-1">
                Order Placed Successfully
              </h2>

              <div className="space-y-2 my-4 text-sm text-muted-foreground">
                {orderId && (
                  <p>
                    Order Number: <span className="font-semibold text-foreground">{orderId}</span>
                  </p>
                )}
                {estimatedTime && (
                  <p>
                    ETA: <span className="font-semibold text-foreground">{estimatedTime}</span>
                  </p>
                )}
                {branchName && (
                  <p>
                    Kitchen: <span className="font-semibold text-foreground">{branchName}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <Button
                  onClick={onTrackOrder}
                  className="w-full bg-primary hover:bg-primary/90 min-h-[48px]"
                >
                  Track Order
                </Button>
                <Button
                  variant="outline"
                  onClick={onContinueShopping}
                  className="w-full min-h-[48px]"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
