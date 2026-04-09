"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown, TrendingUp, Info, ShieldCheck, AlertCircle } from "lucide-react";
import { fetchLiveGoldPrice, GoldPriceData } from "@/lib/price-service";

const FALLBACK_DATA: GoldPriceData = {
  price: "₹1,51,482",
  yesterday: "₹1,55,000",
  change: "-₹3,518 (2.2%)",
  purity: "24K Fine Gold (99.9%)",
  lastUpdated: "Just Now",
  isUp: false,
};

const REFRESH_INTERVAL = 3 * 60 * 60 * 1000; // 3 Hours

export default function SpotPriceHero() {
  const [goldData, setGoldData] = useState<GoldPriceData>(FALLBACK_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const updatePrice = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLiveGoldPrice();
      setGoldData(data);
      setError(false);
    } catch (err) {
      console.error("Hero price sync failed:", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updatePrice();
    const timer = setInterval(updatePrice, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-bg-app border-b border-gold-500/5">
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Visual Presentation */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-center"
          >
            <div className="relative group p-8">
               <div className="absolute inset-0 bg-gold-500/10 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
               <div className="relative w-72 h-72 md:w-96 md:h-96">
                  <Image 
                    src="/images/coin_hero_pure.png"
                    alt="24K Pure Gold Bullion"
                    fill
                    priority
                    sizes="(max-width: 768px) 288px, 384px"
                    className="object-contain drop-shadow-[0_35px_60px_rgba(212,175,55,0.4)] animate-float"
                  />
               </div>
            </div>
          </motion.div>

          {/* Pricing Intelligence */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col space-y-8"
          >
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs font-bold tracking-widest uppercase">
                <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-gold-500 animate-spin' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse'}`} />
                {isLoading ? "Syncing Market..." : "Live Market Sync"}
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-text-primary leading-tight">
                Gold Spot <br />
                <span className="text-gradient-gold">Intelligence</span>
              </h1>
              <p className="text-text-secondary text-lg max-w-md">
                Institutional-grade pricing for {goldData.purity}, updated in real-time reflecting global exchanges.
              </p>
            </div>

            {/* Main Price Card */}
            <div className="relative p-8 rounded-3xl bg-bg-surface border border-gold-500/10 overflow-hidden group shadow-gold-soft">
              <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500" />
              
              <AnimatePresence mode="wait">
                <motion.div 
                  key={goldData.price}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative z-10 flex flex-col space-y-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-text-secondary text-xs font-bold tracking-wider uppercase">{goldData.purity}</p>
                        {error && (
                          <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-400/5 px-2 py-0.5 rounded-lg border border-red-400/10">
                            <AlertCircle size={12} /> Sync Issue - Showing Latest
                          </div>
                        )}
                      </div>
                      <p className="text-5xl md:text-6xl font-mono font-bold text-text-primary tracking-tighter mt-2">
                        {isLoading ? <span className="opacity-20 animate-pulse tracking-wide">₹0,00,000</span> : goldData.price}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm border ${goldData.isUp ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {goldData.isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {goldData.change}
                      </div>
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-gold-500/10" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-text-secondary text-[10px] font-bold tracking-widest uppercase opacity-40">Previous Close</p>
                      <p className="text-text-primary font-mono text-xl line-through opacity-40 decoration-gold-500/50">{goldData.yesterday}</p>
                    </div>
                    <div className="space-y-1 flex flex-col items-end">
                      <p className="text-text-secondary text-[10px] font-bold tracking-widest uppercase opacity-40">Last Sync</p>
                      <div className="flex items-center gap-2 text-gold-500 text-sm font-bold">
                         <ShieldCheck size={14} className="text-emerald-500" />
                         {goldData.lastUpdated}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Action Group */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <button className="px-8 py-4 bg-gold-gradient text-black font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-gold-glow-intense flex items-center gap-2">
                Manage Vault Assets
              </button>
              <div className="flex items-center gap-3 text-text-secondary/60 text-sm italic">
                <Info size={16} className="text-gold-500/50" />
                Reflecting NSE Gold Spot Rates + GST & Duties
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
