import { formatDeliverySlotLabel } from "@shop/lib/delivery-slot-display";
import { formatSavedAddressLabel } from "@shop/lib/geo/format-delivery-location";
import type { CustomerSubscription } from "../types/subscription";

export function getSubscriptionDeliverySlotIds(sub: CustomerSubscription): string[] {
  const fromSnapshot = sub.planSnapshot?.deliverySlotIds;
  if (Array.isArray(fromSnapshot) && fromSnapshot.length > 0) {
    return fromSnapshot.filter((id): id is string => typeof id === "string");
  }
  if (sub.deliverySlotId) return [sub.deliverySlotId];
  if (sub.deliverySlot?.id) return [sub.deliverySlot.id];
  return [];
}

export const MAX_SUBSCRIPTION_DELIVERY_SLOTS = 2;

type SubscriptionAddress = NonNullable<CustomerSubscription["address"]>;

export function formatSubscriptionSlotLabel(
  slot: CustomerSubscription["deliverySlot"],
): string {
  if (!slot) return "No slot";
  const window =
    slot.startTime && slot.endTime
      ? formatDeliverySlotLabel(slot.startTime, slot.endTime)
      : null;
  if (slot.name && window) return `${slot.name} · ${window}`;
  return slot.name ?? window ?? "No slot";
}

export function formatSubscriptionAddressStart(
  address?: SubscriptionAddress | null,
): string {
  if (!address) return "No address";

  const label = formatSavedAddressLabel({
    id: String(address.id ?? ""),
    house: String(address.houseNumber ?? address.house ?? ""),
    apartment: address.apartment ? String(address.apartment) : undefined,
    street: String(address.street ?? ""),
    area: String(address.area ?? ""),
    landmark: address.landmark ? String(address.landmark) : undefined,
    city: String(address.city ?? ""),
    state: String(address.state ?? ""),
    pincode: String(address.pincode ?? ""),
    phone: String(address.phoneNumber ?? address.phone ?? ""),
    addressType: "home",
    lat: typeof address.latitude === "number" ? address.latitude : undefined,
    lng: typeof address.longitude === "number" ? address.longitude : undefined,
  });

  return label ?? "No address";
}
