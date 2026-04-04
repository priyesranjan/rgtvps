"use client";

import { motion } from "framer-motion";
import Footer from "@/components/layout/Footer";
import { ShieldCheck, History, Globe, Lock, Landmark } from "lucide-react";

const milestones = [
  {
    year: "Our Roots",
    title: "Tradition of Trust",
    desc: "Started with a simple goal: making pure gold easy to buy for everyone."
  },
  {
    year: "Purity",
    title: "BIS Certified",
    desc: "We ensure every gram of gold is marked for 100% purity and quality."
  },
  {
    year: "Future",
    title: "Simple Savings",
    desc: "Using technology to make saving in gold as easy as a click."
  }
];

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col bg-bg-app">
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        {/* Cinematic Background elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.08)_0%,transparent_50%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-500/5 rounded-full blur-[160px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 mb-8"
          >
            <ShieldCheck className="w-4 h-4 text-gold-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-600">Your Trusted Gold Partner</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-heading font-black mb-8 leading-[1.1]"
          >
            Keeping Your Gold <br />
            <span className="text-gradient-gold">Safe & Simple.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary text-lg md:text-xl leading-relaxed max-w-3xl mx-auto"
          >
            Royal Gold Traders helps you grow your wealth easily. We combine the timeless value of gold with modern technology to keep your savings secure and accessible.
          </motion.p>
        </div>
      </section>

      {/* Core Philosophy - Bento Style */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-6">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-8 p-12 rounded-[40px] bg-white/40 dark:bg-obsidian-glass backdrop-blur-md border border-gold-500/20 shadow-gold-soft relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
               <History className="w-64 h-64 text-gold-500 -rotate-12" />
            </div>
            <div className="relative z-10 max-w-md">
                <h3 className="text-3xl font-bold mb-6 font-heading">Our Story</h3>
                <p className="text-text-secondary leading-relaxed mb-8">
                    Since we started, Royal Gold has been about making the gold market easy for everyone. We believe everyone should have the chance to save in pure 24K gold with total peace of mind.
                </p>
                <div className="flex gap-12 mt-12">
                   <div>
                      <div className="text-4xl font-black text-gold-500 mb-2">100%</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Physical Backing</div>
                   </div>
                   <div>
                      <div className="text-4xl font-black text-gold-500 mb-2">Zero</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Storage Fees</div>
                   </div>
                </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 p-12 rounded-[40px] bg-gold-gradient group relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute -bottom-10 -right-10 opacity-20">
               <Globe className="w-48 h-48 text-emerald-1000" />
            </div>
            <h3 className="text-2xl font-bold text-white font-heading relative z-10">Real Purity,<br />Local Trust.</h3>
            <p className="text-white/80 text-sm font-medium leading-relaxed relative z-10">
                Helping thousands of people save in gold from the heart of Bihar to all over India.
            </p>
          </motion.div>

        </div>
      </section>

      {/* Custodian & Insurance Section */}
      <section className="py-32 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-heading font-bold mb-6">Safety & <span className="text-gradient-gold">Security</span></h2>
            <div className="h-1 w-24 bg-gold-gradient mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[
                { icon: Lock, title: "Secure Vaults", desc: "Your gold is stored in high-security, climate-controlled environments with 24/7 protection." },
                { icon: ShieldCheck, title: "Total Insurance", desc: "Every bit of gold is 100% insured. If anything happens, your savings are protected." },
                { icon: Landmark, title: "Strict Standards", desc: "We follow all government rules and quality standards so you never have to worry." }
             ].map((item, i) => (
                <div key={i} className="p-10 rounded-3xl bg-bg-surface border border-border-primary hover:border-gold-500/30 transition-all group shadow-gold-soft">
                   <div className="w-14 h-14 rounded-2xl bg-gold-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <item.icon className="w-7 h-7 text-gold-500" />
                   </div>
                   <h4 className="text-xl font-bold mb-4 font-heading text-text-primary">{item.title}</h4>
                   <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Corporate Milestones */}
      <section className="py-32 overflow-hidden">
         <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-8 items-end mb-24 justify-between">
               <div className="max-w-xl">
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold-600 mb-4">Our Progress</h3>
                   <h2 className="text-5xl font-heading font-bold">Our <span className="text-gradient-gold">Growth.</span></h2>
               </div>
                <div className="text-text-secondary text-sm max-w-xs md:text-right">A history of reliability, growing with our customers and new technology.</div>
            </div>

            <div className="grid md:grid-cols-3 gap-12 border-t border-gold-500/10 pt-16">
               {milestones.map((m, i) => (
                  <div key={i} className="relative">
                     <h4 className="text-xl font-bold mb-4 text-gold-600 dark:text-gold-400 font-heading">{m.title}</h4>
                     <p className="text-sm text-text-secondary leading-relaxed">{m.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
