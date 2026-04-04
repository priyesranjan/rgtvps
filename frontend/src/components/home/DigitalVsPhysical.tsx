"use client";

import { motion } from "framer-motion";
import { Globe, Truck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DigitalVsPhysical() {
  return (
    <section className="py-32 relative overflow-hidden bg-bg-app">
      {/* Cinematic Ambient Orbs */}
      <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-0 -right-20 w-[600px] h-[600px] bg-gold-400/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-heading font-bold mb-8">
            The Best of <span className="text-gradient-gold">Both Worlds</span>
          </h2>
          <p className="text-text-secondary text-lg md:text-xl leading-relaxed">
            Whether you want the speed of digital gold or the comfort of holding real gold coins, we make it easy and secure for you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          {/* Digital Gold Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col bg-white/40 dark:bg-obsidian-glass backdrop-blur-xl border border-gold-500/20 rounded-[40px] p-10 lg:p-14 hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden shadow-gold-soft"
          >
            <div className="absolute inset-0 bg-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              
              <h3 className="text-3xl font-bold text-text-primary mb-6 font-heading">Digital Gold</h3>
              
              <ul className="space-y-6">
                {[
                  { title: "Sell Anytime", desc: "Sell your gold anytime at live prices and get money in your bank account." },
                  { title: "No Storage Fees", desc: "We store your gold in safe vaults for free. No extra costs." },
                  { title: "Start Small", desc: "You can start saving with as little as 0.5g of pure gold." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <h4 className="text-text-primary font-bold text-sm mb-1">{item.title}</h4>
                      <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-12 pt-8 border-t border-white/5 relative z-10">
                <Button variant="outline" className="w-full h-14 border-blue-500/30 text-blue-600 hover:bg-blue-500 hover:text-white transition-all font-bold tracking-widest uppercase text-xs">
                    See Digital Gold Benefits
                </Button>
            </div>
          </motion.div>

          {/* Physical Gold Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col bg-white/40 dark:bg-obsidian-glass backdrop-blur-xl border border-gold-500/20 rounded-[40px] p-10 lg:p-14 hover:border-gold-500/30 transition-all duration-500 group relative overflow-hidden shadow-gold-soft"
          >
            <div className="absolute inset-0 bg-gold-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gold-500/10 flex items-center justify-center mb-8 border border-gold-500/20 group-hover:scale-110 transition-transform">
                <Truck className="w-8 h-8 text-gold-500" />
              </div>
              
              <h3 className="text-3xl font-bold text-text-primary mb-6 font-heading">Physical Gold</h3>
              
              <ul className="space-y-6">
                {[
                  { title: "Safe Delivery", desc: "Fully insured delivery to your home in secure, tamper-proof packaging." },
                  { title: "Certified Pure", desc: "Every coin is marked for 24K 999.9 purity by the government." },
                  { title: "Real Gold", desc: "The ultimate safety. Hold your real, physical wealth in your own hands." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />
                    <div>
                      <h4 className="text-text-primary font-bold text-sm mb-1">{item.title}</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 pt-8 border-t border-gold-500/10 relative z-10">
                <Button variant="outline" className="w-full h-14 border-gold-600/30 text-gold-700 hover:bg-gold-500 hover:text-white transition-all font-bold tracking-widest uppercase text-xs">
                    Order 24K Coins
                </Button>
            </div>
          </motion.div>
        </div>

        {/* Global Assurance Band */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 py-12 px-6 bg-emerald-gradient border-y border-border-primary rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-gold-soft"
        >
          <div className="flex flex-col gap-2">
            <h4 className="text-2xl font-bold text-text-primary font-heading uppercase tracking-wide">Our Guarantee</h4>
            <p className="text-text-secondary max-w-md">Every order is protected by high-level security and government certifications.</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-10 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-gold-700 dark:text-gold-300">BIS 999.9</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-black">Cashfree Verified</span>
              </div>
             <div className="flex items-center gap-2">
               <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-black">Insured Logistics</span>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
