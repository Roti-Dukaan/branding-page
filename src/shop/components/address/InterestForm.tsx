"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shop/components/ui/dialog";
import { Button } from "@shop/components/ui/button";
import { Input } from "@shop/components/ui/input";
import { Label } from "@shop/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@shop/components/ui/radio-group";
import { normalizeEmail } from "@shop/lib/utils/email";
import { Checkbox } from "@shop/components/ui/checkbox";
import { Textarea } from "@shop/components/ui/textarea";
import { Badge } from "@shop/components/ui/badge";
import { Separator } from "@shop/components/ui/separator";
import { toast } from "@shop/lib/toast";
import { useDeliveryStore } from "@shop/lib/stores/delivery-store";
import { Loader2, PartyPopper, MapPin } from "lucide-react";

const REASONS = [
  "Fresh Homemade Food",
  "Healthy Millet Rotis",
  "Affordable Pricing",
  "Subscription Plans",
  "Better Than Restaurant Food",
  "Recommended By Friends",
  "Other",
];

const FREQUENCIES = ["Daily", "Weekly", "Occasionally"];

const LAUNCH_INTERESTS = [
  "Jonna Roti",
  "Ragi Roti",
  "Healthy Meals",
  "Family Combos",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Subscription Plans",
];

interface InterestFormProps {
  open: boolean;
  pincode: string;
  area: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InterestForm({
  open,
  pincode,
  area,
  onClose,
  onSuccess,
}: InterestFormProps) {
  const { submitInterest, hasSubmittedForPincode } = useDeliveryStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    pincode,
    area,
    reason: "",
    otherReason: "",
    frequency: "",
    interests: [] as string[],
  });

  const isOther = form.reason === "Other";
  const canSubmit =
    form.name.trim() &&
    form.mobile.trim() &&
    form.pincode.trim() &&
    form.area.trim() &&
    form.reason &&
    form.frequency &&
    (!isOther || form.otherReason.trim()) &&
    form.interests.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (hasSubmittedForPincode(form.pincode)) {
      toast.success("You're already on the list for this pincode!");
      setSubmitted(true);
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    submitInterest(form);
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("Interest recorded successfully!");
  };

  const handleClose = () => {
    setForm({
      name: "",
      mobile: "",
      email: "",
      pincode,
      area,
      reason: "",
      otherReason: "",
      frequency: "",
      interests: [],
    });
    setSubmitted(false);
    onClose();
  };

  const toggleInterest = (value: string) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(value)
        ? f.interests.filter((i) => i !== value)
        : [...f.interests, value],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[480px] max-h-[90vh] overflow-y-auto rounded-2xl p-0">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 space-y-5"
            >
              <DialogHeader>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Help Us Reach You Faster
                </DialogTitle>
                <DialogDescription>
                  We&apos;re expanding! Leave your details and we&apos;ll notify
                  you when we start delivering to <strong>{pincode}</strong>.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-medium">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      className="h-10 text-sm"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mobile" className="text-xs font-medium">
                      Mobile Number *
                    </Label>
                    <Input
                      id="mobile"
                      placeholder="10-digit number"
                      className="h-10 text-sm"
                      maxLength={10}
                      value={form.mobile}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, mobile: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium">
                    Email (Optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="h-10 text-sm"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: normalizeEmail(e.target.value) }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="pincode" className="text-xs font-medium">
                      Pincode *
                    </Label>
                    <Input
                      id="pincode"
                      placeholder="Pincode"
                      className="h-10 text-sm"
                      value={form.pincode}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, pincode: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="area" className="text-xs font-medium">
                      Area *
                    </Label>
                    <Input
                      id="area"
                      placeholder="Area / Locality"
                      className="h-10 text-sm"
                      value={form.area}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, area: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2.5">
                  <Label className="text-xs font-medium">
                    Why would you like to choose Roti Dukaan? *
                  </Label>
                  <RadioGroup
                    value={form.reason}
                    onValueChange={(value) =>
                      setForm((f) => ({ ...f, reason: value }))
                    }
                  >
                    <div className="grid grid-cols-1 gap-2">
                      {REASONS.map((reason) => (
                        <label
                          key={reason}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            form.reason === reason
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <RadioGroupItem value={reason} />
                          <span className="text-sm font-medium">{reason}</span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                  {isOther && (
                    <Textarea
                      placeholder="Tell us what you're looking for..."
                      className="text-sm mt-2"
                      value={form.otherReason}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, otherReason: e.target.value }))
                      }
                    />
                  )}
                </div>

                <Separator />

                <div className="space-y-2.5">
                  <Label className="text-xs font-medium">
                    How often would you order? *
                  </Label>
                  <RadioGroup
                    value={form.frequency}
                    onValueChange={(value) =>
                      setForm((f) => ({ ...f, frequency: value }))
                    }
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {FREQUENCIES.map((freq) => (
                        <label
                          key={freq}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            form.frequency === freq
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <RadioGroupItem value={freq} />
                          <span className="text-xs font-medium">{freq}</span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-2.5">
                  <Label className="text-xs font-medium">
                    What would you like us to introduce first? *
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {LAUNCH_INTERESTS.map((item) => (
                      <label
                        key={item}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          form.interests.includes(item)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <Checkbox
                          checked={form.interests.includes(item)}
                          onCheckedChange={() => toggleInterest(item)}
                        />
                        <span className="text-xs font-medium">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                  disabled={!canSubmit || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {isSubmitting ? "Submitting..." : "Notify Me When You Launch"}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <PartyPopper className="h-8 w-8 text-primary" />
              </motion.div>
              <DialogTitle className="text-xl font-bold mb-2">
                Thank You!
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mb-6 leading-relaxed">
                We&apos;ve added your location to our expansion list. As soon as
                Roti Dukaan starts serving <strong>{pincode}</strong>, we&apos;ll
                notify you.
              </DialogDescription>
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => {
                  handleClose();
                  onSuccess();
                }}
              >
                Back to Home
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
