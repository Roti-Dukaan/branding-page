import { SITE_CONFIG } from "@shop/lib/constants";

const BRAND_SECONDARY = "#5B3A29";

export function InvoiceFooter() {
  return (
    <footer className="mt-8 border-t border-gray-200 pt-8 text-center">
      <p className="text-base font-semibold" style={{ color: BRAND_SECONDARY }}>
        Thank you for choosing Roti Dukaan ❤️
      </p>
      <p className="mt-1 text-sm text-gray-500">Freshly prepared with care.</p>

      <div className="mt-6 space-y-1 text-sm text-gray-600">
        <p className="font-medium text-gray-700">Need help?</p>
        <p>
          WhatsApp:{" "}
          <span className="text-gray-800">{SITE_CONFIG.phone}</span>
        </p>
        <p>
          Phone: <span className="text-gray-800">{SITE_CONFIG.phone}</span>
        </p>
        <p>
          Website:{" "}
          <span className="text-gray-800">www.rotidukaan.com</span>
        </p>
      </div>
    </footer>
  );
}
