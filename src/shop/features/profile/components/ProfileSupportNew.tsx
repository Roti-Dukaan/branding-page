"use client";

import { useProfileNavigation } from "../hooks/useProfileNavigation";
import { Card, CardContent } from "@shop/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { SupportTicketForm } from "@shop/features/support/components/SupportTicketForm";

export function ProfileSupportNew() {
  const { navigateToTab } = useProfileNavigation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigateToTab("support")}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Create Support Ticket
          </h2>
          <p className="text-sm text-muted-foreground">
            Tell us about your issue and we&apos;ll help you resolve it
          </p>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-6">
          <SupportTicketForm
            onSuccess={() => navigateToTab("support")}
            onCancel={() => navigateToTab("support")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
