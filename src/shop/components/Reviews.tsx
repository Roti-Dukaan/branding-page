"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { Card, CardContent } from "@shop/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@shop/components/ui/avatar";
import { CUSTOMER_REVIEWS } from "@shop/lib/data";

export default function Reviews() {
  return (
    <section className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm uppercase tracking-widest text-primary font-semibold block mb-2">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
              What Our Customers Say
            </h2>
            <p className="text-muted-foreground text-base">
              Don&apos;t just take our word for it. Here&apos;s what our happy
              customers have to say.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {CUSTOMER_REVIEWS.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-border">
                <CardContent className="p-6">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-foreground leading-relaxed mb-6 italic">
                    &quot;{review.text}&quot;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.avatar} alt={review.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {review.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {review.name}
                      </p>
                      {review.role && (
                        <p className="text-xs text-muted-foreground">
                          {review.role}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
