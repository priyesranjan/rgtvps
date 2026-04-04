"use client";

import { motion } from "framer-motion";
import { Truck, Shield, TrendingUp, RefreshCw } from "lucide-react";

const FEATURES_DATA = [
  {
    title: "Insured Doorstep Delivery",
    description: "Receive your pure 24K gold coins in safe, tamper-proof packaging delivered anywhere in India.",
    icon: Truck,
    className: "md:col-span-2",
    delay: 0.2
  },
  {
    title: "Instant Liquidity",
    description: "Sell your gold back at live market prices and get instant credit to your linked bank account.",
    icon: TrendingUp,
    className: "md:col-span-1",
    delay: 0.3
  },
  {
    title: "Ultra-Secure Payouts",
    description: "Our payment architecture ensures every transaction is encrypted and verified instantly.",
    icon: RefreshCw,
    className: "md:col-span-1",
    delay: 0.4
  },
  {
    title: "Complimentary Vaulting",
    description: "We store your gold in BRINKS-certified high-security vaults at zero cost, fully covered by insurance.",
    icon: Shield,
    className: "md:col-span-2",
    delay: 0.5
  },
];

export default function Features() {
  return (
    <section className="py-32 relative overflow-hidden bg-bg-app border-y border-gold-500/10">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20" id="features">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-gold-500/20 mb-8"
          >
            <span className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em]">Engineered for Trust</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-heading font-black mb-8 text-text-primary tracking-tighter"
          >
            The Gold Standard of <br /> <span className="text-gold-500 italic">Digital Assets.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-text-secondary text-lg md:text-xl leading-relaxed font-medium"
          >
            Our ecosystem is built on transparency and speed. Whether saving for the future or liquidating today, we ensure a seamless experience.
          </motion.p>
        </div>

        {/* Bento Grid - Pure Text Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[280px]">
          {FEATURES_DATA.map((feature) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: feature.delay }}
              className={`relative rounded-[40px] p-10 border border-gold-500/10 bg-bg-surface/40 backdrop-blur-xl overflow-hidden group hover:border-gold-500/50 transition-all duration-700 ${feature.className} flex flex-col justify-between shadow-2xl`}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-14 h-14 rounded-2xl border border-gold-500/10 flex items-center justify-center mb-10 group-hover:bg-gold-500/10 transition-all duration-700">
                  <feature.icon className="w-7 h-7 text-gold-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-text-primary mb-4 font-heading tracking-tight">{feature.title}</h3>
                  <p className="text-text-secondary text-sm font-medium leading-relaxed max-w-sm opacity-70">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


