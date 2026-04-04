"use client";

export default function TermsOfUse() {
  return (
    <div className="space-y-12 pb-24">
      <header>
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">Terms of <span className="text-gradient-gold">Engagement.</span></h1>
        <p className="text-text-secondary text-lg">Effective Date: April 3, 2026</p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">1. Institutional Scope</h2>
        <p className="text-text-secondary leading-relaxed">
            The services provided by Royal Gold Traders Private Limited are subject to these Terms of Engagement. By utilizing this platform, you agree to abide by the regulatory and operational guidelines outlined herein.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">2. Purity & Weight Guarantee</h2>
        <p className="text-text-secondary leading-relaxed">
            Royal Gold guarantees that every gram of gold acquired through this platform is 24K (999.9) purity, certified with BIS Hallmarking. Any discrepancy in weight or purity, once verified by a certified laboratory, will be rectified by Royal Gold through full replacement or refund.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">3. Payout & Liquidation</h2>
        <p className="text-text-secondary leading-relaxed">
            Participants may liquidate their holdings at the prevailing live market rate displayed on the dashboard. Payouts are processed through RBI-regulated channels. Standard settlement cycles apply. In the event of extreme market volatility, Royal Gold reserves the right to momentarily halt trading to protect participant equity.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">4. Custodial Responsibilities</h2>
        <p className="text-text-secondary leading-relaxed">
            While gold is stored in our Category-1 vaults, Royal Gold assumes full responsibility for the physical integrity and insurance of the asset. Once a physical delivery is requested and accepted by the participant, custody transfers to the participant.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">5. Prohibited Activities</h2>
        <p className="text-text-secondary leading-relaxed">
            Users are strictly prohibited from using the platform for money laundering, structured transactions to evade GST, or unauthorized bot-driven arbitrage. Any such activity will result in immediate permanent suspension and reporting to the relevant authorities.
        </p>
      </section>
    </div>
  );
}
