"use client";

import { useState } from "react";
import { Button } from "@shop/components/ui/button";
import {
  supportApi,
  type TicketCategory,
  type SupportTicket,
} from "@shop/lib/api/support.api";

const CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: "ORDER_NOT_RECEIVED", label: "Order Not Received" },
  { value: "LATE_DELIVERY", label: "Late Delivery" },
  { value: "WRONG_ITEM", label: "Wrong Item" },
  { value: "MISSING_ITEM", label: "Missing Item" },
  { value: "FOOD_QUALITY", label: "Food Quality" },
  { value: "DAMAGED_PACKAGE", label: "Damaged Package" },
  { value: "PAYMENT", label: "Payment Issue" },
  { value: "REFUND", label: "Refund Request" },
  { value: "SUBSCRIPTION", label: "Subscription Issue" },
  { value: "ACCOUNT", label: "Account Issue" },
  { value: "PROMOTION", label: "Promotion/Coupon" },
  { value: "OTHER", label: "Other" },
];

const fieldClassName =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100";

interface SupportTicketFormProps {
  orderId?: string;
  orderNumber?: string;
  onSuccess?: (ticket: SupportTicket) => void;
  onCancel?: () => void;
  submitLabel?: string;
  showCancel?: boolean;
}

export function SupportTicketForm({
  orderId,
  orderNumber,
  onSuccess,
  onCancel,
  submitLabel = "Submit Ticket",
  showCancel = true,
}: SupportTicketFormProps) {
  const [category, setCategory] = useState<TicketCategory>("OTHER");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function buildSubject(value: string, selectedCategory: TicketCategory): string {
    const trimmed = value.trim();
    if (trimmed) return trimmed.slice(0, 200);
    return CATEGORIES.find((c) => c.value === selectedCategory)?.label ?? "Support request";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please describe your issue");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data } = await supportApi.createTicket({
        category,
        subject: buildSubject(description, category),
        description: description.trim(),
        orderId,
      });
      onSuccess?.(data);
    } catch {
      setError("Failed to create ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {orderId && orderNumber && (
        <div className="rounded-lg border border-orange-100 bg-orange-50 px-3 py-2.5">
          <p className="text-xs font-medium text-orange-700">Order</p>
          <p className="text-sm font-semibold text-gray-900">#{orderNumber}</p>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Category *
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TicketCategory)}
          className={fieldClassName}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please describe your issue in detail..."
          rows={5}
          maxLength={2000}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {description.length}/2000 characters
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {showCancel && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={submitting}
          className="gap-2 bg-orange-500 hover:bg-orange-600"
        >
          {submitting ? "Submitting..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
