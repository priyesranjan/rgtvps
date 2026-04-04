"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, FileText, Scale, Fingerprint } from "lucide-react";

const legalLinks = [
  { name: "Privacy Policy", href: "/legal/privacy", icon: Shield },
  { name: "Terms of Use", href: "/legal/terms", icon: FileText },
  { name: "AML/KYC Policy", href: "/legal/aml-kyc", icon: Fingerprint },
  { name: "Risk Disclosure", href: "/legal/risk-disclosure", icon: Scale }
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen flex flex-col bg-bg-app bg-texture-overlay">
      
      <div className="flex-1 pt-40 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-12">
            
            {/* Sidebar */}
            <aside className="lg:col-span-1 border-r border-border-primary/50 pr-8 space-y-2 hidden lg:block">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500 mb-8 ml-4">Compliance Center</h3>
              {legalLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20' 
                        : 'hover:bg-gold-500/5 text-text-secondary hover:text-text-primary border border-transparent'
                    }`}
                  >
                    <link.icon className={`w-4 h-4 ${isActive ? 'text-gold-500' : 'text-text-secondary'}`} />
                    <span className="text-sm font-medium">{link.name}</span>
                  </Link>
                );
              })}
            </aside>

            {/* Content */}
            <article className="lg:col-span-3 prose prose-gold max-w-none text-text-primary">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5 }}
               >
                  {children}
               </motion.div>
            </article>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
