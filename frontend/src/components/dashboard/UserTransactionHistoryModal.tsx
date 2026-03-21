"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ArrowLeftRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface UserTransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  callerRole: "ADMIN" | "STAFF";
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function UserTransactionHistoryModal({ isOpen, onClose, user, callerRole }: UserTransactionHistoryModalProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      const fetchTransactions = async () => {
        setIsLoading(true);
        try {
          const token = localStorage.getItem("token");
          const endpoint = callerRole === "ADMIN" 
            ? `${API_BASE}/admin/transactions/${user.id}`
            : `${API_BASE}/staff/transactions/${user.id}`;
          
          const res = await fetch(endpoint, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            setTransactions(await res.json());
          }
        } catch (err) {
          console.error("Failed to fetch user transactions:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTransactions();
    }
  }, [isOpen, user, callerRole]);

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-bg-surface border border-gold-500/20 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gold-500/10 flex items-center justify-between bg-bg-app/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-text-primary tracking-wide">Transaction History</h2>
                <p className="text-xs text-text-secondary uppercase tracking-widest">{user.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
            {isLoading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
                <p className="text-sm">Loading transactions...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-bg-app text-[10px] text-text-secondary uppercase tracking-wider border-b border-gold-500/10">
                  <tr>
                    <th className="p-4 font-bold">Type</th>
                    <th className="p-4 font-bold">Amount</th>
                    <th className="p-4 font-bold">Description</th>
                    <th className="p-4 font-bold">Processed By</th>
                    <th className="p-4 text-right font-bold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                          tx.type === "WITHDRAWAL" ? "bg-red-500/10 text-red-400 border border-red-500/20" : 
                          tx.type === "GOLD_ADVANCE" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          "bg-green-500/10 text-green-400 border border-green-500/20"
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`p-4 text-sm font-bold ${tx.type === "WITHDRAWAL" ? "text-red-400" : "text-green-400"}`}>
                         {tx.type === "WITHDRAWAL" ? "-" : "+"}{formatCurrency(tx.amount)}
                      </td>
                      <td className="p-4 text-xs text-gray-400 leading-relaxed italic max-w-[200px] truncate">
                        {tx.description || "N/A"}
                      </td>
                      <td className="p-4 text-[10px] text-gray-500">
                        {tx.performedBy?.name || "SYSTEM"}
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-xs text-text-primary font-medium">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        <p className="text-[10px] text-text-secondary">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-20 text-center text-gray-500 italic text-sm">
                        No transactions found for this user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-bg-app/50 border-t border-gold-500/10 flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold transition-all"
            >
              Close History
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


