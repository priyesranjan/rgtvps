"use client";

import Image from "next/image";
import { useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, Truck, ArrowRight, Star, Heart, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface CoinCardProps {
  weight: string;
  purity: string;
  description: string;
  image: string;
  delay: number;
  category: string;
}

function CoinCard({ weight, purity, description, image, delay, category }: CoinCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
    
    const xPct = (x / rect.width - 0.5) * 10;
    const yPct = (y / rect.height - 0.5) * -10;
    setRotate({ x: yPct, y: xPct });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: "transform 0.1s ease-out"
      }}
      className="group relative flex flex-col bg-bg-surface/40 backdrop-blur-2xl border border-gold-500/10 hover:border-gold-500/40 rounded-[40px] overflow-hidden transition-all duration-700 shadow-2xl hover:shadow-gold-500/20"
    >
      {/* Dynamic Spotlight Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(212,175,55,0.12), transparent 40%)`
        }}
      />

      {/* Decorative Corner Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gold-500/10 to-transparent -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl group-hover:from-gold-500/20 transition-all duration-700" />

      {/* Category Badge */}
      <div className="absolute top-8 left-8 z-20">
        <div className="px-4 py-1.5 rounded-full bg-bg-app/40 border border-gold-500/10 backdrop-blur-md">
          <span className="text-[9px] font-black text-gold-500 uppercase tracking-[0.2em]">{category}</span>
        </div>
      </div>

      {/* Image Area */}
      <div className="relative h-80 w-full flex items-center justify-center p-14 overflow-hidden border-b border-gold-500/10">
        <div className="relative w-full h-full transition-all duration-1000 group-hover:scale-110 flex items-center justify-center">
            <Image 
              src={image} 
              alt={`${weight} ${purity} Gold Coin`}
              fill
              className="object-contain drop-shadow-[0_20px_50px_rgba(212,175,55,0.3)]"
            />
        </div>
        {/* Shine effect on image */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      {/* Content Area - Premium Typography */}
      <div className="p-10 pt-2 flex flex-col gap-6 flex-grow relative z-10">
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-text-primary tracking-tighter font-heading">{weight}</h3>
            <div className="mb-2 h-[2px] w-8 bg-gold-500/40 rounded-full" />
            <span className="mb-1.5 text-[10px] font-black text-gold-500 uppercase tracking-[0.2em]">{purity}</span>
          </div>
          <p className="text-text-secondary text-[15px] leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {/* Action Tags - Modern Grid */}
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div className="flex flex-col items-center justify-center py-5 rounded-3xl bg-gold-500/5 border border-gold-500/10 group-hover:border-gold-500/30 transition-all duration-500">
            <Truck className="w-5 h-5 text-gold-500/40 mb-2 group-hover:text-gold-500 transition-colors" />
            <span className="text-[10px] font-black text-gold-500/40 uppercase tracking-widest group-hover:text-gold-500">Insured Delivery</span>
          </div>
          <div className="flex flex-col items-center justify-center py-5 rounded-3xl bg-gold-500/5 border border-gold-500/10 group-hover:border-gold-500/30 transition-all duration-500">
            <Shield className="w-5 h-5 text-gold-500/40 mb-2 group-hover:text-gold-500 transition-colors" />
            <span className="text-[10px] font-black text-gold-500/40 uppercase tracking-widest group-hover:text-gold-500">Vault Security</span>
          </div>
        </div>

        <div className="pt-8 border-t border-gold-500/10">
          <Link href="/auth/login" className="block">
            <Button className="w-full h-16 group/btn bg-gold-gradient text-black hover:shadow-gold-glow-intense transition-all duration-500 font-black tracking-[0.2em] uppercase text-[11px] rounded-2xl shadow-xl">
              Lock In Live Price <ArrowRight className="w-4 h-4 ml-3 group-hover/btn:translate-x-2 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

const COINS_DATA = [
  {
    weight: "1.0g",
    purity: "24K PURE",
    category: "STANDARD",
    description: "Our signature 1g bullion coin. Perfect for consistent savings and easy liquidity. Certified across India.",
    image: "/images/coins/normal.png",
    delay: 1,
  },
  {
    weight: "1.0g",
    purity: "24K PURE",
    category: "HERITAGE",
    description: "Lord Ganesha & Goddess Lakshmi embossed 1g coin. Invoke prosperity and divine blessings into your home.",
    image: "/images/coins/lakshmi_ganesh.png",
    delay: 2,
  },
  {
    weight: "1.0g",
    purity: "24K PURE",
    category: "HERITAGE",
    description: "Kuber Yantra 1g premium gold coin. Dedicated to the Treasurer of Gods, designed for wealth attraction.",
    image: "/images/coins/kuber.png",
    delay: 3,
  },
  {
    weight: "0.5g",
    purity: "24K PURE",
    category: "STANDARD",
    description: "Start your golden journey today. The most accessible way to own pure Physical Gold.",
    image: "/images/coins/0_5g.png",
    delay: 4,
  },
  {
    weight: "2.0g",
    purity: "24K PURE",
    category: "STANDARD",
    description: "Optimal value for serious savers. Higher weight, lower premiums, maximum security.",
    image: "/images/coins/2g.png",
    delay: 5,
  },
];

const CATEGORIES = [
  { id: "ALL", label: "All Masterpieces", icon: Star },
  { id: "STANDARD", label: "Standard Bullion", icon: Target },
  { id: "HERITAGE", label: "Heritage Collection", icon: Heart },
];

export default function GoldCoinGrid() {
  const [activeCategory, setActiveCategory] = useState<"ALL" | "STANDARD" | "HERITAGE">("ALL");

  const filteredCoins = useMemo(() => {
    return COINS_DATA.filter(coin => activeCategory === "ALL" || coin.category === activeCategory);
  }, [activeCategory]);

  return (
    <section id="coins" className="py-32 relative overflow-hidden bg-bg-app">
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center mb-24 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 backdrop-blur-xl"
          >
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span className="text-[10px] font-black text-gold-500 uppercase tracking-[0.3em]">Curated Selections</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-heading font-black text-text-primary tracking-tighter"
          >
            Select Your <span className="text-gradient-gold">Legacy.</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="max-w-2xl text-text-secondary text-lg md:text-xl font-medium"
          >
            Every coin is a masterpiece of purity. From daily bullion to spiritual heritage, choose the gold that resonates with your vision.
          </motion.p>

          {/* Luxury Category Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-12">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as "ALL" | "STANDARD" | "HERITAGE")}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-500 font-black uppercase text-[10px] tracking-[0.2em] border ${
                  activeCategory === cat.id 
                    ? "bg-gold-500 text-black border-transparent shadow-[0_10px_30px_rgba(212,175,55,0.3)]" 
                    : "bg-bg-surface/40 text-gold-500/60 border-gold-500/10 hover:border-gold-500/30 hover:text-gold-500"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCoins.map((coin) => (
            <CoinCard key={`${coin.category}-${coin.weight}-${coin.description.slice(0,10)}`} {...coin} />
          ))}
        </div>

        {/* Trust Footer - Ultra Premium */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-24 p-10 rounded-[40px] bg-bg-surface/20 border border-gold-500/10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left backdrop-blur-xl"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500 border border-gold-500/20">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-text-primary font-black uppercase tracking-widest text-sm">BIS Hallmarked & Certified</h4>
              <p className="text-xs text-text-secondary font-medium leading-relaxed px-2 opacity-60">&ldquo;The standard of security and transparency here is exceptional.&rdquo;</p>
            </div>
          </div>
          <div className="h-[1px] w-full md:w-32 bg-gold-500/10 md:rotate-90 hidden md:block" />
          <p className="text-[10px] text-text-secondary font-black uppercase tracking-[0.3em] opacity-40 max-w-sm">
            All physical deliveries are fully insured and shipped via high-security logistics partners.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
