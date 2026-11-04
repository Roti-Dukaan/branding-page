"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@shop/components/ui/button";
import { useSubscriptionPackages } from "@shop/features/subscriptions/hooks/useSubscriptions";
import { SubscriptionPlanCard } from "@shop/features/subscriptions/components/SubscriptionPlanCard";

export default function SubscriptionSection() {
  const router = useRouter();
  const { data: packages, isLoading, isError } = useSubscriptionPackages();
  const visiblePlans = (packages ?? []).slice(0, 3);

  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm uppercase tracking-widest text-primary font-semibold block mb-2">
              Save More
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
              Roti Subscription Plans
            </h2>
            <p className="text-muted-foreground text-base">
              Subscribe and save. Fresh meals delivered to your doorstep.
            </p>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-center text-sm text-muted-foreground">
            Unable to load subscription plans right now.
          </p>
        ) : visiblePlans.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No subscription plans available right now. Check back soon.
          </p>
        ) : (
          <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePlans.map((pkg) => (
              <SubscriptionPlanCard
                key={pkg.id}
                package={pkg}
                onTap={() => router.push(`/subscriptions/${pkg.id}/view`)}
              />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/subscriptions">
            <Button variant="outline" className="min-h-[44px]">
              Browse all subscription plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
