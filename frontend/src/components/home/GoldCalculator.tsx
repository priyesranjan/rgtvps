"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GoldCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [years, setYears] = useState(5);
  const goldRate = 7285; // Current price per gram (mocked)
  const expectedAppreciation = 0.08; // 8% annual appreciation

  const calculation = useMemo(() => {
    const totalInvested = monthlyInvestment * 12 * years;
    const gramsBought = totalInvested / goldRate;
    
    // Future value calculation: P * (((1 + r)^n - 1) / r) * (1 + r)
    const monthlyRate = expectedAppreciation / 12;
    const months = years * 12;
    const futureValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    
    return {
      totalInvested,
      gramsBought: gramsBought.toFixed(2),
      futureValue: Math.round(futureValue),
      growth: Math.round(futureValue - totalInvested)
    };
  }, [monthlyInvestment, years]);

  return (
    <section className="py-32 relative overflow-hidden bg-bg-app">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Content Side */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 backdrop-blur-md"
            >
              <Calculator className="w-4 h-4 text-gold-500" />
              <span className="text-[10px] font-black text-gold-500 uppercase tracking-[0.2em]">Wealth Planner</span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-heading font-black text-white leading-tight">
              Visualize Your <span className="text-gradient-gold">Golden Future.</span>
            </h2>
            
            <p className="text-text-secondary text-lg font-medium opacity-80 leading-relaxed max-w-xl">
              Calculated based on historical trends and current market rates. See how systematic gold accumulation can preserve and grow your wealth.
            </p>

            <div className="space-y-6 pt-4">
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Inflation Hedge</h4>
                  <p className="text-text-secondary text-xs opacity-60">Gold has historically outperformed currency inflation over long periods.</p>
                </div>
              </div>
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Compounding Power</h4>
                  <p className="text-text-secondary text-xs opacity-60">Regular accumulation smooths out market volatility through dollar-cost averaging.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Calculator Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-10 lg:p-14 rounded-[40px] bg-obsidian-900/40 backdrop-blur-3xl border border-white/10 shadow-2xl relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="space-y-10">
              {/* Sliders */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-gold-500 uppercase tracking-widest">Monthly Savings</label>
                    <span className="text-xl font-mono font-bold text-white">₹{monthlyInvestment.toLocaleString('en-IN')}</span>
                  </div>
                  <input 
                    type="range" 
                    min="500" 
                    max="100000" 
                    step="500"
                    value={monthlyInvestment}
                    onChange={(e) => setMonthlyInvestment(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-gold-500"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-gold-500 uppercase tracking-widest">Investment Period</label>
                    <span className="text-xl font-mono font-bold text-white">{years} Years</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="30" 
                    step="1"
                    value={years}
                    onChange={(e) => setYears(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-gold-500"
                  />
                </div>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Total Invested</div>
                  <div className="text-lg font-bold text-white font-mono">₹{calculation.totalInvested.toLocaleString('en-IN')}</div>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Gold Accumulated</div>
                  <div className="text-lg font-bold text-gold-500 font-mono">{calculation.gramsBought}g</div>
                </div>
                <div className="p-6 rounded-3xl bg-gold-500/10 border border-gold-500/20 col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-[9px] font-black text-gold-500 uppercase tracking-widest">Estimated Value</div>
                    <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">+{calculation.growth.toLocaleString('en-IN')} Gain</div>
                  </div>
                  <div className="text-3xl font-black text-white font-mono tracking-tighter">₹{calculation.futureValue.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full h-16 bg-gold-500 hover:bg-gold-600 text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-xl transition-all duration-500">
                  Start Your Plan <TrendingUp className="w-4 h-4 ml-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
