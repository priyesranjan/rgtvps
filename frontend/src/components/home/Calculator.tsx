"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Coins, CalendarDays, CalendarClock, Target } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Calculator() {
  const [goldAdvance, setGoldAdvance] = useState<number>(500000); // 5 Lakhs default
  const [monthlyRate, setMonthlyRate] = useState<number>(3); // 3% monthly default

  // Math calculated dynamically
  const monthlyYield = Math.round(goldAdvance * (monthlyRate / 100));
  const weeklyYield = Math.round(monthlyYield / 4);
  const dailyYield = Math.round(monthlyYield / 30);

  // Generate chart data for 12 months based on simple interest model
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      name: `Mo ${month}`,
      investment: goldAdvance,
      totalProfit: monthlyYield * month,
      totalValue: goldAdvance + (monthlyYield * month),
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Find the specific data points from payload
      const investmentPoint = payload.find((p: any) => p.dataKey === 'investment');
      const totalValuePoint = payload.find((p: any) => p.dataKey === 'totalValue');
      
      const invVal = investmentPoint ? investmentPoint.value : 0;
      const totVal = totalValuePoint ? totalValuePoint.value : 0;
      const profitVal = totVal - invVal;

      return (
        <div className="bg-emerald-1000/95 border border-gold-500/20 p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-gray-400 mb-3 font-mono text-xs uppercase tracking-wider">{label} Projection</p>
          <div className="space-y-2">
            <p className="text-white font-mono text-sm flex justify-between gap-4">
              <span className="text-gray-400">Principal:</span> 
              <span>₹{invVal.toLocaleString('en-IN')}</span>
            </p>
            <p className="text-emerald-400 font-mono text-sm font-bold flex justify-between gap-4">
              <span className="text-gray-400 font-normal">Est. Profit:</span> 
              <span>+₹{profitVal.toLocaleString('en-IN')}</span>
            </p>
            <div className="h-px w-full bg-gold-500/20 my-2" />
            <p className="text-gold-400 font-mono text-sm font-bold flex justify-between gap-4">
              <span className="text-gray-400 font-normal">Total Value:</span> 
              <span>₹{totVal.toLocaleString('en-IN')}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="py-24 relative overflow-hidden bg-emerald-950 border-y border-gold-500/10">
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-gold-500/5 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-heading font-bold mb-6"
          >
            Calculate Your <span className="text-gradient-gold">Yield Potential</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg"
          >
            Adjust your initial gold advance and targeted monthly return rate to map out your real-world physical asset growth.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Side: Controls & Immediate Yields */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-4 bg-emerald-1000/80 backdrop-blur-xl border border-gold-500/20 rounded-3xl p-8 shadow-2xl relative flex flex-col justify-between"
          >
            {/* Subtle inner top highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

            <div className="space-y-10">
              
              {/* Gold Advance Slider */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center">
                    <Coins className="w-4 h-4 mr-2 text-gold-500" /> Gold Advance Amount
                  </label>
                  <div className="text-2xl font-mono font-bold text-white">
                    ₹{goldAdvance.toLocaleString('en-IN')}
                  </div>
                </div>
                
                <input 
                  type="range" 
                  min="10000" 
                  max="1000000" 
                  step="10000"
                  value={goldAdvance}
                  onChange={(e) => setGoldAdvance(Number(e.target.value))}
                  className="w-full h-2 bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-gold-500 outline-none"
                  style={{
                    background: `linear-gradient(to right, #d4af37 ${(goldAdvance - 10000) / (1000000 - 10000) * 100}%, #10172b ${(goldAdvance - 10000) / (1000000 - 10000) * 100}%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 font-mono mt-3">
                  <span>₹10K</span>
                  <span>₹10 Lakhs</span>
                </div>
              </div>

              {/* ROI Slider */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center">
                    <Target className="w-4 h-4 mr-2 text-blue-500" /> Target Monthly ROI
                  </label>
                  <div className="text-2xl font-mono font-bold text-blue-400">
                    {monthlyRate.toFixed(1)}%
                  </div>
                </div>
                
                <input 
                  type="range" 
                  min="0.5" 
                  max="10" 
                  step="0.1"
                  value={monthlyRate}
                  onChange={(e) => setMonthlyRate(Number(e.target.value))}
                  className="w-full h-2 bg-emerald-900 rounded-lg appearance-none cursor-pointer outline-none"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 ${(monthlyRate - 0.5) / (10 - 0.5) * 100}%, #10172b ${(monthlyRate - 0.5) / (10 - 0.5) * 100}%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 font-mono mt-3">
                  <span>0.5%</span>
                  <span>10.0%</span>
                </div>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

              {/* Outputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex sm:flex-col items-center justify-between sm:justify-center p-4 rounded-xl bg-emerald-950 border border-gold-500/10">
                  <span className="text-xs text-gray-400 uppercase font-semibold flex items-center sm:mb-2 text-nowrap">
                    <CalendarDays className="w-4 h-4 mr-2 text-gold-500/70 hidden sm:block" /> Daily
                  </span>
                  <span className="text-base sm:text-lg font-mono font-semibold text-gray-200">₹{dailyYield.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex sm:flex-col items-center justify-between sm:justify-center p-4 rounded-xl bg-emerald-900 border border-gold-500/30 shadow-gold-glow/10 sm:transform sm:scale-105 z-10 relative">
                  <div className="hidden sm:block absolute inset-x-0 -top-px h-px bg-gold-400/50" />
                  <span className="text-xs text-gold-400 uppercase font-bold flex items-center sm:mb-2 text-nowrap">
                    <CalendarClock className="w-4 h-4 mr-2 text-gold-400 hidden sm:block" /> Weekly
                  </span>
                  <span className="text-lg sm:text-xl font-mono font-bold text-white">₹{weeklyYield.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex sm:flex-col items-center justify-between sm:justify-center p-4 rounded-xl bg-emerald-950 border border-gold-500/10">
                  <span className="text-xs text-gray-400 uppercase font-semibold flex items-center sm:mb-2 text-nowrap">
                    <CalendarClock className="w-4 h-4 mr-2 text-gold-500/70 hidden sm:block" /> Monthly
                  </span>
                  <span className="text-base sm:text-lg font-mono font-semibold text-gray-200">₹{monthlyYield.toLocaleString('en-IN')}</span>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Right Side: The Graph */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-8 bg-emerald-1000/40 backdrop-blur-md border border-gold-500/10 rounded-3xl p-6 lg:p-8 flex flex-col h-full min-h-[500px]"
          >
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
              <div>
                <h3 className="text-lg sm:text-xl font-heading font-semibold text-white">12-Month Growth Projection</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Estimated compounding value over one year</p>
              </div>
              <div className="w-full sm:w-auto text-left sm:text-right bg-emerald-950 border border-gold-500/20 px-4 py-2 rounded-xl mt-2 sm:mt-0">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Est. Value (1 Yr)</p>
                <p className="text-xl sm:text-2xl font-mono font-bold text-gold-400">
                  ₹{(goldAdvance + (monthlyYield * 12)).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="flex-1 w-full relative min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#4b5563" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#4b5563" 
                    fontSize={12}
                    tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#d4af37', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  
                  {/* Total Value drawn first so it's behind Principal */}
                  <Area 
                    type="monotone" 
                    dataKey="totalValue" 
                    stroke="#d4af37" 
                    fill="url(#colorValue)" 
                    strokeWidth={3}
                    activeDot={{ r: 6, fill: '#d4af37', stroke: '#0a1128', strokeWidth: 2 }}
                  />
                  {/* Principal drawn second so its blue area overlays the bottom part */}
                  <Area 
                    type="monotone" 
                    dataKey="investment" 
                    stroke="#3b82f6" 
                    fill="url(#colorPrincipal)" 
                    strokeWidth={2}
                    activeDot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
              <div className="flex items-center px-3 py-1.5 rounded-full bg-emerald-950 border border-blue-500/20">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2 opacity-80"></div>
                Principal Advance
              </div>
              <div className="flex items-center px-3 py-1.5 rounded-full bg-emerald-950 border border-gold-500/20">
                <div className="w-2.5 h-2.5 rounded-full bg-gold-400 mr-2 shadow-[0_0_8px_rgba(212,175,55,0.8)]"></div>
                Projected Growth
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}


