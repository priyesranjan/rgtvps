"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Lock, Mail, KeyRound, ShieldAlert, Zap,
  User, Briefcase, Settings, ShieldCheck, Smartphone,
  MessageSquare, Loader2, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.role === "CUSTOMER") router.push("/dashboard/customer");
        else if (user.role === "STAFF") router.push("/dashboard/staff");
        else if (user.role === "ADMIN") router.push("/dashboard/admin");
        else if (user.role === "SUPERADMIN") router.push("/dashboard/superadmin");
      } catch (e) {
        localStorage.clear();
      }
    }
  }, [router]);


  const handleSendOTP = async () => {
    if (!mobile) return setError("Please enter your mobile number");
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return setError("Please enter the 6-digit OTP");
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      // Save token and redirect
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard/customer");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      const role = data.user.role;
      if (role === "CUSTOMER") router.push("/dashboard/customer");
      else if (role === "STAFF") router.push("/dashboard/staff");
      else if (role === "ADMIN") router.push("/dashboard/admin");
      else if (role === "SUPERADMIN") router.push("/dashboard/superadmin");
      else router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold-500/10 rounded-full blur-[150px] pointer-events-none opacity-50" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[150px] pointer-events-none opacity-40" />

      <div className="absolute top-8 right-8 z-30">
        <ThemeToggle />
      </div>

      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-8 left-8 inline-flex items-center text-text-secondary hover:text-gold-400 transition-colors font-medium z-20 group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
        Return Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="absolute inset-0 bg-gold-gradient rounded-3xl blur-2xl opacity-10" />

        <div className="bg-bg-surface backdrop-blur-xl border border-gold-500/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="text-center mb-6 relative z-10">
            <div className="inline-flex items-center justify-center mb-6">
              <img
                src="/RoyalGoldTrader-Logo.png"
                alt="Royal Gold Trader Logo"
                className="w-24 h-24 object-contain"
              />
            </div>
            <h1 className="text-3xl font-heading font-bold text-text-primary tracking-wide">
              Login <span className="text-gradient-gold">Now</span>
            </h1>
            <p className="text-text-secondary mt-2 text-sm">Please sign in to access your account.</p>
          </div>

          {/* Login Method Tabs (Hidden for now) */}
          {/* 
          <div className="flex bg-bg-app/50 p-1 rounded-xl border border-gold-500/10 mb-6 relative z-10">
            <button
              onClick={() => { setLoginMethod("password"); setOtpSent(false); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${loginMethod === "password" ? "bg-gold-500 text-bg-app" : "text-text-secondary hover:text-text-primary"}`}
            >
              Password
            </button>
            <button
              onClick={() => { setLoginMethod("otp"); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${loginMethod === "otp" ? "bg-gold-500 text-bg-app" : "text-text-secondary hover:text-text-primary"}`}
            >
              OTP Secure
            </button>
          </div>
          */}


          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mb-6 flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {loginMethod === "password" ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary ml-1">Identity (Email or Mobile)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email or Mobile"
                      className="w-full bg-bg-app/50 border border-gold-500/20 focus:border-gold-500/60 text-text-primary rounded-xl py-3.5 pl-12 pr-4 outline-none transition-all placeholder:text-gray-600"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-medium text-text-secondary">Vault Password</label>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-bg-app/50 border border-gold-500/20 focus:border-gold-500/60 text-text-primary rounded-xl py-3.5 pl-12 pr-12 outline-none transition-all placeholder:text-gray-600"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-gold-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary ml-1">Registered Mobile Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="9988776655"
                      className="w-full bg-bg-app/50 border border-gold-500/20 focus:border-gold-500/60 text-text-primary rounded-xl py-3.5 pl-12 pr-4 outline-none transition-all placeholder:text-gray-600"
                      disabled={otpSent}
                      required
                    />
                  </div>
                </div>

                {otpSent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-xs font-medium text-text-secondary ml-1">6-Digit OTP</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full bg-bg-app/50 border border-gold-500/20 focus:border-gold-500/60 text-text-primary rounded-xl py-3.5 pl-12 pr-4 outline-none transition-all placeholder:text-gray-600 text-center tracking-[1em] font-bold"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[10px] text-text-secondary hover:text-gold-500 transition-colors ml-1"
                    >
                      Change mobile number?
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-4 text-lg mt-2 relative overflow-hidden group"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                <>
                  <span className="relative z-10">
                    Login
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-600">
              <ShieldCheck className="w-3 h-3 text-gold-500/50" />
              <span>Military-Grade Encryption (AES-256)</span>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}


