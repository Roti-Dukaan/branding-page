export const SITE_CONFIG = {
  name: "Roti Dukaan",
  tagline: "Fresh Homemade Meals Delivered",
  description: "Healthy, freshly prepared rotis, curries, and wholesome meals made with love.",
  phone: "+91 8374855015",
  email: "info@rotidukaan.com",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918374855015",
  address: "Fresh Home Kitchen, Hyderabad, India",
  fssaiLicense: "23626028003051",
  deliveryCharge: 30,
  freeDeliveryThreshold: 199,
  platformFee: 5,
  taxRate: 0.05,
  businessHours: {
    weekdays: "11:00 AM - 7:30 PM",
    saturday: "11:00 AM - 7:30 PM",
    sunday: "Closed",
  },
  social: {
    instagram: "https://www.instagram.com/rotidukaan",
    facebook: "https://www.facebook.com/profile.php?id=61592789437137",
    linkedin: "https://www.linkedin.com/company/roti-dukaan",
  },
  apps: {
    playStore:
      process.env.NEXT_PUBLIC_PLAY_STORE_URL ||
      "https://play.google.com/store/apps/details?id=com.rotidukaan.user",
    appStore:
      process.env.NEXT_PUBLIC_APP_STORE_URL ||
      "https://apps.apple.com/app/roti-dukaan/id0000000000",
  },
};

export function getWhatsAppUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encoded}`;
}

export function getOrderWhatsAppUrl(
  items: { name: string; quantity: number; price: number }[],
  total: number,
  address?: string
): string {
  let message = `🛒 *New Order from Roti Dukaan*\n\n`;

  items.forEach((item) => {
    message += `• ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}\n`;
  });

  message += `\n💰 *Total: ₹${total}*\n`;

  if (address) {
    message += `\n📍 *Delivery Address:* ${address}\n`;
  }

  message += `\n_Please confirm this order. Thank you!_`;

  return getWhatsAppUrl(message);
}

export function getSupportWhatsAppUrl(): string {
  const message = `Hi! I need help with my Roti Dukaan order.`;
  return getWhatsAppUrl(message);
}
