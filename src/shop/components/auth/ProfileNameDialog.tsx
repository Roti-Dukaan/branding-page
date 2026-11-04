"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shop/components/ui/dialog";
import { Button } from "@shop/components/ui/button";
import { Input } from "@shop/components/ui/input";
import { Label } from "@shop/components/ui/label";
import { toast } from "@shop/lib/toast";
import { updateUserProfile } from "@shop/services/auth.service";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { defaultReceiverName } from "@shop/lib/profile-utils";

export default function ProfileNameDialog() {
  const { user, profileNameDialogOpen, setProfileNameDialogOpen, updateUser } =
    useAuthStore();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profileNameDialogOpen) {
      setName(defaultReceiverName(user));
    }
  }, [profileNameDialogOpen, user]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter your name");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateUserProfile({ fullName: trimmed });
      updateUser({
        id: updated.id,
        name: updated.fullName || trimmed,
        phone: user?.phone || updated.phone || "",
        email: updated.email || user?.email,
        avatar: user?.avatar,
      });
      toast.success("Welcome! Your profile is ready.");
      setProfileNameDialogOpen(false);
    } catch {
      toast.error("Failed to save your name. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={profileNameDialogOpen}
      disablePointerDismissal
      onOpenChange={(open, eventDetails) => {
        if (!open) {
          eventDetails.cancel();
          return;
        }
        setProfileNameDialogOpen(open);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">What should we call you?</DialogTitle>
          <DialogDescription>
            Add your name so we can personalize your meals and address details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name-setup" className="text-xs font-medium">
              Your name *
            </Label>
            <Input
              id="profile-name-setup"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="h-10"
              autoFocus
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
