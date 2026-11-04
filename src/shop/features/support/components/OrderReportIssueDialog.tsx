"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shop/components/ui/dialog";
import { SupportTicketForm } from "@shop/features/support/components/SupportTicketForm";
import { toast } from "@shop/lib/toast";

interface OrderReportIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderNumber: string;
}

export function OrderReportIssueDialog({
  open,
  onOpenChange,
  orderId,
  orderNumber,
}: OrderReportIssueDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
          <DialogDescription>
            Tell us about your issue and we&apos;ll help you resolve it
          </DialogDescription>
        </DialogHeader>
        <SupportTicketForm
          orderId={orderId}
          orderNumber={orderNumber}
          onSuccess={() => {
            toast.success("Support ticket created. Our team will assist you shortly.");
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
