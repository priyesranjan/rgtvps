"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How do I liquidate my digital gold holdings?",
    answer: "Liquidation is instant. You can sell your holdings through your dashboard at any time at live market prices. Payouts are processed via Cashfree and typically arrive in your bank account within minutes."
  },
  {
    question: "Is physical delivery insured during transit?",
    answer: "Every physical delivery is 100% insured. We use professional logistics partners and tamper-evident security packaging. In the unlikely event of loss or damage, Royal Gold bears full responsibility for replacement or refund."
  },
  {
    question: "What certifications accompany the gold coins?",
    answer: "All physical coins provided by Royal Gold are BIS 999.9 Hallmarked, representing the highest standard of gold purity recognized by the Government of India. Each coin comes with a digital certificate of authenticity visible in your dashboard."
  },
  {
    question: "Are there any hidden secure storage fees?",
    answer: "No. Unlike traditional financial institutions, we offer professional vaulting with zero storage fees. Your wealth is preserved in institutional-grade vaults without diminishing its value over time."
  },
  {
    question: "What is the Buy-Back Guarantee?",
    answer: "Royal Gold provides a lifetime buy-back guarantee for all gold purchased on our platform. We will always offer to buy back your gold at the prevailing live market rate, ensuring you always have a path to liquidity."
  }
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="py-32 relative overflow-hidden bg-bg-app" id="faq">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Support Center</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-heading font-bold mb-6"
          >
            Investor <span className="text-gradient-gold">Clarity.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary text-lg"
          >
            Essential information for a secure and transparent gold trading experience.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-3xl border transition-all duration-300 shadow-gold-soft ${
                activeIndex === index 
                  ? 'bg-white/50 dark:bg-obsidian-glass border-gold-500/40' 
                  : 'bg-white/30 dark:bg-gold-500/[0.02] border-gold-500/10 hover:border-gold-500/30'
              }`}
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left group"
              >
                <span className={`text-lg font-bold transition-colors ${
                  activeIndex === index ? 'text-gold-400' : 'text-text-primary'
                }`}>
                  {faq.question}
                </span>
                <ChevronDown className={`w-5 h-5 text-text-secondary transition-transform duration-500 ${
                  activeIndex === index ? 'rotate-180 text-gold-600' : ''
                }`} />
              </button>
              
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-8 text-text-secondary leading-relaxed">
                      <div className="h-[1px] w-full bg-gold-500/10 mb-6" />
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Professional Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-8 rounded-[32px] bg-gold-500/5 dark:bg-obsidian-glass border border-gold-500/20 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 blur-3xl rounded-full" />
          <div className="relative z-10 text-center md:text-left">
            <h4 className="text-xl font-bold text-text-primary mb-2">Need Institutional Support?</h4>
            <p className="text-sm text-text-secondary leading-relaxed max-w-md">Our dedicated accounts team is available for high-value consultations.</p>
          </div>
          <div className="relative z-10">
            <button className="px-8 py-4 rounded-xl bg-gold-gradient text-white font-bold hover:shadow-gold-glow transition-all text-sm uppercase tracking-widest leading-none">
              Contact Treasury
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
