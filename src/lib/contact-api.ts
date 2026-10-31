const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://api.rotidukaan.com";

export type ContactFormPayload = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export async function submitContactMessage(payload: ContactFormPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/contact-messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    errors?: string[];
  } | null;

  if (!res.ok) {
    const msg =
      json?.message ||
      (Array.isArray(json?.errors) ? json.errors[0] : undefined) ||
      "Failed to send message";
    throw new Error(msg);
  }
}
