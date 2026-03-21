function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0.00";

  const absNum = Math.abs(num);
  const ONE_LAKH = 100000;
  const ONE_CRORE = 10000000;

  if (absNum >= ONE_CRORE) {
    const crores = num / ONE_CRORE;
    return `₹${crores.toLocaleString("en-IN", { maximumFractionDigits: 2 }).replace(/\.00$/, "")} Cr`;
  } else if (absNum >= 10 * ONE_LAKH) {
    const lakhs = num / ONE_LAKH;
    return `₹${lakhs.toLocaleString("en-IN", { maximumFractionDigits: 2 }).replace(/\.00$/, "")} Lakh`;
  } else {
    return `₹${num.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`;
  }
}

console.log("999999:", formatCurrency(999999));
console.log("1000000:", formatCurrency(1000000));
console.log("500000:", formatCurrency(500000));
console.log("1234567:", formatCurrency(1234567));
console.log("12345678:", formatCurrency(12345678));
