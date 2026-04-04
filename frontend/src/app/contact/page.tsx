"use client";

import { motion } from "framer-motion";
import Footer from "@/components/layout/Footer";
import { Mail, MapPin, MessageSquare, Clock, Globe, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col bg-bg-app">
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(212,175,55,0.05)_0%,transparent_40%)]" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_100%,rgba(212,175,55,0.03)_0%,transparent_40%)]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-20">
            
            {/* Left: Content */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 mb-8">
                  <Globe className="w-4 h-4 text-gold-600" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-600">Customer Support</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-heading font-black mb-8 leading-tight">
                  Talk To <br />
                  <span className="text-gradient-gold">Our Experts.</span>
                </h1>
                
                <p className="text-text-secondary text-lg mb-12 leading-relaxed">
                  We&apos;re here to help you with your gold savings. Whether you&apos;re buying for the first time or need help with a large order, we&apos;ve got you covered.
                </p>

                <div className="space-y-8">
                   <div className="flex gap-6 group">
                      <div className="w-12 h-12 rounded-2xl bg-white/40 border border-gold-500/20 flex items-center justify-center shrink-0 group-hover:border-gold-500/50 transition-colors shadow-gold-soft">
                         <MapPin className="w-5 h-5 text-gold-600" />
                      </div>
                      <div>
                         <h4 className="text-xs font-bold uppercase tracking-widest text-gold-500 mb-1">HQ Address</h4>
                         <p className="text-sm text-text-primary leading-relaxed opacity-80">
                            B-19, 2nd Floor, PC Colony<br />
                            Above Airtel Office, Kankarbagh<br />
                            Patna, Bihar - 800020
                         </p>
                      </div>
                   </div>

                   <div className="flex gap-6 group">
                      <div className="w-12 h-12 rounded-2xl bg-white/40 border border-gold-500/20 flex items-center justify-center shrink-0 group-hover:border-gold-500/50 transition-colors shadow-gold-soft">
                         <Mail className="w-5 h-5 text-gold-600" />
                      </div>
                      <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-gold-600 mb-1">Office Address</h4>
                         <p className="text-sm text-text-primary leading-relaxed opacity-80 underline underline-offset-4 decoration-gold-500/30">
                            support@royalgoldtraders.com
                         </p>
                      </div>
                   </div>

                   <div className="flex gap-6 group">
                      <div className="w-12 h-12 rounded-2xl bg-white/40 border border-gold-500/20 flex items-center justify-center shrink-0 group-hover:border-gold-500/50 transition-colors shadow-gold-soft">
                         <Clock className="w-5 h-5 text-gold-600" />
                      </div>
                      <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-gold-600 mb-1">Business Hours</h4>
                         <p className="text-sm text-text-primary leading-relaxed opacity-80">
                            Monday — Saturday<br />
                            10:00 AM — 07:00 PM IST
                         </p>
                      </div>
                   </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-7">
                 <motion.div
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.8, delay: 0.2 }}
                   className="bg-white/40 dark:bg-obsidian-glass border border-gold-500/20 p-12 rounded-[48px] backdrop-blur-3xl relative overflow-hidden group shadow-gold-soft"
                 >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 blur-[80px] rounded-full pointer-events-none" />
                  
                  <h3 className="text-2xl font-bold font-heading mb-8 flex items-center gap-3">
                     <MessageSquare className="w-6 h-6 text-gold-600" />
                     How Can We Help?
                  </h3>

                  <form className="space-y-6">
                     <div className="grid md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Full Name</label>
                            <input type="text" className="w-full bg-bg-surface border border-border-primary rounded-2xl px-6 py-4 focus:border-gold-500/50 outline-none transition-all text-sm placeholder:text-text-secondary/50 text-text-primary" placeholder="John Doe" />
                         </div>
                         <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">I am a...</label>
                             <select className="w-full bg-bg-surface border border-border-primary rounded-2xl px-6 py-4 focus:border-gold-500/50 outline-none transition-all text-sm appearance-none text-text-primary">
                                <option className="bg-bg-surface">Looking to Save</option>
                                <option className="bg-bg-surface">Large Buyer / Investor</option>
                                <option className="bg-bg-surface">Business Owner</option>
                             </select>
                          </div>
                      </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Electronic Mail</label>
                          <input type="email" className="w-full bg-bg-surface border border-border-primary rounded-2xl px-6 py-4 focus:border-gold-500/50 outline-none transition-all text-sm placeholder:text-text-secondary/50 text-text-primary" placeholder="john@example.com" />
                       </div>
                       <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary ml-1">Your Message</label>
                           <textarea rows={4} className="w-full bg-bg-surface border border-border-primary rounded-2xl px-6 py-4 focus:border-gold-500/50 outline-none transition-all text-sm resize-none placeholder:text-text-secondary/50 text-text-primary" placeholder="How can we help you today?" />
                        </div>
                     
                     <button className="w-full py-5 rounded-2xl bg-gold-gradient text-white font-bold uppercase tracking-[0.2em] text-xs hover:shadow-gold-glow transition-all flex items-center justify-center gap-3">
                        Send Message <ShieldCheck className="w-4 h-4" />
                     </button>
                  </form>
               </motion.div>

               {/* Trust Indicators for the form */}
               <div className="mt-8 flex items-center justify-center gap-12 opacity-40">
                  <div className="flex items-center gap-2">
                     <ShieldCheck className="w-4 h-4" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Clock className="w-4 h-4" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">24h Priority Response</span>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
