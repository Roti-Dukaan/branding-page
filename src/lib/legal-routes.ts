import type { LegalDocument } from "./legal-content";
import {
  CANCELLATION_REFUND_POLICY,
  PRIVACY_POLICY,
  SHIPPING_DELIVERY_POLICY,
  SUBSCRIPTION_POLICY,
  TERMS_AND_CONDITIONS,
} from "./legal-content";

export type LegalRoute = {
  path: string;
  document: LegalDocument;
};

export const legalRoutes: LegalRoute[] = [
  { path: "/privacy-policy", document: PRIVACY_POLICY },
  { path: "/terms-and-conditions", document: TERMS_AND_CONDITIONS },
  { path: "/cancellation-refund-policy", document: CANCELLATION_REFUND_POLICY },
  { path: "/shipping-delivery-policy", document: SHIPPING_DELIVERY_POLICY },
  { path: "/subscription-policy", document: SUBSCRIPTION_POLICY },
];

export const footerLegalLinks = legalRoutes.map(({ path, document }) => ({
  href: path,
  label: document.title,
}));
