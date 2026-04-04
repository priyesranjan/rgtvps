"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import ThemeToggle from "@/components/ui/ThemeToggle";

const navLinks = [
  { name: "About Our Gold", href: "/about" },
  { name: "Products", href: "/#coins" },
  { name: "Safety & Legal", href: "/legal/privacy" },
  { name: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id?: string; role: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const parsed = JSON.parse(userJson);
        setTimeout(() => setUser(parsed), 0);
      } catch {
        setTimeout(() => setUser(null), 0);
      }
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide Navbar on dashboard and auth routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500",
        isScrolled
          ? "bg-glass border-b shadow-lg"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 relative z-50 py-2 group">
          <div className="relative w-10 h-10 md:w-12 md:h-12">
            <Image
              src="/RoyalGoldTrader-Logo.png"
              alt="Royal Gold Traders Logo"
              fill
              className="object-contain transition-transform group-hover:scale-110"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-gold-500 tracking-tighter leading-none">ROYAL GOLD</span>
            <span className="text-[8px] font-bold text-gold-400/60 uppercase tracking-[0.3em] mt-0.5">Traders </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "text-sm font-medium uppercase tracking-wider relative group transition-colors duration-200",
                  isActive ? "text-gold-400" : "text-text-secondary hover:text-gold-400"
                )}
              >
                {link.name}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-0.5 bg-gold-400 transition-all duration-300",
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  )}
                />
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-gold-400"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {!user ? (
            <Link href="/auth/login" className="ml-2">
              <Button variant="ghost" className="hidden lg:flex" size="sm">
                Login
              </Button>
            </Link>
          ) : (
            <Link href={
              user.role === "SUPERADMIN" ? "/dashboard/superadmin" :
                user.role === "ADMIN" ? "/dashboard/admin" :
                  user.role === "STAFF" ? "/dashboard/staff" :
                    "/dashboard/customer"
            }>
              <Button size="sm">
                {user.role === "SUPERADMIN" ? "Portal Control" : "View Dashboard"} <User className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            className="relative z-50 text-gold-400 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen ? (
                <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X size={28} />
                </motion.span>
              ) : (
                <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu size={28} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute top-0 left-0 w-full h-screen bg-bg-surface/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link, i) => {
              const isActive = pathname === link.href;
              return (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, ease: "easeOut" }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "text-2xl font-heading uppercase tracking-widest transition-colors",
                      isActive ? "text-gold-400" : "text-text-secondary hover:text-gold-400"
                    )}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              );
            })}
            <div className="flex flex-col gap-4 mt-8 w-64">
              <Link href="/auth/login" className="w-full">
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
              <Link href="/auth/login" className="w-full">
                <Button className="w-full">Open Vault</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


