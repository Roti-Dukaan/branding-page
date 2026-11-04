"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Heart, Leaf, Flame, Shield, Clock, Truck } from "lucide-react";
import { Button } from "@shop/components/ui/button";

const VALUES = [
  {
    icon: Leaf,
    title: "Fresh Ingredients",
    description: "We source the freshest grains, vegetables, and spices daily.",
  },
  {
    icon: Heart,
    title: "Made with Love",
    description: "Every meal is prepared with care and attention to detail.",
  },
  {
    icon: Flame,
    title: "Traditional Recipes",
    description: "Authentic flavors passed down through generations.",
  },
  {
    icon: Shield,
    title: "No Preservatives",
    description: "100% natural ingredients, no artificial additives.",
  },
];

const FEATURES = [
  { icon: Clock, title: "Cooked After Order", desc: "Freshly prepared when you order" },
  { icon: Truck, title: "Fast Delivery", desc: "20-30 minutes to your door" },
  { icon: Shield, title: "Secure Payments", desc: "UPI, cards, COD available" },
  { icon: Leaf, title: "Healthy Oils", desc: "Cold-pressed oils only" },
  { icon: Heart, title: "Family Recipes", desc: "Authentic home-style cooking" },
  { icon: Flame, title: "Spice Control", desc: "Customize spice levels" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Story */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-sm uppercase tracking-widest text-primary font-semibold block mb-2">
                Our Journey
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-6">
                From a Family Kitchen to Your Home
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Roti Dukaan started with a simple belief: everyone deserves
                  access to authentic, home-cooked meals. What began as a small
                  initiative to serve fresh rotis to neighbors has grown into a
                  beloved food delivery service.
                </p>
                <p>
                  Our recipes are passed down through generations, using
                  traditional techniques and the finest ingredients. Every meal
                  is prepared fresh after you place your order — we never use
                  pre-cooked food or preservatives.
                </p>
                <p>
                  We&apos;re committed to bringing the taste of home to your
                  doorstep, one fresh roti at a time.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/about/our-kitchen.png"
                  alt="Indian family preparing fresh rotis and home-cooked meals together"
                  width={1200}
                  height={800}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-foreground text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
              To make authentic, healthy, home-cooked meals accessible to
              everyone. We believe food should be prepared with love, served
              fresh, and enjoyed without compromises.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Why Choose Us
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-6 rounded-2xl border border-border bg-card"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Our Values
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl border border-border bg-card"
              >
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/5">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Taste the Difference?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Order now and experience the warmth of homemade food.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu">
              <Button className="bg-primary hover:bg-primary/90 px-8 h-12">
                View Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
