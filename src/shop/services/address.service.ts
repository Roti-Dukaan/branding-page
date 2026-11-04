import { apiClient } from "@shop/lib/api/client";
import type { DeliveryAddress } from "@shop/lib/types";
import { normalizeIndianPhone } from "@shop/lib/validation/phone";

const DEFAULT_RECEIVER_NAME = "Receiver";

export interface AddressResponse {
  id: string;
  customerId: string;
  label: string;
  receiverName: string;
  phoneNumber: string;
  houseNumber: string;
  apartment?: string;
  street: string;
  landmark?: string;
  area: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  deliveryInstructions?: string;
  isDefault: boolean;
  isServiceable: boolean;
  createdAt: string;
  updatedAt: string;
}

function mapToBackend(
  address: Partial<DeliveryAddress> & { id?: string },
  mode: "create" | "update" = "create",
) {
  const label = address.addressType
    ? address.addressType.toUpperCase()
    : "HOME";

  const payload: Record<string, unknown> = {
    label,
    phoneNumber:
      address.phone !== undefined
        ? normalizeIndianPhone(address.phone)
        : undefined,
    houseNumber: address.house || "",
    apartment: address.apartment || undefined,
    street: address.street || "",
    landmark: address.landmark || undefined,
    area: address.area || "",
    city: address.city || "",
    state: address.state || "",
    country: "India",
    pincode: address.pincode || "",
    latitude: address.lat,
    longitude: address.lng,
    isDefault: address.isDefault || false,
  };

  if (mode === "create") {
    payload.receiverName = address.name?.trim() || DEFAULT_RECEIVER_NAME;
  } else if (address.name !== undefined) {
    payload.receiverName = address.name.trim() || DEFAULT_RECEIVER_NAME;
  }

  return payload;
}

function mapFromBackend(data: AddressResponse): DeliveryAddress {
  const label = (data.label || "HOME").toLowerCase() as DeliveryAddress["addressType"];

  return {
    id: data.id,
    name: data.receiverName || "",
    phone: data.phoneNumber || "",
    house: data.houseNumber || "",
    apartment: data.apartment || "",
    street: data.street || "",
    area: data.area || "",
    landmark: data.landmark || "",
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    addressType: label,
    isDefault: data.isDefault,
    lat: data.latitude,
    lng: data.longitude,
  };
}

export async function getAddresses(): Promise<DeliveryAddress[]> {
  const { data } = await apiClient.get<{ data: { items: AddressResponse[]; total: number } }>(
    "/customers/me/addresses"
  );
  return (data.data?.items || []).map(mapFromBackend);
}

export async function createAddress(
  address: Omit<DeliveryAddress, "id">
): Promise<DeliveryAddress> {
  const { data } = await apiClient.post<{ data: AddressResponse }>(
    "/customers/me/addresses",
    mapToBackend(address, "create")
  );
  return mapFromBackend(data.data);
}

export async function updateAddress(
  id: string,
  address: Partial<DeliveryAddress>
): Promise<DeliveryAddress> {
  const { data } = await apiClient.patch<{ data: AddressResponse }>(
    `/customers/me/addresses/${id}`,
    mapToBackend(address, "update")
  );
  return mapFromBackend(data.data);
}

export async function deleteAddress(id: string): Promise<void> {
  await apiClient.delete(`/customers/me/addresses/${id}`);
}

export async function setDefaultAddress(id: string): Promise<void> {
  await apiClient.patch(`/customers/me/addresses/${id}/default`);
}

export async function checkPincodeServiceability(
  pincode: string
): Promise<{ serviceable: boolean; message: string }> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: { serviceable: boolean; message: string };
  }>(`/customers/me/addresses/serviceability/${pincode}`);
  return data.data;
}
