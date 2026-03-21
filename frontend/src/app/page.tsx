"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import PriceTicker from "@/components/home/PriceTicker";
import Features from "@/components/home/Features";
import Calculator from "@/components/home/Calculator";
import Footer from "@/components/layout/Footer";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const userJson = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.role === "CUSTOMER") router.push("/dashboard/customer");
        else if (user.role === "STAFF") router.push("/dashboard/staff");
        else if (user.role === "ADMIN") router.push("/dashboard/admin");
      } catch (e) {
        localStorage.clear();
      }
    }
  }, [router]);

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


