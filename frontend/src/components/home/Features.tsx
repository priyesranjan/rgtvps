"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Coins, TrendingUp, RefreshCw, LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  delay: number;
}

function FeatureCard({ title, description, icon: Icon, delay }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    // Get dimensions and cursor position relative to the card
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (-10 to 10 degrees)
    const multiplier = 20;
    const xPct = (x / rect.width - 0.5) * multiplier;
    const yPct = (y / rect.height - 0.5) * -multiplier; // Invert Y
    
    setRotateX(yPct);
    setRotateY(xPct);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.1s ease-out'
      }}
      className="relative h-[28rem] w-full group"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gold-gradient rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
      
      {/* Card Body */}
      <div className="absolute inset-0 bg-bg-surface/80 backdrop-blur-sm border border-gold-500/10 hover:border-gold-500/30 rounded-2xl p-8 transition-colors duration-500 flex flex-col items-start gap-6 overflow-hidden">
        
        {/* Subtle decorative background shape */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold-500/5 rounded-full blur-2xl group-hover:bg-gold-500/10 transition-colors duration-500" />
        
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-bg-app border border-gold-500/20 flex items-center justify-center shadow-lg group-hover:shadow-gold-glow-intense transition-shadow duration-500 relative z-10">
          <Icon className="w-6 h-6 text-gold-400" />
        </div>
        
        <div className="space-y-4 relative z-10 w-full">
          <h3 className="text-2xl font-heading font-semibold text-text-primary tracking-wide">{title}</h3>
          <p className="text-text-secondary leading-relaxed text-[15px]">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Features() {
  const features = [
    {
      title: "Physical Gold Advance",
      description: "Secure your wealth physically. Visit our corporate office to participate directly in premium Gold Coins, processed seamlessly by our expert staff.",
      icon: Coins,
    },
    {
      title: "Steady Payout Returns",
      description: "Watch your physical assets generate yield. Receive reliable daily, weekly, or monthly basic earnings directly to your verified account.",
      icon: TrendingUp,
    },
    {
      title: "Hassle-Free Withdrawals",
      description: "Need liquidity? Request a withdrawal anytime and receive cash via our guaranteed 7-day hassle-free checkout process at any branch.",
      icon: RefreshCw,
    },
  ];

  return (
    <section className="py-32 relative overflow-hidden bg-bg-app">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-heading font-bold mb-6"
          >
            The Royal <span className="text-gradient-gold">Advantage</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-text-secondary text-lg"
          >
            A physical asset backing meets digital convenience. We bridge the gap between tangible wealth and passive income.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.title} 
              {...feature} 
              delay={0.2 + (index * 0.1)} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}


