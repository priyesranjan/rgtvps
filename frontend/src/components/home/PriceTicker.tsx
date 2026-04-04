"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

const INITIAL_MARKET_DATA = [
  { 
    asset: "24K Gold (10g)", 
    price: "₹1,51,500", 
    yesterday: "₹1,55,000",
    change: "-₹3,500", 
    isUp: false,
    label: "Sync"
  },
  { asset: "22K Pure Gold", price: "₹1,38,875", change: "-₹3,200", isUp: false },
  { asset: "18K Jewelry Gold", price: "₹1,13,620", change: "+1,250", isUp: true },
  { asset: "24K Pure (1g)", price: "₹15,150", change: "-₹350", isUp: false },
];

export default function PriceTickerV2() {
  const [prices, setPrices] = useState(INITIAL_MARKET_DATA);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(currentPrices => 
        currentPrices.map(item => {
          const move = (Math.random() - 0.5) * 5; 
          const currentPriceNum = parseFloat(item.price.replace(/[^0-9.]/g, ''));
          const newPrice = currentPriceNum + move;
          
          return {
            ...item,
            price: "₹" + newPrice.toLocaleString('en-IN', { 
              maximumFractionDigits: 0 
            }),
            change: item.yesterday 
              ? (newPrice - parseFloat(item.yesterday.replace(/[^0-9.]/g, ''))).toLocaleString('en-IN', { signDisplay: 'always' })
              : (move >= 0 ? "+" : "") + move.toFixed(0),
            isUp: item.yesterday 
              ? (newPrice > parseFloat(item.yesterday.replace(/[^0-9.]/g, '')))
              : move >= 0
          };
        })
      );
    }, 10000); // Much slower to reduce render frequency

    return () => clearInterval(interval);
  }, []);

  const tickerItems = useMemo(() => [...prices, ...prices, ...prices], [prices]);

  return (
    <div id="price-ticker-marquee-v2" className="w-full bg-bg-surface border-y border-gold-500/10 overflow-hidden flex items-center h-16 relative z-20">
      <div className="absolute inset-0 bg-gold-600/[0.03] -z-10" />
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-bg-app via-bg-app/80 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-bg-app via-bg-app/80 to-transparent z-10" />

      <motion.div
        animate={{ x: [0, -1600] }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 40,
          ease: "linear",
        }}
        className="flex whitespace-nowrap items-center min-w-max"
      >
        {tickerItems.map((item, index) => (
          <div 
            key={`${item.asset}-${index}`} 
            className="flex items-center gap-4 px-10 border-r border-white/5 group h-16 cursor-default"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${item.isUp ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
            
            <div className="flex flex-col">
              <span className="text-text-secondary text-[10px] font-bold tracking-widest uppercase leading-none mb-1">
                {item.asset} {item.label && <span className="text-gold-500/50">({item.label})</span>}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-text-primary font-mono text-base font-bold tracking-tight">
                  {item.price}
                </span>
                {item.yesterday && (
                  <span className="text-text-secondary font-mono text-[10px] opacity-40 line-through">
                    {item.yesterday}
                  </span>
                )}
                <div className={`flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded bg-gold-500/10 ${item.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                  {item.isUp ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
                  {item.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
