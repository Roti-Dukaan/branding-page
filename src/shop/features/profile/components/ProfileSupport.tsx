"use client";

import { useEffect, useState } from "react";
import { useProfileNavigation } from "../hooks/useProfileNavigation";
import { supportApi, type SupportTicket } from "@shop/lib/api/support.api";
import { Card, CardContent } from "@shop/components/ui/card";
import { Button } from "@shop/components/ui/button";
import { Badge } from "@shop/components/ui/badge";
import { LifeBuoy, Plus, MessageSquare } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  WAITING_FOR_BRANCH: "bg-purple-100 text-purple-700",
  WAITING_FOR_CUSTOMER: "bg-orange-100 text-orange-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
  REOPENED: "bg-red-100 text-red-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

export function ProfileSupport() {
  const { navigateToTab } = useProfileNavigation();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadTickets();
  }, [page]);

  async function loadTickets() {
    try {
      const { data } = await supportApi.listTickets(page, 10);
      setTickets(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Help & Support
          </h2>
          <p className="text-sm text-muted-foreground">
            View and manage your support tickets
          </p>
        </div>
        <Button
          onClick={() => navigateToTab("support-new")}
          className="gap-2 bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      ) : tickets.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center py-12">
            <LifeBuoy className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="font-heading text-lg font-semibold text-foreground">
              No support tickets
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Need help? Create a support ticket and we&apos;ll assist you.
            </p>
            <Button
              onClick={() => navigateToTab("support-new")}
              className="mt-4 gap-2 bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="h-4 w-4" />
              Create Ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="cursor-pointer border-border transition-colors hover:bg-muted/50"
              onClick={() => navigateToTab("support-detail", { ticketId: ticket.id })}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {ticket.ticketNumber}
                      </span>
                      <Badge className={`text-xs ${STATUS_COLORS[ticket.status]}`}>
                        {ticket.status.replace(/_/g, " ")}
                      </Badge>
                      <Badge className={`text-xs ${PRIORITY_COLORS[ticket.priority]}`}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {ticket.subject}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{ticket.category.replace(/_/g, " ")}</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}

          {total > 10 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm text-muted-foreground">
                Page {page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={tickets.length < 10}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
