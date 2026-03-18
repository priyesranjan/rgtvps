import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number into Indian Rupee (INR) notation (Lakhs/Crores)
 * - Below 1 Lakh: Normal formatting (e.g. 50,000)
 * - 1 Lakh to 1 Crore: Lakhs (e.g. 2.50 Lakh)
 * - 1 Crore and above: Crores (e.g. 1.25 Cr)
 * - Max 2 decimal places
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";

  // Thresholds
  const ONE_LAKH = 100000;
  const ONE_CRORE = 10000000;

  if (Math.abs(num) >= ONE_CRORE) {
    return `₹${(num / ONE_CRORE).toFixed(2).replace(/\.00$/, "")} Cr`;
  } else if (Math.abs(num) >= ONE_LAKH) {
    return `₹${(num / ONE_LAKH).toFixed(2).replace(/\.00$/, "")} Lakh`;
  } else {
    return `₹${num.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  }
}
