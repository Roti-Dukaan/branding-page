"use client";

import Link from "next/link";
import { useState } from "react";
import { CONTACT_FAQS } from "@/lib/faqs-content";
import { submitContactMessage } from "@/lib/contact-api";
import { Eyebrow } from "./ui";

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function ContactPageContent() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (phone.trim().length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }
    const emailNorm = normalizeEmail(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (subject.trim().length < 2) {
      setError("Please enter a subject.");
      return;
    }
    if (message.trim().length < 10) {
      setError("Message must be at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitContactMessage({
        name: name.trim(),
        phone: phone.trim(),
        email: emailNorm,
        subject: subject.trim(),
        message: message.trim(),
      });
      setIsComplete(true);
      setName("");
      setPhone("");
      setEmail("");
      setSubject("");
      setMessage("");
      setTimeout(() => setIsComplete(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-sand bg-cream/50 px-4 py-2.5 text-sm text-bark outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/20";

  return (
    <main className="bg-cream pb-16">
      <div className="border-b border-sand/60 bg-leaf-soft/40">
        <div className="mx-auto max-w-5xl px-5 py-12 text-center sm:px-8">
          <nav className="mb-4 flex flex-wrap items-center justify-center gap-1.5 text-sm text-bark/70">
            <Link href="/" className="font-medium transition hover:text-leaf">
              Home
            </Link>
            <span aria-hidden className="text-bark/40">
              /
            </span>
            <span className="font-medium text-bark">Contact</span>
          </nav>
          <Eyebrow>We&apos;re here to help</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-bold text-bark sm:text-5xl">
            Get in <span className="text-leaf">Touch</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-bark/80">
            Have a question or feedback? Send us a message — we&apos;ll get back to you soon.
          </p>
          <p className="mt-3 text-sm text-bark/65">
            Email:{" "}
            <a href="mailto:support@rotidukaan.com" className="font-semibold text-leaf underline-offset-2 hover:underline">
              support@rotidukaan.com
            </a>
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-2 lg:gap-10 sm:px-8">
        <div className="rounded-3xl border border-sand/80 bg-white p-6 shadow-[0_12px_40px_rgba(74,37,18,0.06)] sm:p-8">
          <h2 className="font-display text-2xl font-bold text-bark">Send a message</h2>
          {isComplete ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-leaf-soft text-2xl text-leaf">
                ✓
              </div>
              <h3 className="font-display text-xl font-bold text-bark">Message sent!</h3>
              <p className="mt-2 text-sm text-bark/75">We&apos;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-bark">
                  Name
                  <input
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </label>
                <label className="block text-sm font-semibold text-bark">
                  Phone
                  <input
                    className={inputClass}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                  />
                </label>
              </div>
              <label className="block text-sm font-semibold text-bark">
                Email
                <input
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </label>
              <label className="block text-sm font-semibold text-bark">
                Subject
                <input
                  className={inputClass}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help?"
                />
              </label>
              <label className="block text-sm font-semibold text-bark">
                Message
                <textarea
                  className={`${inputClass} min-h-[120px] resize-none`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your message..."
                  rows={4}
                />
              </label>
              {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-leaf px-6 py-3.5 font-display text-base font-semibold text-cream transition hover:bg-leaf-dark disabled:opacity-60"
              >
                {isSubmitting ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>

        <div className="rounded-3xl border border-sand/80 bg-white p-6 shadow-[0_12px_40px_rgba(74,37,18,0.06)] sm:p-8">
          <h3 className="font-display text-xl font-bold text-bark">Frequently asked questions</h3>
          <div className="mt-4 space-y-3">
            {CONTACT_FAQS.map((faq, index) => (
              <div key={faq.question} className="overflow-hidden rounded-2xl border border-sand/70">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left text-sm font-semibold text-bark transition hover:bg-cream/80"
                  aria-expanded={openFaq === index}
                >
                  {faq.question}
                  <span
                    className={`shrink-0 text-leaf transition-transform ${openFaq === index ? "rotate-180" : ""}`}
                    aria-hidden
                  >
                    ▾
                  </span>
                </button>
                {openFaq === index ? (
                  <div className="border-t border-sand/60 px-4 pb-4 pt-2 text-sm leading-relaxed text-bark/80">
                    {faq.answer}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
