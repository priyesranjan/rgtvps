import Link from "next/link";
import { Mail, MapPin, Phone, Instagram, Linkedin, Youtube, Facebook, ShieldCheck } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-bg-app border-t border-gold-500/10 pt-20 pb-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3 relative w-fit group">
              <div className="relative w-12 h-12">
                <img 
                  src="/RoyalGoldTrader-Logo.png" 
                  alt="Royal Gold Traders Logo" 
                  className="w-full h-full object-contain transition-transform group-hover:scale-110"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gold-500 tracking-tighter leading-none">ROYAL GOLD</span>
                <span className="text-[10px] font-bold text-gold-400/60 uppercase tracking-[0.3em] mt-1">Traders & Partners</span>
              </div>
            </Link>
            <p className="text-text-secondary leading-relaxed max-w-sm text-sm">
              The easiest way to buy and save in pure 24K gold. We keep your gold safe in high-security vaults and help you grow your wealth with ease.
            </p>

            {/* Compliance Badges */}
            <div className="flex flex-col gap-1.5 mt-2 bg-white/40 dark:bg-obsidian-glass backdrop-blur-md p-3.5 rounded-xl border border-gold-500/20 w-fit shadow-gold-soft">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-gold-600 dark:text-gold-400 w-4 h-4" />
                <span className="text-sm font-semibold tracking-wide text-text-primary">ISO 9001:2015 Certified Company</span>
              </div>
              <div className="text-xs text-text-secondary font-mono pl-6 uppercase tracking-wider">
                GST NO: 10ADJPI8137N1ZE
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/40 dark:bg-obsidian-glass border border-gold-500/20 flex items-center justify-center text-gold-600 dark:text-gold-400 hover:bg-gold-500 hover:text-white hover:border-gold-500 transition-all duration-300">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/40 dark:bg-obsidian-glass border border-gold-500/20 flex items-center justify-center text-gold-600 dark:text-gold-400 hover:bg-gold-500 hover:text-white hover:border-gold-500 transition-all duration-300">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/40 dark:bg-obsidian-glass border border-gold-500/20 flex items-center justify-center text-gold-600 dark:text-gold-400 hover:bg-gold-500 hover:text-white hover:border-gold-500 transition-all duration-300">
                <Youtube size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/40 dark:bg-obsidian-glass border border-gold-500/20 flex items-center justify-center text-gold-600 dark:text-gold-400 hover:bg-gold-500 hover:text-white hover:border-gold-500 transition-all duration-300">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-heading font-semibold text-sm text-text-primary mb-6 uppercase tracking-widest">Company</h3>
            <ul className="flex flex-col gap-4">
              {[
                { label: 'Vaulting Partners', href: '/about' },
                { label: 'Insurance Policy', href: '/about' },
                { label: 'Audit Reports', href: '/about' },
                { label: 'Treasury Desk', href: '/contact' }
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-gray-400 hover:text-gold-400 transition-colors text-xs flex items-center group">
                    <span className="w-1 h-1 rounded-full bg-gold-400/0 group-hover:bg-gold-400 mr-2 transition-all duration-300" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="lg:col-span-2">
            <h3 className="font-heading font-semibold text-sm text-text-primary mb-6 uppercase tracking-widest">Legal</h3>
            <ul className="flex flex-col gap-4">
              {[
                { label: 'Terms of Use', href: '/legal/terms' },
                { label: 'Privacy Policy', href: '/legal/privacy' },
                { label: 'AML/KYC Policy', href: '/legal/aml-kyc' },
                { label: 'Risk Disclosure', href: '/legal/risk-disclosure' }
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-text-secondary hover:text-gold-600 dark:hover:text-gold-400 transition-colors text-xs flex items-center group font-medium">
                    <span className="w-1 h-1 rounded-full bg-gold-600/0 group-hover:bg-gold-600 mr-2 transition-all duration-300" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <h3 className="font-heading font-semibold text-sm text-text-primary mb-6 uppercase tracking-widest">Contact Us</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 group">
                <MapPin className="text-gold-600 dark:text-gold-500 shrink-0 mt-0.5" size={16} />
                <a href="https://maps.app.goo.gl/1swyWuW3Tvvb3e9k7" target="_blank" rel="noopener noreferrer" className="text-text-secondary text-xs leading-relaxed group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors font-medium">
                  B-19, 2nd Floor, PC Colony<br />
                  Kankarbagh, Patna, India<br />
                  <span className="text-[10px] text-gold-700 dark:text-gold-500 underline underline-offset-4 mt-1 block">Institutional Headquarters</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-gold-600 dark:text-gold-500 shrink-0" size={16} />
                <span className="text-text-secondary text-xs font-medium">+91 9065 415 619</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-gold-600 dark:text-gold-500 shrink-0" size={16} />
                <span className="text-text-secondary text-xs text-balance font-medium">support@royalgoldtraders.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory Scroll */}
        <div className="mt-12 p-8 rounded-3xl bg-gold-600/5 dark:bg-gold-500/[0.03] border border-gold-500/10 shadow-gold-soft">
          <p className="text-[10px] text-text-secondary leading-relaxed text-center max-w-5xl mx-auto uppercase tracking-wider font-bold">
            DISCLAIMER: Gold trading involves market risk. All physical assets are vaulted with ISO-certified custodians and fully insured by global underwriters. Royal Gold Traders operates in full compliance with local regulatory frameworks, including GST and AML protocols. Instant payouts are subject to bank settlement windows and successful KYC verification. Past performance is not indicative of future yield patterns.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-12 border-t border-gold-500/10 flex flex-col lg:flex-row items-center justify-between gap-4 text-center lg:text-left">
          <p className="text-text-secondary text-[11px] font-bold tracking-wide">
            &copy; {currentYear} ROYAL GOLD TRADERS PRIVATE LIMITED. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8 opacity-70 contrast-125">
            {/* <span className="text-[10px] font-black text-gold-700 dark:text-gold-400 tracking-[0.3em]">SECURE PAYMENTS BY CASHFREE</span> */}
            <span className="text-[10px] font-black text-gold-700 dark:text-gold-400 tracking-[0.3em]">BIS 999.9 CERTIFIED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}


