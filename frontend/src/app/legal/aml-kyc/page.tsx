"use client";

export default function AMLKYCPolicy() {
  return (
    <div className="space-y-12 pb-24">
      <header>
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">AML & KYC <span className="text-gradient-gold">Protocol.</span></h1>
        <p className="text-text-secondary text-lg">Regulatory Compliance Framework</p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">1. Commitment to Compliance</h2>
        <p className="text-text-secondary leading-relaxed">
            Royal Gold Traders Private Limited maintains a zero-tolerance policy towards financial crime. Our AML (Anti-Money Laundering) and KYC (Know Your Customer) protocols are designed to prevent the misuse of our bullion trading infrastructure for illicit activities.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">2. Identity Verification (KYC)</h2>
        <p className="text-text-secondary leading-relaxed">
            Before executing high-value transactions, all participants must undergo mandatory Aadhaar and PAN verification. This process is automated through secure, government-linked APIs to ensure both speed and accuracy.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">3. Transaction Monitoring</h2>
        <p className="text-text-secondary leading-relaxed">
            Our systems utilize advanced heuristic analysis to detect suspicious transaction patterns, including:
        </p>
        <ul className="list-disc pl-6 space-y-4 text-text-secondary">
          <li>Rapid, high-frequency transactions from fragmented sources.</li>
          <li>Significant deviations from established investment profiles.</li>
          <li>Attempts to bypass per-transaction limits through structuring.</li>
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">4. Source of Funds</h2>
        <p className="text-text-secondary leading-relaxed">
            Royal Gold reserves the right to request proof of the source of funds for any transaction above established thresholds. We only accept payments from verified bank accounts belonging to the registered participant.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">5. Regulatory Reporting</h2>
        <p className="text-text-secondary leading-relaxed">
            We are obligated by law to report suspicious activities to the Financial Intelligence Unit (FIU) and other relevant enforcement agencies without prior notification to the participant.
        </p>
      </section>
    </div>
  );
}
