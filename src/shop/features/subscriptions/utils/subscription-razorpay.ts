import { subscriptionsApi } from "@shop/features/subscriptions/services/subscriptions.api";

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (typeof (window as Window & { Razorpay?: unknown }).Razorpay === "function") {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      if (ok && typeof (window as Window & { Razorpay?: unknown }).Razorpay === "function") {
        resolve();
        return;
      }
      reject(new Error("Failed to load payment gateway"));
    };

    let script = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }

    const startedAt = Date.now();
    const poll = window.setInterval(() => {
      if (typeof (window as Window & { Razorpay?: unknown }).Razorpay === "function") {
        window.clearInterval(poll);
        finish(true);
      } else if (Date.now() - startedAt > 10_000) {
        window.clearInterval(poll);
        finish(false);
      }
    }, 50);

    script.addEventListener(
      "error",
      () => {
        window.clearInterval(poll);
        finish(false);
      },
      { once: true },
    );
  });
}

export type SubscriptionPaymentContext = {
  subscriptionId: string;
  checkoutSessionId: string;
  planName: string;
  prefill: { name: string; contact: string };
  expectedAmount?: number;
};

export type SubscriptionPaymentCallbacks = {
  onSuccess: () => void | Promise<void>;
  onDismiss: () => void;
  onVerifyError?: () => void;
};

export async function initiateAndOpenSubscriptionPayment(
  ctx: SubscriptionPaymentContext,
  callbacks: SubscriptionPaymentCallbacks,
): Promise<void> {
  await loadRazorpayScript();

  const paymentOrder = await subscriptionsApi.initiatePayment(ctx.subscriptionId, ctx.checkoutSessionId);
  if (!paymentOrder) {
    throw new Error("Failed to initiate subscription payment");
  }

  const razorpayKey = paymentOrder.razorpayKeyId ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!razorpayKey || !paymentOrder.razorpaySubscriptionId) {
    throw new Error("Payment gateway not configured");
  }

  const RazorpayConstructor = (window as Window & { Razorpay?: new (options: Record<string, unknown>) => { open: () => void } })
    .Razorpay;
  if (typeof RazorpayConstructor !== "function") {
    throw new Error("Payment gateway not loaded. Please refresh and try again.");
  }

  const payAmount = Number(paymentOrder.amount ?? ctx.expectedAmount ?? 0);
  if (payAmount > 0 && payAmount < 10) {
    console.warn(`Unexpected subscription charge amount: ₹${payAmount}`);
  }

  const options = {
    key: razorpayKey,
    subscription_id: paymentOrder.razorpaySubscriptionId,
    name: "Roti Dukaan",
    description: `Subscription — ${ctx.planName}`,
    prefill: ctx.prefill,
    handler: async (response: {
      razorpay_payment_id: string;
      razorpay_subscription_id: string;
      razorpay_signature: string;
    }) => {
      try {
        await subscriptionsApi.verifyPayment(ctx.subscriptionId, {
          checkoutSessionId: ctx.checkoutSessionId,
          razorpaySubscriptionId: response.razorpay_subscription_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
        await callbacks.onSuccess();
      } catch {
        callbacks.onVerifyError?.();
      }
    },
    modal: {
      ondismiss: callbacks.onDismiss,
    },
  };

  const rzp = new RazorpayConstructor(options);
  rzp.open();
}
