"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface ProductBreadcrumbProps {
  category: string;
  productName: string;
}

export default function ProductBreadcrumb({
  category,
  productName,
}: ProductBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-xs text-muted-foreground mb-5"
    >
      <Link
        href="/"
        className="hover:text-primary transition-colors"
      >
        Home
      </Link>
      <ChevronRight className="h-3 w-3" />
      <Link
        href="/menu"
        className="hover:text-primary transition-colors"
      >
        Menu
      </Link>
      <ChevronRight className="h-3 w-3" />
      <Link
        href={`/menu?category=${encodeURIComponent(category)}`}
        className="hover:text-primary transition-colors"
      >
        {category}
      </Link>
      <ChevronRight className="h-3 w-3" />
      <span className="text-foreground font-medium truncate max-w-[160px]">
        {productName}
      </span>
    </nav>
  );
}
