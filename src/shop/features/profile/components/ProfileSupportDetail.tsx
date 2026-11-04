"use client";

import { useEffect, useState, useCallback } from "react";
import { useProfileStore } from "@shop/lib/stores/profile-store";
import { useProfileNavigation } from "../hooks/useProfileNavigation";
import { supportApi, type SupportTicket, type SupportMessage } from "@shop/lib/api/support.api";
import { connectRealtime, disconnectRealtime, onRealtime } from "@shop/lib/realtime/socket";
import { REALTIME_EVENTS } from "@shop/lib/realtime/events";
import { Card, CardContent } from "@shop/components/ui/card";
import { Button } from "@shop/components/ui/button";
import { Badge } from "@shop/components/ui/badge";
import { ArrowLeft, Send, Paperclip, Star, Clock, User } from "lucide-react";
import { formatTimestamp } from "@shop/lib/date";

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  WAITING_FOR_BRANCH: "bg-purple-100 text-purple-700",
  WAITING_FOR_CUSTOMER: "bg-orange-100 text-orange-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
  REOPENED: "bg-red-100 text-red-700",
};

export function ProfileSupportDetail() {
  const { selectedTicketId } = useProfileStore();
  const { navigateToTab } = useProfileNavigation();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showRating, setShowRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const loadTicket = useCallback(async () => {
    if (!selectedTicketId) return;
    try {
      const { data } = await supportApi.getTicketDetail(selectedTicketId);
      setTicket(data);
    } catch (err) {
      console.error("Failed to load ticket", err);
    } finally {
      setLoading(false);
    }
  }, [selectedTicketId]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  useEffect(() => {
    if (!selectedTicketId) return;

    connectRealtime();
    const off = onRealtime(REALTIME_EVENTS.CUSTOMER_SUPPORT_MESSAGE_UPDATED, (raw) => {
      const payload = raw as { ticketId?: string };
      if (payload.ticketId === selectedTicketId) {
        void loadTicket();
      }
    });

    return () => {
      off();
      disconnectRealtime();
    };
  }, [selectedTicketId, loadTicket]);

  const handleSendMessage = async () => {
    if (!message.trim() || sending || !selectedTicketId) return;
    setSending(true);
    try {
      await supportApi.addMessage(selectedTicketId, message);
      setMessage("");
      await loadTicket();
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!selectedTicketId || rating === 0) return;
    try {
      await supportApi.rateTicket(selectedTicketId, rating, feedback || undefined);
      setRatingSubmitted(true);
      setShowRating(false);
      await loadTicket();
    } catch (err) {
      console.error("Failed to rate ticket", err);
    }
  };

  const canReply = ticket && ticket.status !== "CLOSED";
  const canRate = ticket && (ticket.status === "RESOLVED" || ticket.status === "CLOSED") && !ticket.customerRating && !ratingSubmitted;
  const canReopen = ticket && ticket.status === "RESOLVED";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-4">
        <p className="text-center text-muted-foreground">Ticket not found</p>
        <Button variant="outline" onClick={() => navigateToTab("support")}>
          Back to Support
        </Button>
      </div>
    );
  }

  const messages = ticket.messages || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigateToTab("support")}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {ticket.ticketNumber}
            </h2>
            <Badge className={`text-xs ${STATUS_COLORS[ticket.status]}`}>
              {ticket.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{ticket.subject}</p>
        </div>
      </div>

      {/* Ticket Info */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>Category: {ticket.category.replace(/_/g, " ")}</span>
        <span>Priority: {ticket.priority}</span>
        {ticket.order && <span>Order: {ticket.order.orderNumber}</span>}
        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {/* Original Description */}
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">You</p>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                  {ticket.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground/70">
                  {formatTimestamp(ticket.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversation Messages */}
        {messages.map((msg) => (
          <Card key={msg.id} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`rounded-full p-2 ${
                    msg.senderType === "ADMIN"
                      ? "bg-orange-100"
                      : msg.senderType === "SYSTEM"
                      ? "bg-gray-100"
                      : "bg-blue-100"
                  }`}
                >
                  {msg.senderType === "ADMIN" ? (
                    <User className="h-4 w-4 text-orange-600" />
                  ) : msg.senderType === "SYSTEM" ? (
                    <Clock className="h-4 w-4 text-gray-600" />
                  ) : (
                    <User className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {msg.senderType === "ADMIN"
                      ? "Support Team"
                      : msg.senderType === "SYSTEM"
                      ? "System"
                      : "You"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {msg.message}
                  </p>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-muted/80"
                        >
                          <Paperclip className="h-3 w-3" />
                          {att.fileType.split("/").pop()?.toUpperCase()}
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground/70">
                    {formatTimestamp(msg.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply Input */}
      {canReply && (
        <Card className="border-border">
          <CardContent className="p-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 resize-none"
            />
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!message.trim() || sending}
                className="gap-2 bg-orange-500 hover:bg-orange-600"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reopen Button */}
      {canReopen && (
        <Card className="border-border">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm text-muted-foreground">
              This ticket has been resolved. Was your issue not fixed?
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                if (!selectedTicketId) return;
                try {
                  await supportApi.addMessage(selectedTicketId, "I need further assistance with this issue.");
                  await loadTicket();
                } catch (err) {
                  console.error("Failed to reopen", err);
                }
              }}
            >
              Reopen Ticket
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Rating Section */}
      {canRate && !showRating && (
        <Card className="border-border">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm text-muted-foreground">
              How was your support experience?
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRating(true)}
              className="gap-2"
            >
              <Star className="h-4 w-4" />
              Rate Experience
            </Button>
          </CardContent>
        </Card>
      )}

      {showRating && (
        <Card className="border-border">
          <CardContent className="space-y-4 p-4">
            <p className="text-sm font-medium text-foreground">Rate your experience</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us more about your experience (optional)"
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 resize-none"
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowRating(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitRating}
                disabled={rating === 0}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Submit Rating
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Rating Display */}
      {ticket.customerRating && (
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="mb-2 text-sm font-medium text-foreground">Your Rating</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= (ticket.customerRating ?? 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            {ticket.customerFeedback && (
              <p className="mt-2 text-sm text-muted-foreground">{ticket.customerFeedback}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
