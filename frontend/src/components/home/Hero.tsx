"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="relative w-full min-h-screen pt-32 pb-20 lg:pt-24 lg:pb-0 overflow-hidden lg:flex lg:items-center bg-bg-app"
    >
      {/* Background Layer - Clean Obsidian */}
      <div className="absolute inset-0 z-0 bg-bg-app" />

      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-20">
        
        {/* Left Content Area */}
        <div className="flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 backdrop-blur-md shrink-0">
              <ShieldCheck className="w-4 h-4 text-gold-600 shrink-0" />
              <span className="text-[10px] font-bold text-gold-400 uppercase tracking-[0.2em]">100% Pure 24K Certified Gold</span>
            </div>

            {/* Client Trust Badge - Obsidian Style */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-lg">
              <div className="flex -space-x-2 shrink-0">
                {['JD', 'VK', 'SK'].map((initials, idx) => (
                  <div key={idx} className="w-7 h-7 rounded-full bg-gradient-to-br from-obsidian-700 to-obsidian-900 border border-gold-500/30 flex items-center justify-center text-[8px] font-black text-gold-500">
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-[11px] font-bold text-gold-200/60 uppercase tracking-widest">
                Trusted by <span className="text-gold-500">1,200+</span> Investors
              </span>
            </div>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-6xl md:text-8xl font-heading font-black text-white mb-2 leading-[0.95] tracking-tighter"
            >
              The New Era of<br />
              <span className="text-gradient-gold drop-shadow-[0_10px_30px_rgba(212,175,55,0.3)]">Digital Bullion.</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "120px" }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-1.5 bg-gradient-to-r from-gold-600 to-transparent rounded-full"
            />
          </div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-xl text-text-secondary text-lg md:text-xl mb-8 leading-relaxed font-medium"
          >
            Experience pure gold ownership with unparalleled security. Buy, store, and trade certified 24K gold with the touch of a button.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-5 pt-4"
          >
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-sm py-8 px-10 bg-gold-500 hover:bg-gold-600 text-black font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-[0_10px_40px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95">
                Invest Now <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </Link>
            <Link href="#coins" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-sm py-8 px-10 border-gold-500/30 text-gold-400 hover:bg-gold-500/10 backdrop-blur-sm font-black uppercase tracking-[0.2em] transition-all duration-500">
                View Collection
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="relative h-[500px] lg:h-[700px] flex items-center justify-center mt-12 lg:mt-0 overflow-visible">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -20, 0]
            }}
            transition={{ 
              duration: 2,
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative w-[300px] h-[300px] lg:w-[450px] lg:h-[450px]"
          >
            {/* Main Container - REMOVED IMAGE */}
            <div className="relative w-full h-full rounded-2xl p-4 overflow-visible border-2 border-gold-500/20 bg-gold-500/5 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl lg:text-6xl font-black text-gold-500 tracking-tighter mb-2">24K</div>
                  <div className="text-sm lg:text-xl font-bold text-gold-400/60 uppercase tracking-[0.2em]">Pure Digital Bullion</div>
                </div>
            </div>
            
            {/* Achievement Badge Overlay */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute -right-4 top-1/4 p-4 rounded-2xl bg-bg-surface border border-gold-500/30 backdrop-blur-xl shadow-2xl z-20 hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-gold-500 uppercase tracking-tighter">Certified</div>
                  <div className="text-xs font-bold text-white uppercase tracking-widest">99.9% Purity</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 hidden lg:flex flex-col items-center gap-3"
      >
        <span className="text-[9px] font-black text-gold-700/60 uppercase tracking-[0.5em]">Scroll to Explore</span>
        <div className="w-5 h-9 border border-gold-500/30 rounded-full flex justify-center p-1 backdrop-blur-sm">
          <motion.div 
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-2 bg-gold-500 rounded-full"
          />
        </div>
      </motion.div>
    </motion.section>
  );
}
