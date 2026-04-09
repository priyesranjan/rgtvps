type EnvMode = "development" | "production" | "test";

function ensureVars(keys: string[]) {
  const missing = keys.filter((key) => !process.env[key] || String(process.env[key]).trim() === "");
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

function normalizeNodeEnv(value: string | undefined): EnvMode {
  if (value === "production" || value === "test") return value;
  return "development";
}

export function validateEnvironment() {
  const mode = normalizeNodeEnv(process.env.NODE_ENV);

  // Always required for API boot.
  ensureVars(["DATABASE_URL", "JWT_SECRET"]);

  // If one Razorpay key is set, require both.
  const hasRazorpayId = !!process.env.RAZORPAY_KEY_ID;
  const hasRazorpaySecret = !!process.env.RAZORPAY_KEY_SECRET;
  if (hasRazorpayId !== hasRazorpaySecret) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set together.");
  }

  // Production safety checks.
  if (mode === "production") {
    ensureVars([
      "FRONTEND_URL",
      "BACKEND_URL",
      "SMS_API_KEY",
      "R2_ENDPOINT",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_BUCKET_NAME",
      "R2_PUBLIC_URL",
    ]);
  }
}
