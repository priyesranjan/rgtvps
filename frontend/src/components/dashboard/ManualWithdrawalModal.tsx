"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertTriangle, MessageSquare, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { User as UserType } from "@/types/dashboard";

interface ManualWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  user: UserType | null;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

type WithdrawalSource = "PROFIT" | "REFERRAL" | "GOLD_ADVANCE";

export default function ManualWithdrawalModal({ isOpen, onClose, onSuccess, user }: ManualWithdrawalModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [source, setSource] = useState<WithdrawalSource>("PROFIT");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/withdrawals/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          amount: Number(amount),
          source,
          description
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit withdrawal request");

      onSuccess(`Successfully submitted ₹${amount} withdrawal request for ${user.name}`);
      setAmount("");
      setSource("PROFIT");
      setDescription("");
      onClose();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const currentAvailable = source === "PROFIT" 
    ? (user.wallet?.profitAmount || 0) 
    : source === "REFERRAL" 
      ? (user.wallet?.referralAmount || 0) 
      : (user.wallet?.goldAdvanceAmount || 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-bg-surface border border-gold-500/20 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gold-500/10 flex items-center justify-between bg-red-500/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-text-primary tracking-wide">
                  Request <span className="text-red-500">Withdrawal</span>
                </h2>
                <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">For: {user.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {(["PROFIT", "REFERRAL", "GOLD_ADVANCE"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSource(s)}
                  className={`py-2 px-1 rounded-lg text-[10px] font-bold border transition-all ${
                    source === s 
                      ? "bg-gold-500/20 border-gold-500/50 text-gold-400" 
                      : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Withdrawal Amount (₹)
                </label>
                <p className="text-[10px] text-gold-500/70 font-bold">
                  Available: {formatCurrency(currentAvailable)}
                </p>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 font-bold text-lg">₹</div>
                <input
                  type="number"
                  required
                  min="1"
                  max={currentAvailable}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-bg-app border border-gold-500/10 rounded-xl py-3.5 pl-10 pr-4 text-text-primary text-lg font-bold focus:outline-none focus:border-red-500/40 transition-all placeholder:text-text-secondary/30"
                  placeholder="0.00"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-2">Request will be sent to Admin for approval.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                Description
              </label>
              <div className="relative group">
                <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-text-secondary group-focus-within:text-gold-500 transition-colors" />
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-bg-app border border-gold-500/10 rounded-xl py-3.5 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:border-gold-500/40 transition-all placeholder:text-text-secondary/30 min-h-[80px] resize-none"
                  placeholder="Reason for withdrawal (e.g. Hospitalization, Festive, etc.)"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !amount || !description || Number(amount) > currentAvailable}
                className="w-full bg-red-500 hover:bg-red-400 disabled:bg-red-500/20 disabled:text-text-secondary/40 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-lg shadow-red-500/10"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ArrowUpRight className="w-5 h-5" /> 
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
