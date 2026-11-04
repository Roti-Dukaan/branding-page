"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shop/components/ui/dialog";
import { Button } from "@shop/components/ui/button";
import { Input } from "@shop/components/ui/input";
import { useAuthStore } from "@shop/lib/stores/auth-store";
import { toast } from "@shop/lib/toast";
import { useAuth } from "@shop/hooks/useAuth";
import { isDevOtpVisible } from "@shop/lib/env";
import OTPInput from "./OTPInput";

type AuthStep = "phone" | "otp";

const LOGIN_BRAND_IMAGE = "/auth/login-brand.png";

export default function AuthDialog() {
  const router = useRouter();
  const {
    authDialogOpen,
    setAuthDialogOpen,
    pendingCheckout,
  } = useAuthStore();

  const [step, setStep] = useState<AuthStep>("phone");
  const [isSending, setIsSending] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [phone, setPhone] = useState("");
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const {
    sendOtp,
    verifyOtp,
    loading,
    error,
    isRateLimited,
    rateLimitCountdown,
    clearRateLimit,
  } = useAuth();

  const resetState = useCallback(() => {
    setStep("phone");
    setOtp("");
    setCountdown(0);
    setIsSending(false);
    setPhone("");
    setDevOtpHint(null);
    clearRateLimit();
  }, [clearRateLimit]);

  useEffect(() => {
    if (!authDialogOpen) {
      resetState();
    }
  }, [authDialogOpen, resetState]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setIsSending(true);
    try {
      const result = await sendOtp(phone);
      setStep("otp");
      setCountdown(60);
      toast.otp("OTP sent to your mobile number");
      if (result?.otp && isDevOtpVisible()) {
        setDevOtpHint(result.otp);
        toast.otp(`Dev OTP: ${result.otp}`, { duration: 15000 });
      } else {
        setDevOtpHint(null);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      await verifyOtp(phone, otp);
      setAuthDialogOpen(false);
      setOtp("");
      if (pendingCheckout) {
        router.push("/cart");
      }
    } catch {
      // error displayed via toast in hook
    }
  };

  const handleResendOTP = async () => {
    setOtp("");
    setIsSending(true);
    try {
      const result = await sendOtp(phone);
      setCountdown(60);
      toast.otp("OTP resent successfully");
      if (result?.otp && isDevOtpVisible()) {
        setDevOtpHint(result.otp);
        toast.otp(`Dev OTP: ${result.otp}`, { duration: 15000 });
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleStepPhone = () => {
    setStep("phone");
    setOtp("");
    clearRateLimit();
  };

  const isButtonDisabled =
    isSending ||
    loading ||
    isRateLimited ||
    phone.length < 10;

  const isVerifyDisabled =
    isSending ||
    loading ||
    isRateLimited ||
    otp.length !== 6;

  return (
    <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
      <DialogContent
        showCloseButton
        className="w-[calc(100%-1.5rem)] max-w-[768px] sm:max-w-[768px] gap-0 overflow-hidden border border-border/60 p-0 shadow-xl sm:rounded-2xl"
      >
        <div className="grid min-h-0 md:min-h-[32rem] md:grid-cols-[42%_58%]">
          {/* Left — brand illustration (desktop only) */}
          <div className="relative hidden h-full min-h-[32rem] overflow-hidden bg-cream md:block">
            <Image
              src={LOGIN_BRAND_IMAGE}
              alt="Roti Dukaan delivery — freshly made rotis, just like home"
              fill
              priority
              className="object-cover object-center"
              sizes="(min-width: 768px) 322px, 0px"
            />
          </div>

          {/* Right — login form */}
          <div className="flex w-full flex-col">
            <div className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-8 sm:py-10">
              <DialogHeader className="space-y-2 text-left">
                {step === "phone" ? (
                  <>
                    <DialogTitle className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-[1.65rem]">
                      Welcome to Roti Dukaan
                    </DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground">
                      Fresh rotis, just like home.
                    </DialogDescription>
                  </>
                ) : (
                  <>
                    <DialogTitle className="font-heading text-2xl font-bold tracking-tight text-foreground">
                      Verify OTP
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      Enter the 6-digit code sent to +91 {phone}
                    </DialogDescription>
                  </>
                )}
              </DialogHeader>

              <div className="mt-6 w-full">
                <AnimatePresence mode="wait">
                  {step === "phone" ? (
                    <motion.div
                      key="phone"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                    >
                      {isRateLimited && (
                        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-center">
                          <p className="text-xs font-medium text-destructive">
                            Too many attempts. Please wait{" "}
                            <span className="font-bold">{rateLimitCountdown}s</span>{" "}
                            before trying again.
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label htmlFor="phone" className="sr-only">
                          Mobile number
                        </label>
                        <div className="flex overflow-hidden rounded-xl border border-input bg-background shadow-sm transition-shadow focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15">
                          <span className="flex items-center border-r border-border bg-muted/40 px-3.5 text-sm font-semibold text-foreground">
                            +91
                          </span>
                          <Input
                            id="phone"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            placeholder="Enter your mobile number"
                            value={phone}
                            onChange={(e) =>
                              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                            }
                            className="h-12 border-0 bg-transparent px-3 text-base shadow-none focus-visible:ring-0"
                            maxLength={10}
                            disabled={isRateLimited}
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleSendOTP}
                        disabled={isButtonDisabled}
                        className="h-12 w-full rounded-xl bg-primary text-base font-semibold hover:bg-primary/90"
                      >
                        {isSending || loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isRateLimited ? (
                          `Wait ${rateLimitCountdown}s`
                        ) : (
                          "Send OTP"
                        )}
                      </Button>

                      <p className="text-center text-xs leading-relaxed text-muted-foreground">
                        By continuing, you agree to our{" "}
                        <Link
                          href="/terms-and-conditions"
                          className="font-medium text-primary underline-offset-2 hover:underline"
                          onClick={() => setAuthDialogOpen(false)}
                        >
                          Terms &amp; Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy-policy"
                          className="font-medium text-primary underline-offset-2 hover:underline"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="otp"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <button
                        type="button"
                        onClick={handleStepPhone}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Change number
                      </button>

                      {devOtpHint ? (
                        <div className="rounded-xl border border-amber-200 bg-cream-deep px-4 py-3 text-center">
                          <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                            Dev login OTP
                          </p>
                          <p className="mt-1 font-mono text-2xl font-bold tracking-[0.35em] text-amber-900">
                            {devOtpHint}
                          </p>
                        </div>
                      ) : null}

                      <OTPInput
                        value={otp}
                        onChange={setOtp}
                        disabled={isSending || loading || isRateLimited}
                      />

                      {isRateLimited && (
                        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-center">
                          <p className="text-xs font-medium text-destructive">
                            Too many attempts. Please wait{" "}
                            <span className="font-bold">{rateLimitCountdown}s</span>{" "}
                            before trying again.
                          </p>
                        </div>
                      )}

                      <div className="text-center">
                        {countdown > 0 && !isRateLimited ? (
                          <p className="text-sm text-muted-foreground">
                            Resend OTP in{" "}
                            <span className="font-semibold text-foreground">
                              {countdown}s
                            </span>
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={isSending || loading || isRateLimited || countdown > 0}
                            className="text-sm font-semibold text-primary transition-colors hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isRateLimited
                              ? `Wait ${rateLimitCountdown}s`
                              : countdown > 0
                                ? `Resend OTP in ${countdown}s`
                                : "Resend OTP"}
                          </button>
                        )}
                      </div>

                      <Button
                        onClick={handleVerifyOTP}
                        disabled={isVerifyDisabled}
                        className="h-12 w-full rounded-xl bg-primary text-base font-semibold hover:bg-primary/90"
                      >
                        {isSending || loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isRateLimited ? (
                          `Wait ${rateLimitCountdown}s`
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Verify & Login
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
