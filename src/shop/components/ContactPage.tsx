"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronRight,
  Loader2,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@shop/components/ui/button";
import { Card, CardContent } from "@shop/components/ui/card";
import { Input } from "@shop/components/ui/input";
import { Label } from "@shop/components/ui/label";
import { Textarea } from "@shop/components/ui/textarea";
import { toast } from "@shop/lib/toast";
import { FAQS } from "@shop/lib/data";
import { normalizeEmail } from "@shop/lib/utils/email";
import { submitContactMessage } from "@shop/services/contact.service";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await submitContactMessage({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
      });
      setIsComplete(true);
      toast.success("Message sent successfully!");
      form.reset();
      setTimeout(() => setIsComplete(false), 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative h-[350px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center mt-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-primary font-medium text-sm mb-4"
          >
            <Link href="/" className="hover:text-primary/80 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">Contact</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl text-foreground font-extrabold tracking-tight mb-6"
          >
            Get in <span className="text-primary italic font-normal">Touch</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-muted-foreground text-lg"
          >
            Have a question or feedback? We&apos;d love to hear from you.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-border">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Send a Message
                </h2>
                {isComplete ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground">
                      We&apos;ll get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          {...form.register("name")}
                          placeholder="Your name"
                          className="mt-1.5"
                        />
                        {form.formState.errors.name && (
                          <p className="text-xs text-destructive mt-1">
                            {form.formState.errors.name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          {...form.register("phone")}
                          placeholder="+91 98765 43210"
                          className="mt-1.5"
                        />
                        {form.formState.errors.phone && (
                          <p className="text-xs text-destructive mt-1">
                            {form.formState.errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register("email", {
                          setValueAs: (value) =>
                            typeof value === "string" ? normalizeEmail(value) : value,
                        })}
                        onChange={(e) =>
                          form.setValue("email", normalizeEmail(e.target.value), {
                            shouldValidate: true,
                          })
                        }
                        placeholder="your@email.com"
                        className="mt-1.5"
                      />
                      {form.formState.errors.email && (
                        <p className="text-xs text-destructive mt-1">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        {...form.register("subject")}
                        placeholder="How can we help?"
                        className="mt-1.5"
                      />
                      {form.formState.errors.subject && (
                        <p className="text-xs text-destructive mt-1">
                          {form.formState.errors.subject.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        {...form.register("message")}
                        placeholder="Your message..."
                        rows={4}
                        className="mt-1.5 resize-none"
                      />
                      {form.formState.errors.message && (
                        <p className="text-xs text-destructive mt-1">
                          {form.formState.errors.message.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/90 w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {FAQS.slice(0, 5).map((faq, index) => (
                    <div key={index} className="border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                      >
                        <span className="font-semibold text-sm text-foreground">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform ${
                            openFaq === index ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openFaq === index && (
                        <div className="px-4 pb-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
