"use client";

import SpotPriceHero from "@/components/home/SpotPriceHero";
import GoldCoinGrid from "@/components/home/GoldCoinGrid";
import ArtisanSection from "@/components/home/ArtisanSection";
import Features from "@/components/home/Features";
import TrustSection from "@/components/home/TrustSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-app">
      <div className="relative">
        <SpotPriceHero />
      </div>
      <div className="container mx-auto px-4 py-20 space-y-32">
        <GoldCoinGrid />
        <ArtisanSection />
        <Features />
        <TrustSection />
      </div>
      <Footer />
    </main>
  );
}
