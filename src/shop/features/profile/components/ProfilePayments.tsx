"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CreditCard, History, Receipt, ArrowUpRight } from "lucide-react";
import { Button } from "@shop/components/ui/button";
import { Card, CardContent } from "@shop/components/ui/card";
import { Badge } from "@shop/components/ui/badge";
import { toast } from "@shop/lib/toast";
import { paymentService } from "@shop/services/payment.service";
import type { PaymentHistoryItem } from "@shop/services/payment.service";
import { formatTimestamp } from "@shop/lib/date";
import { formatPrice } from "@shop/lib/utils";

function PaymentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    CAPTURED: { label: "Paid", className: "bg-green-50 text-green-700" },
    AUTHORIZED: { label: "Authorized", className: "bg-blue-50 text-blue-700" },
    CREATED: { label: "Pending", className: "bg-cream-deep text-amber-700" },
    PAYMENT_PENDING: { label: "Pending", className: "bg-cream-deep text-amber-700" },
    FAILED: { label: "Failed", className: "bg-red-50 text-red-700" },
    REFUNDED: { label: "Refunded", className: "bg-violet-50 text-violet-700" },
    CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-700" },
  };
  const c = config[status] || { label: status, className: "bg-gray-100 text-gray-700" };
  return <Badge className={`${c.className} border-0`}>{c.label}</Badge>;
}

export function ProfilePayments() {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await paymentService.getHistory(1, 20);
        setPayments(data.items);
      } catch (e) {
        toast.error("Failed to load payment history");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
          <CreditCard className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Payment History</h2>
          <p className="text-sm text-muted-foreground">Your transactions and payment receipts</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Receipt className="h-6 w-6 text-gray-400" />
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-900">No payments yet</p>
            <p className="text-xs text-gray-500 mt-1">Your payment history will appear here after you place an order.</p>
            <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={() => window.location.href = "/menu"}>
              Browse Menu
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <Receipt className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{payment.orderNumber || payment.paymentReference}</p>
                      <PaymentStatusBadge status={payment.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{payment.deliverySlot || "Standard Delivery"}</p>
                    <p className="text-xs text-gray-500">{formatTimestamp(payment.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatPrice(payment.amount)}</p>
                  <p className="text-xs text-gray-500 capitalize">{payment.paymentMethod}</p>
                </div>
              </div>

              {payment.items && payment.items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {payment.items.slice(0, 3).map((item) => (
                      <span key={item.id} className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-700">
                        {item.foodNameSnapshot} × {item.quantity}
                      </span>
                    ))}
                    {payment.items.length > 3 && (
                      <span className="inline-flex items-center rounded-lg bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-500">
                        +{payment.items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {payment.razorpayInfo && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <History className="h-3 w-3" />
                    <span>Ref: {payment.razorpayInfo.transactionReference}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
