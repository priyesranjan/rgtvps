"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

// Mock Data (To be replaced with real WebSocket/API data later)
const MARKET_DATA = [
  { asset: "PHYSICAL GOLD (1 OZ)", price: "2,345.60", change: "+12.40", isUp: true },
  { asset: "PHYSICAL SILVER (1 OZ)", price: "28.32", change: "+0.45", isUp: true },
  { asset: "24K GOLD COIN (10g)", price: "72,850 INR", change: "+350", isUp: true },
  { asset: "22K GOLD COIN (10g)", price: "66,780 INR", change: "+300", isUp: true },
  { asset: "VAULTED PLATINUM", price: "985.10", change: "-5.20", isUp: false },
];

export default function PriceTicker() {
  // We duplicate the array to create a seamless infinite scroll loop
  const tickerItems = [...MARKET_DATA, ...MARKET_DATA, ...MARKET_DATA];

  return (
    <div className="w-full bg-emerald-950 border-y border-gold-500/20 overflow-hidden flex items-center h-14 relative z-20">
      
      {/* Subtle fade effect on edges for seamless loop */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-emerald-950 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-emerald-950 to-transparent z-10" />

      <motion.div
        animate={{ x: [0, -1035] }} // The exact width depends on content, we loop it smoothly
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 30, // Speed of the marquee
          ease: "linear",
        }}
        className="flex whitespace-nowrap items-center min-w-max"
      >
        {tickerItems.map((item, index) => (
          <div 
            key={`${item.asset}-${index}`} 
            className="flex items-center gap-3 px-8 border-r border-gold-500/10"
          >
            <span className="text-gray-400 text-xs font-semibold tracking-widest uppercase">
              {item.asset}
            </span>
            <span className="text-white font-mono font-bold tracking-tight">
              ${item.price}
            </span>
            <div className={`flex items-center text-xs font-medium ${item.isUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.isUp ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
              {item.change}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}


