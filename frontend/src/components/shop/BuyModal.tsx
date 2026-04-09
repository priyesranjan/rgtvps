"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Minus, Plus, Shield, Truck, Loader2,
  CheckCircle2, AlertCircle, Download, Package
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const API_BASE_CANDIDATES = Array.from(new Set([
  "/api",
  API_BASE,
  "http://localhost:4000/api",
].filter(Boolean)));

interface ProductPricing {
  goldValue: number;
  gstAmount: number;
  total: number;
  purity: string;
  weight: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  weight: string;
  purity: string;
  imageUrl: string | null;
  stock: number;
  pricing: ProductPricing;
}

interface BuyModalProps {
  product: Product;
  onClose: () => void;
}

type ModalStep = "review" | "processing" | "success" | "error";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function parseJsonResponse(res: Response, fallbackError: string) {
  const text = await res.text();
  const isHtml = text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html");

  if (isHtml) {
    throw new Error("Received HTML instead of API JSON response");
  }

  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Server returned invalid JSON response");
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || fallbackError);
  }

  return data;
}

async function postWithFallback(path: string, body: unknown, token: string, fallbackError: string) {
  let lastError: Error | null = null;

  for (const base of API_BASE_CANDIDATES) {
    try {
      const res = await fetch(`${base}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await parseJsonResponse(res, fallbackError);
      return { data, base };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Request failed");
    }
  }

  throw lastError || new Error(fallbackError);
}

async function getTextWithFallback(path: string, token: string) {
  for (const base of API_BASE_CANDIDATES) {
    try {
      const res = await fetch(`${base}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) continue;
      const html = await res.text();
      if (html.trim().startsWith("<!DOCTYPE") || html.trim().startsWith("<html")) continue;
      return html;
    } catch {
      continue;
    }
  }

  throw new Error("Invoice not ready");
}

export default function BuyModal({ product, onClose }: BuyModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<ModalStep>("review");
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");

  const maxQty = Math.min(product.stock, 10);
  const unitPrice = product.pricing.total;
  const totalGold = product.pricing.goldValue * quantity;
  const totalGst = product.pricing.gstAmount * quantity;
  const totalAmount = unitPrice * quantity;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(maxQty, prev + delta)));
  };

  const handleBuy = async () => {
    setStep("processing");
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/auth/login";
        return;
      }

      // 1. Create order on backend
      const { data: orderData } = await postWithFallback(
        "/orders/start",
        { productId: product.id, quantity },
        token,
        "Failed to create order"
      );

      const {
        orderId: newOrderId,
        invoiceNo: newInvoiceNo,
        razorpayOrderId,
        amount,
      } = orderData.data;

      setOrderId(newOrderId);
      setInvoiceNo(newInvoiceNo);

      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

      if (razorpayOrderId?.startsWith("mock_order_")) {
        throw new Error("Payment gateway is in mock mode. Please configure real Razorpay keys.");
      }

      // 2. Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Payment gateway failed to load. Please try again.");

      // 3. Open Razorpay checkout
      const userJson = localStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : {};

      const options: RazorpayOptions = {
        key: razorpayKeyId,
        amount: Math.round(amount * 100),
        currency: "INR",
        name: "Royal Gold Traders",
        description: `${product.name} x${quantity}`,
        order_id: razorpayOrderId,
        handler: async (response: RazorpayResponse) => {
          // 4. Verify payment on backend
          try {
            await postWithFallback(
              "/orders/verify",
              {
                orderId: newOrderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
              token,
              "Verification failed"
            );

            setStep("success");
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Payment verification failed";
            setError(message);
            setStep("error");
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: user.mobile || "",
        },
        theme: { color: "#D4AF37" },
        modal: {
          ondismiss: async () => {
            try {
              await postWithFallback(
                "/orders/fail",
                { orderId: newOrderId, reason: "Payment cancelled by user" },
                token,
                "Unable to mark order as failed"
              );
            } catch {
              // Ignore fail-marking error on dismiss; user still sees failed state.
            }
            setError("Payment was cancelled. Order marked as failed.");
            setStep("error");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setStep("error");
    }
  };

  const handleViewInvoice = async () => {
    if (!orderId) return;
    const token = localStorage.getItem("token");
    try {
      const html = await getTextWithFallback(`/orders/${orderId}/invoice`, token || "");
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
      }
    } catch {
      alert("Invoice not available yet. Please check your orders dashboard.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        className="bg-bg-surface border border-gold-500/20 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-bg-app/50 text-text-secondary hover:text-text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <AnimatePresence mode="wait">
          {/* REVIEW STEP */}
          {step === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8"
            >
              {/* Product Header */}
              <div className="flex items-center gap-5 mb-6">
                <div className="relative w-20 h-20 flex-shrink-0 rounded-2xl bg-bg-app/50 border border-gold-500/10 overflow-hidden">
                  <Image
                    src={product.imageUrl || "/images/coins/normal.png"}
                    alt={product.name}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-text-primary">{product.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-gold-500 uppercase tracking-wider px-2 py-0.5 border border-gold-500/20 rounded-full">
                      {product.purity}
                    </span>
                    <span className="text-xs text-text-secondary">{Number(product.weight)}g</span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 block">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-xl border border-gold-500/20 flex items-center justify-center text-text-secondary hover:text-gold-500 hover:border-gold-500/40 disabled:opacity-30 transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-heading font-black text-text-primary w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= maxQty}
                    className="w-10 h-10 rounded-xl border border-gold-500/20 flex items-center justify-center text-text-secondary hover:text-gold-500 hover:border-gold-500/40 disabled:opacity-30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-text-secondary ml-2">
                    {product.stock} in stock
                  </span>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-bg-app/60 border border-gold-500/10 rounded-2xl p-5 mb-6 space-y-3">
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Gold Value ({Number(product.weight)}g × {quantity})</span>
                  <span>{formatCurrency(totalGold)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>GST (3%)</span>
                  <span>{formatCurrency(totalGst)}</span>
                </div>
                {quantity > 1 && (
                  <div className="flex justify-between text-xs text-text-secondary/60">
                    <span>Unit Price</span>
                    <span>{formatCurrency(unitPrice)} each</span>
                  </div>
                )}
                <div className="border-t border-gold-500/10 pt-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-text-primary">Total Amount</span>
                  <span className="text-2xl font-heading font-black text-gold-500">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
                <p className="text-xs text-blue-300 font-semibold uppercase tracking-wide mb-1">How Purchase Works</p>
                <p className="text-xs text-text-secondary">1. Click pay and complete Razorpay payment.</p>
                <p className="text-xs text-text-secondary">2. If payment succeeds, order is confirmed automatically.</p>
                <p className="text-xs text-text-secondary">3. If payment fails/cancelled, order is marked failed.</p>
              </div>

              {/* Delivery Info */}
              <div className="flex items-center gap-3 mb-6 text-xs text-text-secondary">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/5 border border-gold-500/10">
                  <Truck className="w-3.5 h-3.5 text-gold-500/50" />
                  <span>15-day delivery</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/5 border border-gold-500/10">
                  <Shield className="w-3.5 h-3.5 text-gold-500/50" />
                  <span>Fully insured</span>
                </div>
              </div>

              {/* Buy Button */}
              <Button
                onClick={handleBuy}
                className="w-full h-14 bg-gold-gradient text-black font-black tracking-[0.15em] uppercase text-sm rounded-2xl shadow-lg hover:shadow-gold-glow-intense"
              >
                Pay With Razorpay {formatCurrency(totalAmount)}
              </Button>
            </motion.div>
          )}

          {/* PROCESSING STEP */}
          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 flex flex-col items-center justify-center min-h-[300px] gap-4"
            >
              <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
              <p className="text-text-primary font-heading font-bold text-lg">Processing Payment...</p>
              <p className="text-text-secondary text-sm text-center">
                Please complete the payment in the Razorpay window.
                Do not close this page.
              </p>
            </motion.div>
          )}

          {/* SUCCESS STEP */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 flex flex-col items-center text-center gap-5"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>

              <div>
                <h3 className="text-2xl font-heading font-black text-text-primary mb-2">
                  Order Placed!
                </h3>
                <p className="text-text-secondary text-sm">
                  Your gold coin will be delivered within 15 days.
                  You can track your order from the dashboard.
                </p>
              </div>

              {invoiceNo && (
                <div className="px-4 py-2 rounded-xl bg-bg-app/60 border border-gold-500/10">
                  <span className="text-xs text-text-secondary">Invoice #</span>
                  <span className="text-sm font-bold text-gold-500 ml-2">{invoiceNo}</span>
                </div>
              )}

              <div className="flex flex-col gap-3 w-full mt-2">
                <Button
                  onClick={handleViewInvoice}
                  className="w-full h-12 bg-gold-gradient text-black font-bold tracking-wider uppercase text-xs rounded-xl"
                >
                  <Download className="w-4 h-4 mr-2" /> View Invoice
                </Button>
                <button
                  onClick={() => (window.location.href = "/dashboard/customer")}
                  className="w-full h-12 rounded-xl border border-gold-500/20 text-text-secondary hover:text-gold-500 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" /> Track Order
                </button>
                <button
                  onClick={onClose}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          )}

          {/* ERROR STEP */}
          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 flex flex-col items-center text-center gap-5"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-text-primary mb-2">
                  Payment Failed
                </h3>
                <p className="text-text-secondary text-sm">{error}</p>
              </div>
              <div className="flex gap-3 w-full">
                <Button
                  onClick={() => {
                    setStep("review");
                    setError("");
                  }}
                  className="flex-1 h-12 bg-gold-gradient text-black font-bold rounded-xl"
                >
                  Try Again
                </Button>
                <button
                  onClick={onClose}
                  className="flex-1 h-12 rounded-xl border border-gold-500/20 text-text-secondary hover:text-text-primary text-sm font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
