"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Truck, Star, Heart, Target, Sparkles,
  ShoppingBag, Loader2, Package, ChevronRight
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Footer from "@/components/layout/Footer";
import BuyModal from "@/components/shop/BuyModal";

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
  isActive: boolean;
  pricing: ProductPricing;
}

const FALLBACK_IMAGES: Record<string, string> = {
  "0.5": "/images/coins/0_5g.png",
  "1": "/images/coins/normal.png",
  "2": "/images/coins/2g.png",
};

const CATEGORIES = [
  { id: "ALL", label: "All Coins", icon: Star },
  { id: "STANDARD", label: "Standard Bullion", icon: Target },
  { id: "HERITAGE", label: "Heritage Collection", icon: Heart },
];

function getProductImage(product: Product): string {
  if (product.imageUrl) return product.imageUrl;
  const w = parseFloat(product.weight);
  if (product.name?.toLowerCase().includes("kuber")) return "/images/coins/kuber.png";
  if (product.name?.toLowerCase().includes("lakshmi") || product.name?.toLowerCase().includes("ganesh"))
    return "/images/coins/lakshmi_ganesh.png";
  return FALLBACK_IMAGES[String(w)] || "/images/coins/normal.png";
}

function getProductCategory(product: Product): string {
  const name = product.name?.toLowerCase() || "";
  if (name.includes("kuber") || name.includes("lakshmi") || name.includes("ganesh") || name.includes("heritage"))
    return "HERITAGE";
  return "STANDARD";
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [livePrice, setLivePrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      let loaded = false;
      for (const base of API_BASE_CANDIDATES) {
        try {
          const res = await fetch(`${base}/products`);
          const text = await res.text();
          if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
            continue;
          }
          const data = text ? JSON.parse(text) : {};
          if (data.data) {
            setProducts(data.data.products || []);
            setLivePrice(data.data.livePrice || 0);
            loaded = true;
            break;
          }
        } catch {
          continue;
        }
      }

      if (!loaded) {
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === "ALL") return products;
    return products.filter(p => getProductCategory(p) === activeCategory);
  }, [products, activeCategory]);

  const handleBuyClick = (product: Product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/auth/login";
      return;
    }
    setSelectedProduct(product);
    setShowBuyModal(true);
  };

  return (
    <main className="min-h-screen bg-bg-app">
      {/* Hero Banner */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 backdrop-blur-xl">
              <ShoppingBag className="w-4 h-4 text-gold-500" />
              <span className="text-[10px] font-black text-gold-500 uppercase tracking-[0.3em]">Official Store</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-heading font-black text-text-primary tracking-tighter">
              Buy <span className="text-gold-500">24K Pure Gold</span> Coins
            </h1>

            <p className="text-text-secondary text-lg max-w-2xl">
              Certified gold coins at live market price. Insured delivery within 15 days.
              Every coin comes with BIS hallmark and purity certificate.
            </p>

            {livePrice > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-bg-surface/60 border border-gold-500/20 backdrop-blur-xl"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-text-secondary">Live Gold Price:</span>
                <span className="text-xl font-heading font-black text-gold-500">
                  {formatCurrency(livePrice)}/g
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="pb-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: "Step 1", title: "Select Coin", desc: "Choose your preferred physical gold coin and quantity." },
              { step: "Step 2", title: "Pay via Razorpay", desc: "Complete secure online payment to confirm your order." },
              { step: "Step 3", title: "Track Delivery", desc: "Follow live 15-day countdown in your dashboard orders." },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-gold-500/15 bg-bg-surface/40 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold-500 mb-2">{item.step}</p>
                <h3 className="text-lg font-heading font-bold text-text-primary mb-1">{item.title}</h3>
                <p className="text-sm text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-6">
          {/* Category Filter */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex gap-2 p-1.5 rounded-2xl bg-bg-surface/50 border border-gold-500/10 backdrop-blur-xl">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                      isActive
                        ? "bg-gold-500 text-black shadow-lg shadow-gold-500/20"
                        : "text-text-secondary hover:text-gold-400 hover:bg-gold-500/5"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Package className="w-16 h-16 text-text-secondary/30" />
              <p className="text-text-secondary text-lg">No products available at the moment.</p>
              <p className="text-text-secondary/60 text-sm">Please check back later or contact support.</p>
            </div>
          )}

          {/* Product Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group relative flex flex-col bg-bg-surface/40 backdrop-blur-2xl border border-gold-500/10 hover:border-gold-500/40 rounded-[32px] overflow-hidden transition-all duration-500 shadow-xl hover:shadow-gold-500/20"
                >
                  {/* Category Badge */}
                  <div className="absolute top-6 left-6 z-20">
                    <div className="px-3 py-1 rounded-full bg-bg-app/60 border border-gold-500/10 backdrop-blur-md">
                      <span className="text-[9px] font-black text-gold-500 uppercase tracking-[0.2em]">
                        {getProductCategory(product)}
                      </span>
                    </div>
                  </div>

                  {/* Stock Badge */}
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-6 right-6 z-20">
                      <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                        <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">
                          Only {product.stock} left
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative h-72 w-full flex items-center justify-center p-12 overflow-hidden border-b border-gold-500/10">
                    <div className="relative w-full h-full transition-all duration-700 group-hover:scale-110 flex items-center justify-center">
                      <Image
                        src={getProductImage(product)}
                        alt={product.name}
                        fill
                        priority={i < 2}
                        loading={i < 2 ? "eager" : "lazy"}
                        sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 30vw"
                        className="object-contain drop-shadow-[0_20px_50px_rgba(212,175,55,0.3)]"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>

                  {/* Content */}
                  <div className="p-8 pt-6 flex flex-col gap-4 flex-grow">
                    <div>
                      <div className="flex items-end gap-3 mb-2">
                        <h3 className="text-2xl font-black text-text-primary tracking-tight font-heading">
                          {product.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-black text-gold-500 uppercase tracking-[0.15em] px-2 py-0.5 border border-gold-500/20 rounded-full">
                          {product.purity}
                        </span>
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                          {Number(product.weight)}g
                        </span>
                      </div>
                      {product.description && (
                        <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="mt-auto space-y-3">
                      <div className="bg-bg-app/60 border border-gold-500/10 rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between text-xs text-text-secondary">
                          <span>Gold Value ({Number(product.weight)}g)</span>
                          <span>{formatCurrency(product.pricing.goldValue)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-text-secondary">
                          <span>GST (3%)</span>
                          <span>{formatCurrency(product.pricing.gstAmount)}</span>
                        </div>
                        <div className="border-t border-gold-500/10 pt-2 flex justify-between items-center">
                          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total</span>
                          <span className="text-xl font-heading font-black text-gold-500">
                            {formatCurrency(product.pricing.total)}
                          </span>
                        </div>
                      </div>

                      {/* Feature Tags */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold-500/5 border border-gold-500/10">
                          <Truck className="w-3.5 h-3.5 text-gold-500/50" />
                          <span className="text-[9px] font-bold text-gold-500/50 uppercase tracking-wider">15-Day Delivery</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold-500/5 border border-gold-500/10">
                          <Shield className="w-3.5 h-3.5 text-gold-500/50" />
                          <span className="text-[9px] font-bold text-gold-500/50 uppercase tracking-wider">BIS Certified</span>
                        </div>
                      </div>

                      {/* Buy Button */}
                      <button
                        onClick={() => handleBuyClick(product)}
                        disabled={product.stock === 0}
                        style={product.stock === 0 ? undefined : { backgroundColor: "#D4AF37", color: "#111111" }}
                        className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-black tracking-[0.15em] uppercase text-[11px] border transition-all duration-300 ${
                          product.stock === 0
                            ? "bg-gray-500/20 text-gray-400 border-gray-500/30 cursor-not-allowed"
                            : "border-gold-300 shadow-lg hover:brightness-105 hover:shadow-gold-500/40 hover:scale-[1.02] active:scale-[0.98]"
                        }`}
                      >
                        {product.stock === 0 ? (
                          "Out of Stock"
                        ) : (
                          <>
                            Buy Now <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, label: "BIS Hallmarked", desc: "Govt. certified purity" },
              { icon: Truck, label: "Insured Delivery", desc: "15-day delivery guarantee" },
              { icon: Sparkles, label: "Live Pricing", desc: "Real-time market rates" },
              { icon: Star, label: "100% Pure", desc: "24K certified gold" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-bg-surface/30 border border-gold-500/5">
                <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gold-500" />
                </div>
                <p className="text-sm font-bold text-text-primary">{label}</p>
                <p className="text-xs text-text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Buy Modal */}
      {showBuyModal && selectedProduct && (
        <BuyModal
          product={selectedProduct}
          onClose={() => {
            setShowBuyModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </main>
  );
}
