import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ShieldCheck, ArrowRight, Coins, Banknote, Landmark } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col bg-emerald-1000">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950 border border-gold-500/20 mb-8 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-medium text-gray-300">ISO 9001:2015 Certified Trust</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-8 tracking-tight">
            The New Standard in <br />
            <span className="text-gradient-gold">Wealth Preservation.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Royal Gold Traders bridges the gap between ancient security and modern agility. We secure your wealth using physical assets while providing digital tracking and yield generation.
          </p>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 relative">
            
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

            {/* Step 1 */}
            <div className="bg-emerald-950/40 backdrop-blur-md border border-gold-500/10 p-10 rounded-3xl relative group hover:border-gold-500/30 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-emerald-1000 border border-gold-500/20 flex items-center justify-center mb-8 relative z-10 shadow-gold-glow">
                <Landmark className="w-8 h-8 text-gold-400" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-white mb-4">1. Invest Physically</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Visit our highly secure headquarters in Patna. You deposit your investment directly with our verified employees. Absolute transparency, face to face.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-emerald-950/40 backdrop-blur-md border border-gold-500/10 p-10 rounded-3xl relative group hover:border-gold-500/30 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-emerald-1000 border border-gold-500/20 flex items-center justify-center mb-8 relative z-10 shadow-gold-glow">
                <Coins className="w-8 h-8 text-gold-400" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-white mb-4">2. Asset Allocation</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Your investment is instantly converted and backed by 24k Premium Gold. Our expert traders leverage this physical backing in secure, low-risk corporate markets.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-emerald-950/40 backdrop-blur-md border border-gold-500/10 p-10 rounded-3xl relative group hover:border-gold-500/30 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-emerald-1000 border border-gold-500/20 flex items-center justify-center mb-8 relative z-10 shadow-gold-glow">
                <Banknote className="w-8 h-8 text-gold-400" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-white mb-4">3. Enjoy Your Yield</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Log into your dashboard to watch your payout grow daily. Withdraw your funds hassle-free directly to your bank account with a guaranteed 7-day turnaround.
              </p>
            </div>

          </div>

          <div className="mt-20 text-center">
            <Button size="lg" className="px-10 py-5 text-lg">
              Visit Office Today <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}


