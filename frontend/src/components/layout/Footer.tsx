import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone, Instagram, Linkedin, Twitter, ArrowRight, Youtube, Facebook, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-emerald-1000 border-t border-gold-500/10 pt-20 pb-10 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gold-500/5 rounded-[100%] blur-[80px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link href="/" className="flex items-center relative w-fit">
              <Image 
                src="/RoyalGoldTrader-Logo.png" 
                alt="Royal Gold Traders Logo" 
                width={200} 
                height={70} 
                className="object-contain"
              />
            </Link>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              The premier institution for physical gold advances. We offer uncompromised security, reliable yield generation, and exclusive concierge services for discerning participants.
            </p>
            
            {/* Compliance Badges */}
            <div className="flex flex-col gap-1.5 mt-2 bg-emerald-950/40 p-3.5 rounded-xl border border-gold-500/20 w-fit shadow-lg shadow-black/20">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-gold-500 w-4 h-4" />
                <span className="text-sm font-semibold tracking-wide text-gray-200">ISO 9001:2015 Certified Company</span>
              </div>
              <div className="text-xs text-gray-400 font-mono pl-6 uppercase tracking-wider">
                GST NO: 10ADJPI8137N1ZE
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <a href="#" className="w-10 h-10 rounded-full bg-emerald-900 border border-gold-500/20 flex items-center justify-center text-gold-400 hover:bg-gold-500 hover:text-emerald-1000 hover:border-gold-500 transition-all duration-300">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-emerald-900 border border-gold-500/20 flex items-center justify-center text-gold-400 hover:bg-gold-500 hover:text-emerald-1000 hover:border-gold-500 transition-all duration-300">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-emerald-900 border border-gold-500/20 flex items-center justify-center text-gold-400 hover:bg-gold-500 hover:text-emerald-1000 hover:border-gold-500 transition-all duration-300">
                <Youtube size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-emerald-900 border border-gold-500/20 flex items-center justify-center text-gold-400 hover:bg-gold-500 hover:text-emerald-1000 hover:border-gold-500 transition-all duration-300">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-emerald-900 border border-gold-500/20 flex items-center justify-center text-gold-400 hover:bg-gold-500 hover:text-emerald-1000 hover:border-gold-500 transition-all duration-300">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="font-heading font-semibold text-lg text-white mb-6 tracking-wide">Gold Advance</h3>
            <ul className="flex flex-col gap-4">
              {[
                { label: 'How it Works', href: '/about' },
                { label: 'Yield Calculator', href: '/#calculator' },
                { label: 'Our Vaults', href: '/about' },
                { label: 'Visit Office', href: '/contact' }
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-gray-400 hover:text-gold-400 transition-colors text-sm flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500/0 group-hover:bg-gold-500 mr-2 transition-all duration-300" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-heading font-semibold text-lg text-white mb-6 tracking-wide">Company</h3>
            <ul className="flex flex-col gap-4">
              {[
                { label: 'About Directors', href: '/about' },
                { label: 'Careers', href: '/contact' },
                { label: 'Security Standards', href: '/about' },
                { label: 'Press & Media', href: '/contact' }
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-gray-400 hover:text-gold-400 transition-colors text-sm flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500/0 group-hover:bg-gold-500 mr-2 transition-all duration-300" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <h3 className="font-heading font-semibold text-lg text-white mb-2 tracking-wide">Contact Concierge</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 group">
                <MapPin className="text-gold-400 shrink-0 mt-0.5" size={18} />
                <a href="https://maps.app.goo.gl/1swyWuW3Tvvb3e9k7" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm leading-relaxed group-hover:text-gold-400 transition-colors">
                  B-19, 2nd Floor, Above Airtel Office<br />
                  PC Colony, Near Lohiya Park<br />
                  Kankarbagh, Patna - 800020<br />
                  <span className="text-xs text-gold-500/70 underline decoration-gold-500/30 underline-offset-4 mt-1 block">View on Google Maps</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-gold-400 shrink-0" size={18} />
                <span className="text-gray-400 text-sm">+91 9065 415 619</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-gold-400 shrink-0" size={18} />
                <span className="text-gray-400 text-sm">contact@royalgoldtraders.com</span>
              </li>
            </ul>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-white mb-3 tracking-wider uppercase">VIP Newsletter</h4>
              <div className="flex flex-col sm:flex-row max-w-md relative group gap-2 sm:gap-0">
                <input 
                  type="email" 
                  placeholder="Enter your private email" 
                  className="w-full bg-emerald-950 border border-gold-500/20 text-white px-4 py-3 rounded-md sm:rounded-r-none sm:rounded-l-md outline-none focus:border-gold-500/50 transition-colors text-sm"
                />
                <button className="bg-gold-gradient text-emerald-1000 px-5 py-3 sm:py-0 rounded-md sm:rounded-l-none sm:rounded-r-md font-semibold hover:shadow-gold-glow transition-all flex items-center justify-center">
                  <span className="sm:hidden mr-2">Subscribe</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gold-500/10 flex flex-col lg:flex-row items-center justify-between gap-4 text-center lg:text-left">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} Royal Gold Traders. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-6 gap-y-2">
            <Link href="#" className="text-gray-500 hover:text-gold-400 text-sm transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-gray-500 hover:text-gold-400 text-sm transition-colors">Terms of Service</Link>
            <Link href="#" className="text-gray-500 hover:text-gold-400 text-sm transition-colors">Risk Disclosure</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


