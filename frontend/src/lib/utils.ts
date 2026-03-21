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
  if (isNaN(num)) return "₹0.00";

  const absNum = Math.abs(num);
  const ONE_LAKH = 100000;
  const ONE_CRORE = 10000000;

  // Only use compact formatting (Lakh/Cr) if it's a "clean" millions/lakhs number 
  // OR if it's very large (e.g. > 10 Lakhs or > 1 Crore).
  // For the user's specific case (9,99,999), we should show the full number.
  
  if (absNum >= ONE_CRORE) {
    const crores = num / ONE_CRORE;
    // Round to 2 decimals BUT if it's very close to 1.0, don't round up to the next threshold
    // unless it's actually that large. 
    // Actually, just use toLocaleString with precision.
    return `₹${crores.toLocaleString("en-IN", { maximumFractionDigits: 2 }).replace(/\.00$/, "")} Cr`;
  } else if (absNum >= 10 * ONE_LAKH) { // Threshold for "Lakh" suffix shifted to 10 Lakhs (1 Million)
    const lakhs = num / ONE_LAKH;
    return `₹${lakhs.toLocaleString("en-IN", { maximumFractionDigits: 2 }).replace(/\.00$/, "")} Lakh`;
  } else {
    // Show full number for anything below 10 Lakhs for financial precision
    return `₹${num.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`;
  }
}
