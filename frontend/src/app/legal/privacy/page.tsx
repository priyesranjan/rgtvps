"use client";



export default function PrivacyPolicy() {
  return (
    <div className="space-y-12 pb-24">
      <header>
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">Privacy <span className="text-gradient-gold">Protocol.</span></h1>
        <p className="text-text-secondary text-lg">Last Updated: April 3, 2026</p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">1. Data Stewardship</h2>
        <p className="text-text-secondary leading-relaxed">
            At Royal Gold Traders Private Limited, we treat your data as a sacred trust. Our privacy protocols are designed to meet or exceed global standards for financial data protection. We collect only what is necessary to facilitate secure transactions and fulfill regulatory KYC (Know Your Customer) requirements.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">2. Information Collection</h2>
        <p className="text-text-secondary leading-relaxed">
            To provide institutional-grade vaulting and trading services, we collect:
        </p>
        <ul className="list-disc pl-6 space-y-4 text-text-secondary">
          <li>Identity Documentation (PAN, Aadhaar) for mandatory regulatory compliance.</li>
          <li>Financial coordinates for secure Payout and Settlement via verified gateways.</li>
          <li>Technical telemetry to ensure the security and integrity of your digital session.</li>
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">3. Storage & Encryption</h2>
        <p className="text-text-secondary leading-relaxed">
            All PII (Personally Identifiable Information) is encrypted using AES-256 standards. Our database is partitioned and isolated to prevent unauthorized access. We do not store plain-text payment credentials; all transactions are tokenized through our Category-1 payment partners.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">4. Disclosure to Third Parties</h2>
        <p className="text-text-secondary leading-relaxed">
            We never sell user data. Information is shared only with:
        </p>
        <ul className="list-disc pl-6 space-y-4 text-text-secondary">
          <li>Regulatory bodies under legal subpoena or mandatory audit.</li>
          <li>Our banking and vaulting partners (on a need-to-know basis) to finalize physical asset allocation.</li>
          <li>Secure KYC verification service providers.</li>
        </ul>
      </section>

      <div className="p-8 rounded-3xl bg-gold-500/5 border border-gold-500/10">
         <p className="text-sm font-semibold text-gold-400">
            Institutional Support: For detailed technical inquiries regarding our data architecture, please contact our Compliance Desk at privacy@royalgoldtraders.com.
         </p>
      </div>
    </div>
  );
}
