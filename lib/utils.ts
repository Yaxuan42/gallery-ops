import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugifyLib from "slugify";

// Tailwind class merge (for shadcn/ui)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatRMB(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return `¥${amount.toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatUSD(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// Calculate total cost
export function calcTotalCost(item: {
  shippingCostRmb?: number | null;
  customsFees?: number | null;
  importDuties?: number | null;
  purchasePriceRmb?: number | null;
}): number {
  return (
    (item.shippingCostRmb || 0) +
    (item.customsFees || 0) +
    (item.importDuties || 0) +
    (item.purchasePriceRmb || 0)
  );
}

// Generate slug
export function generateSlug(text: string, existingSlugs?: string[]): string {
  let slug = slugifyLib(text, { lower: true, strict: true });
  if (!slug) {
    // Fallback for pure Chinese — generate a timestamp-based slug
    slug = `item-${Date.now()}`;
  }
  if (existingSlugs) {
    let candidate = slug;
    let counter = 2;
    while (existingSlugs.includes(candidate)) {
      candidate = `${slug}-${counter}`;
      counter++;
    }
    return candidate;
  }
  return slug;
}

// Generate order number: SO-2026-001
export function generateOrderNumber(prefix: string, sequence: number): string {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(sequence).padStart(3, "0")}`;
}

// Format date for display
export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
}
