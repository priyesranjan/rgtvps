import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

class PaymentService {
  private razorpay: Razorpay | null;
  private readonly isMockMode: boolean;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    const hasConfiguredRazorpayKeys =
      /^rzp_(live|test)_/.test(keyId) &&
      keySecret.length >= 10 &&
      !keyId.includes("dummy") &&
      !keySecret.includes("dummy");

    this.isMockMode = process.env.MOCK_RAZORPAY === "true" && !hasConfiguredRazorpayKeys;

    if (this.isMockMode) {
      this.razorpay = null;
      return;
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  /**
   * Create a new Razorpay order
   * @param amount Amount in INR (will be converted to Paise internally)
   * @param receipt Unique receipt ID (e.g., our Order ID)
   * @returns Razorpay Order object
   */
  async createRazorpayOrder(amount: number, receipt: string) {
    if (this.isMockMode) {
      return {
        id: `mock_order_${receipt}`,
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt,
        status: "created",
      };
    }

    if (!this.razorpay) {
      const err = new Error("Razorpay is not configured");
      (err as Error & { status?: number }).status = 400;
      throw err;
    }

    const options = {
      amount: Math.round(amount * 100), // Convert INR to Paise
      currency: "INR",
      receipt: receipt,
    };

    try {
      return await this.razorpay.orders.create(options);
    } catch (error) {
      const err = new Error("Unable to create payment order. Please verify Razorpay keys.");
      (err as Error & { status?: number }).status = 400;
      throw err;
    }
  }

  /**
   * Verify the payment signature from the frontend
   * @param razorpayOrderId The order ID from Razorpay
   * @param razorpayPaymentId The payment ID from Razorpay
   * @param razorpaySignature The HMAC signature from Razorpay
   * @returns boolean indicating validity
   */
  verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): boolean {
    if (this.isMockMode) {
      return (
        razorpayOrderId.startsWith("mock_order_") &&
        razorpayPaymentId.startsWith("mock_payment_") &&
        razorpaySignature === "mock_signature"
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    return expectedSignature === razorpaySignature;
  }
}

export default new PaymentService();
