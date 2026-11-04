import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return `₹${formatPriceAmount(price)}`
}

export function formatPriceAmount(price: number): string {
  const hasPaise = Math.round(price * 100) % 100 !== 0
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(price)
}

export function parsePrice(price: string): number {
  return parseInt(price.replace(/[^0-9]/g, ""), 10)
}
