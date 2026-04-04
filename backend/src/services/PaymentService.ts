import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

class PaymentService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  /**
   * Create a new Razorpay order
   * @param amount Amount in INR (will be converted to Paise internally)
   * @param receipt Unique receipt ID (e.g., our Order ID)
   * @returns Razorpay Order object
   */
  async createRazorpayOrder(amount: number, receipt: string) {
    const options = {
      amount: Math.round(amount * 100), // Convert INR to Paise
      currency: "INR",
      receipt: receipt,
    };

    return await this.razorpay.orders.create(options);
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
