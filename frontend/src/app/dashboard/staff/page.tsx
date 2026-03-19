"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Users, TrendingUp, LogOut, Download, Settings, 
  LineChart, ShieldCheck, X, Menu, Wallet, Plus, Loader2, UserPlus, CheckCircle2, History, Eye
} from "lucide-react";
import UserRegistrationModal from "@/components/dashboard/UserRegistrationModal";
import UserProfileModal from "@/components/dashboard/UserProfileModal";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import UserTransactionHistoryModal from "@/components/dashboard/UserTransactionHistoryModal";
import RoleGuard from "@/components/auth/RoleGuard";
import { formatCurrency } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/* ─── Gold Advance Modal ─── */
function GoldAdvanceModal({ onClose, onSuccess, customer }: { onClose: () => void; onSuccess: (m: string) => void; customer: any }) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/gold-advances/admin/create`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: customer.id, amount: Number(amount), description: "Staff recorded gold advance" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add gold advance");
      onSuccess(`Gold Advance of ${formatCurrency(Number(amount))} added for ${customer.name}`);
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        className="bg-emerald-950 border border-blue-500/20 rounded-3xl p-8 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-heading font-bold text-white">Add Gold Advance</h2>
            <p className="text-gray-400 text-sm mt-1">Recording for {customer.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Amount (₹)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 50000"
              className="w-full bg-emerald-1000/50 border border-blue-500/20 focus:border-blue-500/50 text-white rounded-xl py-3 px-4 outline-none transition-all" />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!amount || isLoading}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-all flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Gold Advance"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function StaffDashboardPage() {
  /* ─── Real Data State ─── */
  const [activeTab, setActiveTab] = useState("Overview");
  const [customers, setCustomers] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [historyCustomer, setHistoryCustomer] = useState<any>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  const handleDownload = async (tx: any) => {
    const isWithdrawal = tx.type === "WITHDRAWAL";
    const typeLabel = isWithdrawal ? "voucher" : "invoice";
    showToast(`Generating ${typeLabel}...`);
    try {
      const token = localStorage.getItem("token");
      let url = "";
      if (isWithdrawal) {
        const withdrawalId = tx.entityId || tx.id;
        url = `${API_BASE}/withdrawals/${withdrawalId}/invoice`;
      } else {
        const match = tx.description?.match(/#([a-z0-9-]+)/i);
        const advanceId = tx.entityId || (match ? match[1] : (tx.type === "GOLD_ADVANCE" ? tx.id : null));
        if (!advanceId) throw new Error("Could not determine Gold Advance reference.");
        url = `${API_BASE}/gold-advances/${advanceId}/invoice`;
      }

      const res = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} generation failed.`);
      const html = await res.text();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); }, 500);
      }
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const fetchCustomers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/staff/customers`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const json = await res.json();
        setCustomers(json.data || json);
      }
    } catch (err) {
      console.error("Fetch customers failed:", err);
    }
  };

  const fetchEarnings = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/staff/earnings`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const json = await res.json();
        setEarnings(json.data || json);
      }
    } catch (err) {
      console.error("Fetch earnings failed:", err);
    }
  };

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/staff/transactions`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const json = await res.json();
        setTransactions(json.data || json);
      }
    } catch (err) {
      console.error("Fetch transactions failed:", err);
    }
  };

  const fetchStaffStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/staff/stats`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const json = await res.json();
        setStats(json);
      }
    } catch (err) {
      console.error("Fetch staff stats failed:", err);
    }
  };

  const loadTabData = async (tab: string) => {
    if (tab === "Overview") {
      await Promise.all([fetchCustomers(), fetchEarnings(), fetchStaffStats()]);
    } else if (tab === "Customers") {
      await fetchCustomers();
    } else if (tab === "Transactions") {
      await fetchTransactions();
    } else if (tab === "Earnings") {
      await Promise.all([fetchEarnings(), fetchStaffStats()]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadTabData(activeTab);
      setIsLoading(false);
    };
    init();
  }, [router]);

  useEffect(() => {
    if (!isLoading) {
      loadTabData(activeTab);
    }
  }, [activeTab]);

  const refetchCustomers = async () => {
    await loadTabData(activeTab);
  };

  const totalCommission = earnings.reduce((acc, curr) => acc + curr.amount, 0);

  const sidebarItems = [
    { id: "Overview", name: "Overview", icon: LineChart },
    { id: "Customers", name: "Customers", icon: Users },
    { id: "Transactions", name: "Transactions", icon: Wallet },
    { id: "Earnings", name: "Earnings", icon: TrendingUp },
  ];

  const userJson = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userJson ? JSON.parse(userJson) : null;

  const staffUser = {
    name: user?.name || "Staff Member",
    role: "STAFF",
    details: "Official Staff",
    icon: Users,
    iconBg: "bg-blue-900/40",
    iconColor: "text-blue-400",
    borderColor: "border-blue-500/30"
  };

  if (isLoading) return (
    <div className="min-h-screen bg-emerald-1000 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
    </div>
  );

  return (
    <RoleGuard allowedRoles={["STAFF"]}>
      <div className="min-h-screen bg-emerald-1000 flex transition-all">
        <DashboardSidebar
          items={sidebarItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={staffUser}
          onLogout={() => { localStorage.clear(); router.push("/auth/login"); }}
          isMobileOpen={mobileSidebarOpen}
          setIsMobileOpen={setMobileSidebarOpen}
          roleLabel="Staff"
          accentColor="blue"
        />

        <main className="flex-1 p-6 lg:p-10 relative overflow-y-auto h-screen custom-scrollbar">
          <header className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <button className="lg:hidden text-gray-400 hover:text-white p-1" onClick={() => setMobileSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-3xl font-heading font-bold text-white tracking-wide">
                Staff <span className="text-blue-400">Dashboard</span>
              </h1>
            </div>
          </header>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-emerald-950/40 border border-blue-500/20 p-6 rounded-2xl">
              <p className="text-gray-400 text-sm mb-1">Total Customers</p>
              <h2 className="text-3xl font-bold text-white">{stats?.customersCount ?? customers.length}</h2>
            </div>
            <div className="bg-emerald-950/40 border border-green-500/20 p-6 rounded-2xl">
              <p className="text-gray-400 text-sm mb-1">Total Commissions</p>
              <h2 className="text-3xl font-bold text-green-400">{formatCurrency(stats?.totalCommission ?? totalCommission)}</h2>
            </div>
            <div className="bg-emerald-950/40 border border-gold-500/20 p-6 rounded-2xl">
              <p className="text-gray-400 text-sm mb-1">Role Status</p>
              <h2 className="text-2xl font-bold text-gold-400 italic">Active Official</h2>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "Overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Recent Activity */}
                  <div className="bg-emerald-950/40 border border-blue-500/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                       <History className="w-5 h-5 text-blue-400" /> Recent Customer Activity
                    </h3>
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/20 transition-all group">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${tx.type === "WITHDRAWAL" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                              {tx.user?.name[0]}
                            </div>
                            <div>
                              <p className="text-sm text-white font-medium group-hover:text-blue-400 transition-all">{tx.user?.name}</p>
                              <p className="text-[10px] text-gray-500 uppercase font-bold">{tx.type} · {formatCurrency(tx.amount)}</p>
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-600 font-medium">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                      {transactions.length === 0 && (
                        <p className="text-sm text-gray-500 italic text-center py-10">No recent activity detected.</p>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-emerald-950/40 border border-blue-500/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                       <Plus className="w-5 h-5 text-blue-400" /> Staff Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setIsRegModalOpen(true)} className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-left flex flex-col gap-2 group">
                        <UserPlus className="w-6 h-6 text-blue-400" />
                        <span className="text-sm font-bold text-white">Enroll Customer</span>
                        <span className="text-[10px] text-gray-400 leading-tight">Create a new vault account for client.</span>
                      </button>
                      <button onClick={() => setActiveTab("Customers")} className="p-4 rounded-xl bg-emerald-900/40 border border-white/5 hover:border-blue-500/20 transition-all text-left flex flex-col gap-2 group">
                        <Users className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-all" />
                        <span className="text-sm font-bold text-white">View Customers</span>
                        <span className="text-[10px] text-gray-400 leading-tight">Manage your assigned beneficiary list.</span>
                      </button>
                      <button onClick={() => setActiveTab("Transactions")} className="p-4 rounded-xl bg-emerald-900/40 border border-white/5 hover:border-blue-500/20 transition-all text-left flex flex-col gap-2 group">
                        <Wallet className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-all" />
                        <span className="text-sm font-bold text-white">Audit Records</span>
                        <span className="text-[10px] text-gray-400 leading-tight">Download tax invoices for transactions.</span>
                      </button>
                      <button onClick={() => showToast("Staff manual coming soon...")} className="p-4 rounded-xl bg-emerald-900/40 border border-white/5 hover:border-blue-500/20 transition-all text-left flex flex-col gap-2 group">
                        <History className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-all" />
                        <span className="text-sm font-bold text-white">Staff Guide</span>
                        <span className="text-[10px] text-gray-400 leading-tight">Operational handbook and SOPs.</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-950/10 border border-white/5 rounded-2xl p-8 text-center">
                  <p className="text-gray-600 text-sm font-medium tracking-wide">Global Analytical Data visualizer integrated. Detailed charts active in Admin HQ.</p>
                </div>
              </motion.div>
            )}

            {activeTab === "Customers" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">My Customers</h3>
                  <button onClick={() => setIsRegModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold transition-all transform active:scale-95">
                    <UserPlus className="w-4 h-4" /> Add Customer
                  </button>
                </div>
                <div className="bg-emerald-950/30 border border-gold-500/10 rounded-2xl overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-emerald-1000 text-xs text-gray-400 uppercase tracking-wider">
                        <th className="p-4">Customer</th>
                        <th className="p-4">Advance Amount</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {customers.map((c) => (
                        <tr key={c.id}>
                          <td className="p-4">
                            <p className="text-white font-medium">{c.name}</p>
                            <p className="text-xs text-gray-500">{c.email}</p>
                          </td>
                          <td className="p-4 text-blue-400 font-bold">
                            {formatCurrency(c.totalGoldAdvanceAmount || 0)}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setSelectedCustomer(c)} 
                                className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2">
                                <Plus className="w-3.5 h-3.5" /> Advance
                              </button>
                              <button onClick={() => { setHistoryCustomer(c); setIsHistoryOpen(true); }} 
                                className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 p-1.5 rounded-lg transition-all">
                                <History className="w-4 h-4" />
                              </button>
                              <button onClick={() => { setProfileUser(c); setIsProfileModalOpen(true); }} 
                                className="text-xs bg-emerald-900 hover:bg-emerald-800 text-gray-400 border border-white/10 p-1.5 rounded-lg transition-all">
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "Transactions" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Customer Transactions</h3>
                </div>
                <div className="bg-emerald-950/30 border border-gold-500/10 rounded-2xl overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-emerald-1000 text-xs text-gray-400 uppercase tracking-wider">
                        <th className="p-4">Customer</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Processed By</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="p-4">
                            <p className="text-white font-medium">{tx.user?.name}</p>
                            <p className="text-[10px] text-gray-500">{tx.user?.email}</p>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${tx.type === "WITHDRAWAL" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className={`p-4 font-bold ${tx.type === "WITHDRAWAL" ? "text-red-400" : "text-green-400"}`}>
                            {tx.type === "WITHDRAWAL" ? "-" : "+"}{formatCurrency(tx.amount)}
                          </td>
                          <td className="p-4 text-gray-400 text-xs">
                            {tx.performedBy?.name || "SYSTEM"}
                          </td>
                          <td className="p-4 text-gray-400 text-sm">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => handleDownload(tx)} title="Download Receipt" className="p-2 text-blue-400 hover:text-blue-300 hover:scale-110 transition-all inline-flex">
                              <Download className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr><td colSpan={4} className="p-10 text-center text-gray-500 italic">No customer transactions found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "Earnings" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-emerald-950/30 border border-gold-500/10 rounded-2xl overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-emerald-950/50 text-xs text-gray-400 uppercase">
                        <th className="p-4">Source</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {earnings.map((e) => (
                        <tr key={e.id}>
                          <td className="p-4 text-white text-sm">Daily Commission</td>
                          <td className="p-4 text-green-400 font-bold">{formatCurrency(e.amount)}</td>
                          <td className="p-4 text-right text-gray-400 text-sm">{new Date(e.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {earnings.length === 0 && (
                        <tr><td colSpan={3} className="p-10 text-center text-gray-500">No earnings logged yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Registration Modal */}
        <UserRegistrationModal 
          isOpen={isRegModalOpen} 
          onClose={() => setIsRegModalOpen(false)} 
          onSuccess={(msg) => { showToast(msg); refetchCustomers(); }}
          callerRole="STAFF"
        />

        <UserTransactionHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          user={historyCustomer}
          callerRole="STAFF"
        />

        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={profileUser}
          onUpdate={() => { refetchCustomers(); }}
          callerRole="STAFF"
        />

        {/* Toasts & Modals */}
        <AnimatePresence>
          {selectedCustomer && (
            <GoldAdvanceModal 
              customer={selectedCustomer} 
              onClose={() => setSelectedCustomer(null)} 
              onSuccess={(msg) => { showToast(msg); refetchCustomers(); }} 
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-blue-500/30 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
              <span className="text-sm font-medium">{toast}</span>
              <button onClick={() => setToast(null)}><X className="w-4 h-4 text-gray-500 hover:text-white" /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </RoleGuard>
  );
}


