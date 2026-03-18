"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Loader2, CheckCircle2, AlertTriangle, MessageSquare } from "lucide-react";

interface AddGoldAdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  user: { id: string; name: string } | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function AddGoldAdvanceModal({ isOpen, onClose, onSuccess, user }: AddGoldAdvanceModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/gold-advances/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          amount: Number(amount),
          description: comment
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add gold advance");

      onSuccess(`Successfully added ₹${amount} gold advance for ${user.name}`);
      setAmount("");
      setComment("");
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-emerald-950 border border-gold-500/20 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gold-500/10 flex items-center justify-between bg-gold-500/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold-500/20 rounded-lg">
                <Wallet className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-white tracking-wide">
                  Add <span className="text-gold-400">Gold Advance</span>
                </h2>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">For: {user.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
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

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                Advance Amount (₹)
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500 font-bold text-lg">₹</div>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-emerald-1000 border border-gold-500/10 rounded-xl py-3.5 pl-10 pr-4 text-white text-lg font-bold focus:outline-none focus:border-gold-500/40 transition-all placeholder:text-gray-700"
                  placeholder="0.00"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-2">The amount will be added to the customer's total gold advance balance.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                Comment / Description
              </label>
              <div className="relative group">
                <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-gray-500 group-focus-within:text-gold-400 transition-colors" />
                <textarea
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-emerald-1000 border border-gold-500/10 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-gold-500/40 transition-all placeholder:text-gray-700 min-h-[100px] resize-none"
                  placeholder="Record the source or reason for this manual advance..."
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !amount || !comment}
                className="w-full bg-gold-500 hover:bg-gold-400 disabled:bg-gold-500/20 disabled:text-emerald-950/40 text-emerald-1000 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-lg shadow-gold-500/10"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> 
                    Confirm Gold Advance
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-gray-600 mt-4 italic">
                This action will create an ACTIVE gold advance and log a DEPOSIT transaction.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


