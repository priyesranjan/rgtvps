"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User, Mail, Shield, Wallet, Users, ArrowRightLeft, 
  CheckCircle2, AlertTriangle, Loader2, Calendar, Link as LinkIcon, Plus, History
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import AddGoldAdvanceModal from "./AddGoldAdvanceModal";
import UserTransactionHistoryModal from "./UserTransactionHistoryModal";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  allStaff: any[];
  onUpdate: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function UserDetailsModal({ isOpen, onClose, user, allStaff, onUpdate }: UserDetailsModalProps) {
  const [isReassigning, setIsReassigning] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(user?.staffId || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isAddAdvanceOpen, setIsAddAdvanceOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedStaffId(user.staffId || "");
      setMessage(null);
    }
  }, [user, isOpen]);

  const handleReassign = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/reassign-staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.id, staffId: selectedStaffId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reassign staff");

      setMessage({ type: "success", text: "Staff reassigned successfully" });
      onUpdate();
      setTimeout(() => setIsReassigning(false), 2000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && user && (
          <div key="user-details-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-bg-surface border border-gold-500/20 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-gold-500/10 flex items-center justify-between bg-bg-app/50 shrink-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 font-bold text-lg sm:text-xl overflow-hidden shrink-0">
                    {user.photo ? (
                      <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name?.[0] || '?'
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-heading font-bold text-text-primary tracking-wide truncate">{user.name}</h2>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest truncate">{user.role} · {user.id}</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors ml-2">
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="p-4 sm:p-8 grid md:grid-cols-2 gap-6 sm:gap-8 overflow-y-auto custom-scrollbar">
                {/* Left Column: Info */}
                <div className="space-y-6">
                  <section>
                    <h3 className="text-xs font-bold text-gold-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Basic Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <Mail className="w-4 h-4 text-gray-500" /> {user.email}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <Calendar className="w-4 h-4 text-gray-500" /> Joined {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      {user.dob && (
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                          <Calendar className="w-4 h-4 text-gold-500/50" /> Born {new Date(user.dob).toLocaleDateString()}
                        </div>
                      )}
                      {user.gender && (
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                          <div className="w-4 h-4 flex items-center justify-center text-[10px] bg-gold-500/10 rounded-full font-bold text-gold-500/50">G</div> {user.gender}
                        </div>
                      )}
                      {user.address && (
                        <div className="flex items-start gap-3 text-sm text-gray-300">
                          <div className="w-4 h-4 flex items-center justify-center text-[10px] bg-gold-500/10 rounded-full font-bold text-gold-500/50 mt-0.5">L</div> 
                          <p className="flex-1 leading-relaxed">{user.address}</p>
                        </div>
                      )}
                      {user.contactNo && (
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                          <div className="w-4 h-4 flex items-center justify-center text-[10px] bg-white/10 rounded-full font-bold text-gray-500">M</div> {user.contactNo}
                        </div>
                      )}
                      {user.aadharNo && (
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                          <div className="w-4 h-4 flex items-center justify-center text-[10px] bg-white/10 rounded-full font-bold text-gray-500">A</div> {user.aadharNo}
                        </div>
                      )}
                      {user.pan && (
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                          <div className="w-4 h-4 flex items-center justify-center text-[10px] bg-white/10 rounded-full font-bold text-gray-500">P</div> <span className="uppercase">{user.pan}</span>
                        </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold text-gold-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Wallet className="w-3.5 h-3.5" /> Financial Overview
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-1000/50 p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Total Gold Advance</p>
                        <p className="text-sm font-bold text-gold-400">{formatCurrency(user.totalGoldAdvanceAmount || 0)}</p>
                      </div>
                      <div className="bg-emerald-1000/50 p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Total Withdrawal</p>
                        <p className="text-sm font-bold text-red-400">{formatCurrency(user.totalLifetimeWithdrawal || 0)}</p>
                      </div>
                      <div className="bg-emerald-1000/50 p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Total Profit</p>
                        <p className="text-sm font-bold text-green-400">{formatCurrency(user.totalLifetimeProfit || 0)}</p>
                      </div>
                      <div className="bg-emerald-1000/50 p-3 rounded-xl border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Total Referral Profit</p>
                        <p className="text-sm font-bold text-blue-400">{formatCurrency(user.totalLifetimeReferralProfit || 0)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="bg-bg-app/30 p-2.5 rounded-lg border border-gold-500/5">
                        <p className="text-[9px] text-text-secondary uppercase font-bold mb-0.5">Current Advance Profit</p>
                        <p className="text-sm font-bold text-green-500/80">{formatCurrency(user.wallet?.profitAmount || 0)}</p>
                      </div>
                      <div className="bg-bg-app/30 p-2.5 rounded-lg border border-gold-500/5">
                        <p className="text-[9px] text-text-secondary uppercase font-bold mb-0.5">Current Referral Profit</p>
                        <p className="text-sm font-bold text-blue-500/80">{formatCurrency(user.wallet?.referralAmount || 0)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {user.role === "CUSTOMER" && (
                        <button 
                          onClick={() => setIsAddAdvanceOpen(true)}
                          className="flex-1 bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/20 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <Plus className="w-4 h-4" /> Gold Advance
                        </button>
                      )}
                      <button 
                        onClick={() => setIsHistoryOpen(true)}
                        className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <History className="w-4 h-4" /> History
                      </button>
                    </div>
                  </section>

                  {user.role === "CUSTOMER" && (
                    <section>
                      <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <LinkIcon className="w-3.5 h-3.5" /> Referral Source
                      </h3>
                      <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                        {user.referrer ? (
                          <div>
                            <p className="text-sm text-white font-medium">{user.referrer.name}</p>
                            <p className="text-xs text-gray-500">{user.referrer.email}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No referrer recorded (Direct Signup)</p>
                        )}
                      </div>
                    </section>
                  )}
                </div>

                {/* Right Column: Staff Management */}
                <div className="space-y-6">
                  {user.role === "CUSTOMER" && (
                    <section>
                      <h3 className="text-xs font-bold text-gold-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" /> Service Assignment
                      </h3>
                      
                      <div className="p-5 bg-bg-app/50 rounded-2xl border border-gold-500/10 relative overflow-hidden">
                        {!isReassigning ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-text-secondary uppercase font-bold mb-1">Current Staff</p>
                              <p className="text-sm text-text-primary font-medium">{user.assignedStaff?.name || "Unassigned"}</p>
                              <p className="text-xs text-text-secondary">{user.assignedStaff?.email || "N/A"}</p>
                            </div>
                            <button 
                              onClick={() => setIsReassigning(true)}
                              className="p-2 bg-gold-500/10 text-gold-400 rounded-lg hover:bg-gold-500/20 transition-all"
                            >
                              <ArrowRightLeft className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Change Staff Member</label>
                              <select
                                value={selectedStaffId}
                                onChange={(e) => setSelectedStaffId(e.target.value)}
                                className="w-full bg-bg-app border border-gold-500/20 rounded-xl py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-gold-500/50"
                              >
                                <option value="">Unassigned</option>
                                {allStaff.map(s => (
                                  <option key={s.id || s.email} value={s.id}>{s.name} ({s.email})</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={handleReassign}
                                disabled={loading}
                                className="flex-1 bg-gold-500 text-emerald-1000 font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                              >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                              </button>
                              <button 
                                onClick={() => setIsReassigning(false)}
                                className="flex-1 bg-white/5 text-gray-400 font-bold py-2 rounded-lg text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {message && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${message.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                          >
                            {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            {message.text}
                          </motion.div>
                        )}
                      </div>
                    </section>
                  )}

                  {user.role === "STAFF" && (
                    <section>
                      <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" /> Managed Portfolio
                      </h3>
                      <div className="bg-bg-app/50 p-6 rounded-2xl border border-gold-500/10 text-center">
                        <p className="text-3xl font-bold text-text-primary mb-2">{user.customers?.length || 0}</p>
                        <p className="text-xs text-text-secondary uppercase tracking-wider">Active Customers</p>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AddGoldAdvanceModal 
        isOpen={isAddAdvanceOpen}
        onClose={() => setIsAddAdvanceOpen(false)}
        user={user}
        onSuccess={() => {
          onUpdate();
          setIsAddAdvanceOpen(false);
        }}
      />

      <UserTransactionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        user={user}
        callerRole="ADMIN"
      />
    </>
  );
}


