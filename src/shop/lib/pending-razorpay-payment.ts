const STORAGE_KEY = 'rotidukaan_pending_razorpay_payment';
const MAX_AGE_MS = 30 * 60 * 1000;

export type PendingRazorpayPayment = {
  checkoutSessionId: string;
  paymentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  savedAt: number;
};

export function savePendingRazorpayPayment(payload: Omit<PendingRazorpayPayment, 'savedAt'>) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...payload, savedAt: Date.now() }),
  );
}

export function clearPendingRazorpayPayment() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function readPendingRazorpayPayment(): PendingRazorpayPayment | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingRazorpayPayment;
    if (!parsed.checkoutSessionId || !parsed.paymentId) return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}
