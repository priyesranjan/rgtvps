"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Landmark, FileCheck, CheckCircle2 } from "lucide-react";

const trustFeatures = [
  {
    title: "Safe Vault Storage",
    desc: "Your physical gold is kept in high-security vaults, protected by professional security experts.",
    icon: Lock,
    detail: "High-Security Vaults",
    color: "gold"
  },
  {
    title: "100% Insured Assets",
    desc: "Every gram of gold, whether digital or physical, is fully insured against all risks at no cost to you.",
    icon: ShieldCheck,
    detail: "100% Protection",
    color: "blue"
  },
  {
    title: "Government Certified",
    desc: "We only deal in 24K 999.9 Purity gold, certified with BIS Hallmarking for absolute quality guarantee.",
    icon: Landmark,
    detail: "ISI Mark Gold",
    color: "gold"
  }
];

export default function TrustSection() {
  return (
    <section className="py-32 relative overflow-hidden bg-bg-app">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gold-500/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-20 items-center">
          
          {/* Left: Authority Text */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 backdrop-blur-xl">
                <FileCheck className="w-4 h-4 text-gold-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-500">Security Protocols</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-heading font-black text-text-primary leading-[1.05] tracking-tight">
                Absolute <span className="text-gradient-gold">Safety.</span><br />
                Fixed Trust.
              </h2>
              
              <p className="text-text-secondary text-lg leading-relaxed font-medium opacity-80">
                At Royal Gold, we manage your savings with military-grade precision. Every milligram is accounted for, insured, and protected.
              </p>
              
              <div className="space-y-5">
                {[
                  "BIS Hallmarked 24K Pure Gold",
                  "Insured Doorstep Delivery",
                  "Encrypted Transaction Layer"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-gold-500/20 flex items-center justify-center border border-gold-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gold-500" />
                    </div>
                    <span className="text-sm font-black text-gold-500/60 uppercase tracking-widest">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Feature Cards */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-8">
            {trustFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="p-10 rounded-[40px] border border-gold-500/10 bg-bg-surface/40 backdrop-blur-3xl group hover:border-gold-500/30 transition-all duration-700 shadow-2xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-8 transition-all duration-700 group-hover:scale-110 group-hover:bg-gold-500/20">
                  <feature.icon className="w-8 h-8 text-gold-500" />
                </div>
                
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-500/60 mb-3">{feature.detail}</p>
                <h3 className="text-2xl font-black text-text-primary mb-4 font-heading tracking-tight">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed font-medium opacity-70">{feature.desc}</p>
              </motion.div>
            ))}
            
            {/* The "Trust Score" Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="p-10 rounded-[40px] border border-emerald-500/20 bg-emerald-500/[0.03] backdrop-blur-3xl flex flex-col justify-center text-center group hover:bg-emerald-500/[0.05] transition-all duration-700"
            >
                <h4 className="text-5xl font-black text-emerald-600 dark:text-emerald-400 mb-2 tracking-tighter">1,200+</h4>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400/60 mb-6">Verified Investors</p>
                <div className="h-[2px] w-12 bg-emerald-500/20 mx-auto mb-6 group-hover:w-20 transition-all duration-700" />
                <p className="text-xs text-text-secondary italic leading-relaxed px-4">&ldquo;The standard of security and transparency is leagues ahead of traditional jewelers.&rdquo;</p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
