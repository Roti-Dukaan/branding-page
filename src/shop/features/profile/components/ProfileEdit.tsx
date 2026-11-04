"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@shop/components/ui/card";
import { Button } from "@shop/components/ui/button";
import { Input } from "@shop/components/ui/input";
import { Label } from "@shop/components/ui/label";
import { toast } from "@shop/lib/toast";
import { getUserProfile, updateUserProfile } from "@shop/services/auth.service";
import { normalizeEmail } from "@shop/lib/utils/email";

type UserProfile = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
};

export function ProfileEdit() {
  const { updateUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("english");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const data = await getUserProfile();
        if (!cancelled) {
          setProfile(data);
          setName(data.fullName || "");
          setPhone(data.phone || "");
          setEmail(data.email || "");
        }
      } catch (err: any) {
        if (!cancelled) {
          const message = err?.response?.data?.message || "Failed to load profile";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      const trimmedEmail = email ? normalizeEmail(email) : "";
      const updated = await updateUserProfile({
        fullName: name.trim(),
        ...(trimmedEmail ? { email: trimmedEmail } : {}),
      });

      updateUser({
        id: updated.id,
        name: updated.fullName || name,
        email: updated.email || email,
      });

      setProfile(updated);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 w-20 rounded-md bg-muted animate-pulse" />
                <div className="h-9 rounded-md bg-muted animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
                <div className="h-9 rounded-md bg-muted animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 rounded-md bg-muted animate-pulse" />
              <div className="h-9 rounded-md bg-muted animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <div className="h-9 w-28 rounded-md bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone">Phone Number</Label>
              <Input
                id="profile-phone"
                value={phone}
                readOnly
                disabled
                className="cursor-not-allowed bg-muted/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email (Optional)</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(normalizeEmail(e.target.value))}
              placeholder="your@email.com"
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-language">Preferred Language</Label>
            <select
              id="profile-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={saving}
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="telugu">Telugu</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-6" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
