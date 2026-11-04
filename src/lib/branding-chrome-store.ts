import { create } from "zustand";

/** Hides bottom cart / kitchen chrome when overlays (mobile nav) are open. */
type BrandingChromeStore = {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
};

export const useBrandingChromeStore = create<BrandingChromeStore>((set) => ({
  mobileNavOpen: false,
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
}));
