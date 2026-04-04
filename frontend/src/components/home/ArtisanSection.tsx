"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Award, ShieldCheck, Gem } from "lucide-react";

export default function ArtisanSection() {
  return (
    <section className="py-32 relative overflow-hidden bg-bg-app">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* Visual Side */}
          <div className="relative order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative aspect-square max-w-lg mx-auto"
            >
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="relative w-full h-full border-2 border-gold-500/10 bg-gold-500/5 rounded-[40px] flex items-center justify-center overflow-hidden">
                  <Image 
                    src="/images/coins/lakshmi_ganesh.png"
                    alt="Heritage Lakshmi Ganesh Gold Coin"
                    fill
                    className="object-contain scale-110 drop-shadow-[0_20px_60px_rgba(212,175,55,0.4)]"
                  />
                  {/* Floating Elements */}
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-4 -right-4 w-32 h-32 bg-bg-surface/80 backdrop-blur-xl border border-gold-500/30 rounded-3xl p-4 flex flex-col items-center justify-center shadow-2xl z-20"
                  >
                    <Award className="w-8 h-8 text-gold-500 mb-2" />
                    <span className="text-[10px] font-black text-gold-500 uppercase tracking-widest text-center">Master<br/>Crafted</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Content Side */}
          <div className="flex flex-col gap-10 order-1 lg:order-2">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 backdrop-blur-md"
              >
                <Gem className="w-4 h-4 text-gold-500" />
                <span className="text-[10px] font-black text-gold-500 uppercase tracking-[0.2em]">The Heritage Collection</span>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-6xl font-heading font-black text-text-primary leading-[1.1]"
              >
                Divine Artistry in <span className="text-gradient-gold">Pure Gold.</span>
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-text-secondary text-lg leading-relaxed font-medium"
              >
                Our Heritage Collection combines 24K purity with centuries of spiritual symbolism. Each Lakshmi Ganesh and Kuber coin is minted with precision, honoring the tradition of wealth and prosperity.
              </motion.p>
            </div>

            <div className="grid gap-6">
              {[
                {
                  icon: Sparkles,
                  title: "Intricate Embossing",
                  desc: "High-relief 3D minting that captures every divine detail of our sacred icons."
                },
                {
                  icon: ShieldCheck,
                  title: "Purity Guaranteed",
                  desc: "Every coin is assayed and certified to be 999.9 pure gold bullion."
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="p-6 rounded-[32px] bg-bg-surface/40 border border-gold-500/10 flex gap-5 hover:border-gold-500/30 transition-all duration-500"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500 shrink-0">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-text-primary font-black text-sm uppercase tracking-widest mb-1">{item.title}</h4>
                    <p className="text-text-secondary text-sm font-medium opacity-70 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
