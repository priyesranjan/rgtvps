"use client";

export default function RiskDisclosure() {
  return (
    <div className="space-y-12 pb-24">
      <header>
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">Risk <span className="text-gradient-gold">Disclosure.</span></h1>
        <p className="text-text-secondary text-lg">Mandatory Investor Information</p>
      </header>

      <section className="space-y-6 border-l-4 border-gold-500/30 pl-8">
        <p className="text-text-secondary leading-relaxed font-semibold italic">
            Participating in the gold market involves inherent risks. This document outlines the primary risk factors associated with bullion-backed investments and &apos;Gold Advance&apos; protocols.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">1. Price Volatility Risk</h2>
        <p className="text-text-secondary leading-relaxed">
            Gold is a globally traded commodity. Market prices fluctuate daily based on geopolitical events, inflation data, and central bank policies. While gold is traditionally a &apos;Safe Haven&apos;, its price can decrease, leading to potential capital depletion in the short term.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">2. Technical & Platform Risk</h2>
        <p className="text-text-secondary leading-relaxed">
            Digital tracking of physical assets relies on secure platform infrastructure. While we use institutional-grade encryption, the risk of technical outages or latency during critical market movements remains a factor.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">3. Liquidity Risk</h2>
        <p className="text-text-secondary leading-relaxed">
            Royal Gold provides a buy-back guarantee at live market rates. However, during periods of extreme global market disruption, liquidation processing times may be extended beyond standard settlement windows.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">4. Regulatory Risk</h2>
        <p className="text-text-secondary leading-relaxed">
            Changes in government tax policies (e.g., GST) or bullion import/export regulations in India may affect the final realized value of your gold holdings.
        </p>
      </section>

      <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
         <p className="text-sm font-semibold text-emerald-400">
            Recommendation: Participants are advised to diversify their asset allocation and only deploy capital that is not required for short-term liquidity.
         </p>
      </div>
    </div>
  );
}
