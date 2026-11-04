import { create } from "zustand";
import { persist } from "zustand/middleware";
import { asArray } from "@shop/lib/stores/persist-utils";

export interface DeliveryInterest {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  pincode: string;
  area: string;
  reason: string;
  otherReason?: string;
  frequency: string;
  interests: string[];
  submittedAt: string;
}

interface DeliveryState {
  servicePincode: string;
  interests: DeliveryInterest[];
  submitInterest: (interest: Omit<DeliveryInterest, "id" | "submittedAt">) => void;
  hasSubmittedForPincode: (pincode: string) => boolean;
}

export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set, get) => ({
      servicePincode: "500089",
      interests: [],

      submitInterest: (interest) => {
        const record: DeliveryInterest = {
          ...interest,
          id: `interest-${Date.now()}`,
          submittedAt: new Date().toISOString(),
        };
        set((state) => ({
          interests: [record, ...asArray<DeliveryInterest>(state.interests)],
        }));
      },

      hasSubmittedForPincode: (pincode) => {
        return asArray<DeliveryInterest>(get().interests).some((i) => i.pincode === pincode);
      },
    }),
    {
      name: "roti-dukaan-delivery",
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<DeliveryState>;
        return {
          ...current,
          ...saved,
          interests: asArray<DeliveryInterest>(saved.interests),
          servicePincode:
            typeof saved.servicePincode === "string" && saved.servicePincode.trim()
              ? saved.servicePincode
              : current.servicePincode,
        };
      },
    }
  )
);
