declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const STORAGE_PREFIX = "meta_purchase_fired:";

export function buildMetaPurchaseEventId(orderNumber: string): string {
  return `purchase_${orderNumber}`;
}

export function getMetaCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === "undefined") return {};
  const cookies = document.cookie.split(";").reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (rawKey) acc[rawKey] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
  return {
    fbp: cookies._fbp,
    fbc: cookies._fbc,
  };
}

export function isOrderPaidOnline(order: {
  paymentMethod?: string | null;
  payment?: { status?: string | null } | null;
}): boolean {
  return isOrderPaidForMetaPurchase(order);
}

/** Browser Purchase: online paid immediately; COD only if backend reports cod_collected. */
export function isOrderPaidForMetaPurchase(order: {
  paymentMethod?: string | null;
  payment?: { status?: string | null } | null;
}): boolean {
  const status = order.payment?.status;
  if (status === "paid") return true;
  if (status === "cod_collected") return true;
  return false;
}

export function trackMetaPurchase(input: {
  orderNumber: string;
  value: number;
  currency?: string;
  eventId?: string;
}): boolean {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return false;

  const eventId = input.eventId ?? buildMetaPurchaseEventId(input.orderNumber);
  const storageKey = `${STORAGE_PREFIX}${eventId}`;
  try {
    if (sessionStorage.getItem(storageKey)) return false;
  } catch {
    // sessionStorage may be unavailable; still attempt one fire this load.
  }

  window.fbq(
    "track",
    "Purchase",
    {
      value: input.value,
      currency: input.currency ?? "INR",
    },
    { eventID: eventId },
  );

  try {
    sessionStorage.setItem(storageKey, "1");
  } catch {
    // ignore
  }

  return true;
}

export async function trackMetaPurchaseFromOrderId(orderId: string): Promise<void> {
  const { orderService } = await import("@shop/services/order.service");
  const order = await orderService.getById(orderId);
  if (!isOrderPaidForMetaPurchase(order)) return;

  trackMetaPurchase({
    orderNumber: order.orderNumber,
    value: Number(order.grandTotal),
    currency: "INR",
    eventId: (order as { metaPurchaseEventId?: string }).metaPurchaseEventId,
  });
}
