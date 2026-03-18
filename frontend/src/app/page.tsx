import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import PriceTicker from "@/components/home/PriceTicker";
import Features from "@/components/home/Features";
import Calculator from "@/components/home/Calculator";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <Hero />
      <PriceTicker />
      <Features />
      <Calculator />
      <Footer />
    </main>
  );
}


