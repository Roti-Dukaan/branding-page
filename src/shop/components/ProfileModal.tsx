"use client";

import { useState, useEffect } from "react";
import { toast } from "@shop/lib/toast";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@shop/components/ui/dialog";
import { Button } from "@shop/components/ui/button";
import { Input } from "@shop/components/ui/input";
import { Label } from "@shop/components/ui/label";
import { updateUserProfile } from "@shop/services/auth.service";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { normalizeEmail } from "@shop/lib/utils/email";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
}

type ProfileData = {
  name: string;
  phone: string;
  email: string;
};

export default function ProfileModal({
  open,
  onOpenChange,
  onContinue,
}: ProfileModalProps) {
  const { user, updateUser } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<ProfileData>({
    name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (open) {
      setData({
        name: user?.name || "",
        phone: user?.phone || "",
        email: user?.email || "",
      });
    }
  }, [open, user]);

  const handleSave = async () => {
    if (!data.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!data.phone.trim() || data.phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateUserProfile({
        fullName: data.name.trim(),
        email: data.email ? normalizeEmail(data.email) : undefined,
      });

      updateUser({
        id: updated.id,
        name: updated.fullName || data.name,
        phone: data.phone.trim(),
        email: updated.email || data.email || undefined,
        avatar: user?.avatar,
      });

      toast.success("Profile updated");
      setIsSaving(false);
      onContinue();
    } catch {
      toast.error("Failed to update profile");
      setIsSaving(false);
    }
  };

  const missingName = !data.name.trim();
  const missingPhone = !data.phone.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Complete Your Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Please provide your details to continue with the order.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="profile-name" className="text-xs font-medium">
              Name *
            </Label>
            <Input
              id="profile-name"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="Full name"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-phone" className="text-xs font-medium">
              Phone *
            </Label>
            <Input
              id="profile-phone"
              value={data.phone}
              onChange={(e) =>
                setData({ ...data, phone: e.target.value.replace(/\D/g, "") })
              }
              placeholder="10-digit mobile number"
              maxLength={10}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-email" className="text-xs font-medium">
              Email
            </Label>
            <Input
              id="profile-email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: normalizeEmail(e.target.value) })}
              placeholder="you@example.com"
              className="h-10"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || missingName || missingPhone}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save & Continue"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
