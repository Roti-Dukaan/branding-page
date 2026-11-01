"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@shop/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Product Not Found
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Sorry, we couldn&apos;t find the dish you&apos;re looking for. It may
          have been removed or the link might be incorrect.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/menu">
            <Button className="bg-primary hover:bg-primary/90">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Menu
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              Go to Homepage
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
