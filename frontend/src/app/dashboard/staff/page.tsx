"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Users, TrendingUp, LogOut, Download, Settings, 
  LineChart, ShieldCheck, X, Menu, Wallet, Plus, Loader2, UserPlus, CheckCircle2, History, Eye, Sun, Moon, ArrowUpRight, User
} from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import UserRegistrationModal from "@/components/dashboard/UserRegistrationModal";
import UserProfileModal from "@/components/dashboard/UserProfileModal";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import UserTransactionHistoryModal from "@/components/dashboard/UserTransactionHistoryModal";
import RoleGuard from "@/components/auth/RoleGuard";
import ManualWithdrawalModal from "@/components/dashboard/ManualWithdrawalModal";
import ProfileTab from "@/components/dashboard/ProfileTab";
import GlobalSearch from "@/components/dashboard/GlobalSearch";
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
        className="bg-bg-surface border border-gold-500/20 rounded-3xl p-8 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-heading font-bold text-text-primary">Add Gold Advance</h2>
            <p className="text-text-secondary text-sm mt-1">Recording for {customer.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">Amount (₹)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 50000"
              className="w-full bg-bg-app border border-gold-500/20 focus:border-gold-500/50 text-text-primary rounded-xl py-3 px-4 outline-none transition-all" />
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
  const [coinIncentives, setCoinIncentives] = useState<any[]>([]);
  const [coinDatePreset, setCoinDatePreset] = useState("ALL");
  const [coinDateFrom, setCoinDateFrom] = useState("");
  const [coinDateTo, setCoinDateTo] = useState("");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [ordersIndex, setOrdersIndex] = useState<Record<string, any>>({});
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [historyCustomer, setHistoryCustomer] = useState<any>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawUser, setWithdrawUser] = useState<any>(null);
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

  const csvEscape = (value: any) => {
    const str = String(value ?? "");
    return `"${str.replace(/"/g, '""')}"`;
  };

  const handleExportCoinIncentivesCsv = () => {
    if (!coinIncentives.length) {
      showToast("No incentive rows available to export");
      return;
    }
    const headers = ["Transaction ID", "Customer", "Customer Email", "Order ID", "Amount", "Description", "Created At"];
    const rows = coinIncentives.map((tx) => [
      tx.id,
      tx.performedBy?.name || "",
      tx.performedBy?.email || "",
      tx.entityId || "",
      Number(tx.amount || 0),
      tx.description || "",
      new Date(tx.createdAt).toISOString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `staff-coin-incentives-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    showToast("Coin incentives CSV exported");
  };

  const openOrderDetails = async (orderId?: string) => {
    if (!orderId) {
      showToast("Order reference not available");
      return;
    }

    setIsOrderModalOpen(true);
    setIsOrderLoading(true);
    setSelectedOrder(null);

    try {
      if (ordersIndex[orderId]) {
        setSelectedOrder(ordersIndex[orderId]);
        return;
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/orders/admin/all`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load order list");

      const json = await res.json();
      const orders = json?.data?.orders || [];
      const nextIndex: Record<string, any> = {};
      for (const order of orders) {
        if (order?.id) nextIndex[order.id] = order;
      }
      setOrdersIndex((prev) => ({ ...prev, ...nextIndex }));
      setSelectedOrder(nextIndex[orderId] || null);
      if (!nextIndex[orderId]) showToast("Order details not found");
    } catch (err: any) {
      showToast(err.message || "Failed to load order details");
    } finally {
      setIsOrderLoading(false);
    }
  };

  const getOrderStatusClass = (status?: string) => {
    if (status === "DELIVERED") return "bg-green-500/10 text-green-500 dark:text-green-400";
    if (status === "READY") return "bg-blue-500/10 text-blue-500 dark:text-blue-400";
    if (status === "PAID") return "bg-purple-500/10 text-purple-500 dark:text-purple-400";
    if (status === "CANCELLED") return "bg-red-500/10 text-red-500 dark:text-red-400";
    return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
  };

  const getOrderTimelineSteps = (order: any) => {
    const statusRank: Record<string, number> = {
      PENDING: 0,
      PAID: 1,
      READY: 2,
      DELIVERED: 3,
      CANCELLED: 0,
    };
    const rank = statusRank[order?.status || "PENDING"] ?? 0;

    return [
      { key: "CREATED", label: "Created", time: order?.createdAt, reached: true },
      { key: "PAID", label: "Paid", time: order?.paidAt, reached: rank >= 1 || !!order?.paidAt },
      { key: "READY", label: "Ready", time: order?.readyAt, reached: rank >= 2 || !!order?.readyAt },
      { key: "DELIVERED", label: "Delivered", time: order?.deliveredAt, reached: rank >= 3 || !!order?.deliveredAt },
    ];
  };

  const copyOrderId = async () => {
    if (!selectedOrder?.id) return;
    try {
      await navigator.clipboard.writeText(selectedOrder.id);
      showToast("Order ID copied");
    } catch {
      showToast("Failed to copy Order ID");
    }
  };

  const jumpToTransactionsTab = () => {
    setActiveTab("Transactions");
    setIsOrderModalOpen(false);
    showToast("Opened transactions tab");
  };

  const applyCoinDatePreset = (preset: string) => {
    setCoinDatePreset(preset);
    if (preset === "ALL") {
      setCoinDateFrom("");
      setCoinDateTo("");
      return;
    }

    const today = new Date();
    const from = new Date(today);
    if (preset === "TODAY") {
      // Keep same day for both boundaries.
    } else if (preset === "7D") {
      from.setDate(today.getDate() - 6);
    } else if (preset === "30D") {
      from.setDate(today.getDate() - 29);
    }

    setCoinDateFrom(from.toISOString().slice(0, 10));
    setCoinDateTo(today.toISOString().slice(0, 10));
  };

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

  const fetchCoinIncentives = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const query = new URLSearchParams({ page: "1", limit: "100" });
      if (coinDateFrom) query.append("createdFrom", coinDateFrom);
      if (coinDateTo) query.append("createdTo", coinDateTo);
      const res = await fetch(`${API_BASE}/staff/incentives/coin-orders?${query.toString()}`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const json = await res.json();
        setCoinIncentives(json.data || json);
      }
    } catch (err) {
      console.error("Fetch coin incentives failed:", err);
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

  const fetchLeaderboard = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/staff/leaderboard`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const json = await res.json();
        setLeaderboard(json);
      }
    } catch (err) {
      console.error("Fetch leaderboard failed:", err);
    }
  };

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (!token || !userJson) return;
    const basicUser = JSON.parse(userJson);
    try {
      const res = await fetch(`${API_BASE}/users/${basicUser.id}`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const fullUser = await res.json();
        setCurrentUser(fullUser);
        localStorage.setItem("user", JSON.stringify(fullUser));
      }
    } catch (err) {
      console.error("Fetch current user failed:", err);
    }
  };

  const loadTabData = async (tab: string) => {
    if (tab === "Overview") {
      await Promise.all([fetchCustomers(), fetchEarnings(), fetchCoinIncentives(), fetchStaffStats(), fetchLeaderboard(), fetchCurrentUser()]);
    } else if (tab === "Customers") {
      await fetchCustomers();
    } else if (tab === "Transactions") {
      await fetchTransactions();
    } else if (tab === "Earnings") {
      await Promise.all([fetchEarnings(), fetchCoinIncentives(), fetchStaffStats()]);
    } else if (tab === "Profile") {
      await fetchCurrentUser();
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

  useEffect(() => {
    if (!isLoading && activeTab === "Earnings") {
      fetchCoinIncentives();
    }
  }, [isLoading, activeTab, coinDateFrom, coinDateTo]);

  const refetchCustomers = async () => {
    await loadTabData(activeTab);
  };

  const totalCommission = earnings.reduce((acc, curr) => acc + curr.amount, 0);
  const visibleCoinIncentiveTotal = coinIncentives.reduce((acc, tx) => acc + Number(tx.amount || 0), 0);

  const sidebarItems = [
    { id: "Overview", name: "Overview", icon: LineChart },
    { id: "Customers", name: "Customers", icon: Users },
    { id: "Transactions", name: "Transactions", icon: Wallet },
    { id: "Earnings", name: "Earnings", icon: TrendingUp },
    { id: "Profile", name: "Profile", icon: User },
  ];

  const userJson = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userJson ? JSON.parse(userJson) : null;

  const staffUser = {
    name: currentUser?.name || user?.name || "Staff Member",
    role: "STAFF",
    details: "Official Staff",
    icon: User,
    iconBg: "bg-blue-900/40",
    iconColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    photo: currentUser?.photo // If sidebar supports it, adding it here doesn't hurt
  };

  if (isLoading) return (
    <div className="min-h-screen bg-bg-app flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
    </div>
  );

  return (
    <RoleGuard allowedRoles={["STAFF"]}>
      <div className="min-h-screen bg-bg-app flex transition-all">
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
              <button className="lg:hidden text-text-secondary hover:text-text-primary p-1" onClick={() => setMobileSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-3xl font-heading font-bold text-text-primary tracking-wide">
                Staff <span className="text-blue-500 dark:text-blue-400">Dashboard</span>
              </h1>
            </div>

            <GlobalSearch 
              onSelectUser={(u) => {
                // If it's a customer, we can open the profile modal
                setSelectedCustomer(u);
              }}
              placeholder="Quick search customers..."
              className="flex-1 max-w-md hidden md:block"
            />

            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </header>

          <div className="grid md:grid-cols-4 gap-6 mb-10">
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/20 p-6 rounded-2xl shadow-lg ring-1 ring-blue-500/10">
              <p className="text-blue-400/80 text-xs font-bold uppercase tracking-widest mb-1">Total Customers</p>
              <h2 className="text-4xl font-black text-text-primary tracking-tight">{stats?.customersCount ?? customers.length}</h2>
            </div>
            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/10 border border-green-500/20 p-6 rounded-2xl shadow-lg ring-1 ring-green-500/10">
              <p className="text-green-400/80 text-xs font-bold uppercase tracking-widest mb-1">Total Commissions</p>
              <h2 className="text-4xl font-black text-green-500 dark:text-green-400 tracking-tight">{formatCurrency(stats?.totalCommission ?? totalCommission)}</h2>
            </div>
            <div className="bg-gradient-to-br from-purple-600/20 to-fuchsia-600/10 border border-purple-500/20 p-6 rounded-2xl shadow-lg ring-1 ring-purple-500/10">
              <p className="text-purple-400/80 text-xs font-bold uppercase tracking-widest mb-1">Coin Incentives</p>
              <h2 className="text-3xl font-black text-purple-400 tracking-tight">{formatCurrency(stats?.coinOrderIncentiveTotal ?? 0)}</h2>
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-1">{stats?.coinOrderIncentiveCount ?? 0} Orders</p>
            </div>
            <div className="bg-gradient-to-br from-gold-600/20 to-yellow-600/10 border border-gold-500/20 p-6 rounded-2xl shadow-lg ring-1 ring-gold-500/10">
              <p className="text-gold-400/80 text-xs font-bold uppercase tracking-widest mb-1">Role Status</p>
              <h2 className="text-2xl font-black text-gold-500 dark:text-gold-400 italic tracking-tight">Active Official</h2>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "Overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Recent Activity */}
                  <div className="bg-bg-surface/40 border border-gold-500/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                       <History className="w-5 h-5 text-blue-500 dark:text-blue-400" /> Recent Customer Activity
                    </h3>
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-app border border-gold-500/10 hover:border-blue-500/20 transition-all group">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${tx.type === "WITHDRAWAL" ? "bg-red-500/10 text-red-500 dark:text-red-400" : "bg-green-500/10 text-green-600 dark:text-green-400"}`}>
                              {tx.user?.name[0]}
                            </div>
                            <div>
                              <p className="text-sm text-text-primary font-medium group-hover:text-blue-500 transition-all">{tx.user?.name}</p>
                              <p className="text-[10px] text-text-secondary uppercase font-bold">{tx.type} · {formatCurrency(tx.amount)}</p>
                            </div>
                          </div>
                          <p className="text-[10px] text-text-secondary font-medium">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                      {transactions.length === 0 && (
                        <p className="text-sm text-gray-500 italic text-center py-10">No recent activity detected.</p>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-bg-surface/40 border border-gold-500/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                       <Plus className="w-5 h-5 text-blue-500 dark:text-blue-400" /> Staff Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setIsRegModalOpen(true)} className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-left flex flex-col gap-2 group">
                        <UserPlus className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                        <span className="text-sm font-bold text-text-primary">Enroll Customer</span>
                        <span className="text-[10px] text-text-secondary leading-tight">Create a new vault account for client.</span>
                      </button>
                      <button onClick={() => setActiveTab("Customers")} className="p-4 rounded-xl bg-bg-app border border-gold-500/5 hover:border-blue-500/20 transition-all text-left flex flex-col gap-2 group">
                        <Users className="w-6 h-6 text-text-secondary group-hover:text-blue-500 transition-all" />
                        <span className="text-sm font-bold text-text-primary">View Customers</span>
                        <span className="text-[10px] text-text-secondary leading-tight">Manage your assigned beneficiary list.</span>
                      </button>
                      <button onClick={() => setActiveTab("Transactions")} className="p-4 rounded-xl bg-bg-app border border-gold-500/5 hover:border-blue-500/20 transition-all text-left flex flex-col gap-2 group">
                        <Wallet className="w-6 h-6 text-text-secondary group-hover:text-blue-500 transition-all" />
                        <span className="text-sm font-bold text-text-primary">Audit Records</span>
                        <span className="text-[10px] text-text-secondary leading-tight">Download tax invoices for transactions.</span>
                      </button>
                      <button onClick={() => showToast("Staff manual coming soon...")} className="p-4 rounded-xl bg-bg-app border border-gold-500/5 hover:border-blue-500/20 transition-all text-left flex flex-col gap-2 group">
                        <History className="w-6 h-6 text-text-secondary group-hover:text-blue-500 transition-all" />
                        <span className="text-sm font-bold text-text-primary">Staff Guide</span>
                        <span className="text-[10px] text-text-secondary leading-tight">Operational handbook and SOPs.</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Commission Leaderboard */}
                <div className="bg-bg-surface/40 border border-gold-500/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-gold-500" /> Performance Leaderboard
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {leaderboard.map((staff, i) => {
                      const isCurrentUser = staff.id === user?.id;
                      const isLast = i === leaderboard.length - 1 && leaderboard.length > 1;
                      
                      return (
                        <div key={staff.id} 
                          className={`flex items-center justify-between p-4 rounded-xl transition-all relative group overflow-hidden 
                            ${isCurrentUser ? "bg-blue-glass ring-1 ring-blue-500/50 scale-[1.02] z-10" : 
                              isLast ? "bg-red-500/10 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : 
                              "bg-bg-app/40 border border-gold-500/10 hover:border-blue-500/30"}`}
                        >
                          {isCurrentUser && <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />}
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border 
                              ${i === 0 ? "bg-gold-500/20 border-gold-500 text-gold-500" : 
                                i === 1 ? "bg-gray-400/20 border-gray-400 text-gray-400" : 
                                i === 2 ? "bg-orange-600/20 border-orange-600 text-orange-600" : 
                                isLast ? "bg-red-500/20 border-red-500 text-red-500" :
                                "bg-bg-surface border-gold-500/20 text-text-secondary"}`}
                            >
                              {i + 1}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-gold-500/20 bg-bg-app flex items-center justify-center">
                                {staff.photo ? (
                                  <img src={staff.photo} alt={staff.name} className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-5 h-5 text-gold-500/40" />
                                )}
                              </div>
                              <div>
                                <p className={`text-sm font-bold flex items-center gap-2 ${isLast ? "text-red-400" : "text-text-primary"}`}>
                                  {staff.name}
                                  {isCurrentUser && <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">YOU</span>}
                                  {isLast && <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">DANGER</span>}
                                </p>
                                <p className="text-[10px] text-text-secondary">{staff.customersCount} active customers</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${isLast ? "text-red-400" : "text-gold-500"}`}>{formatCurrency(staff.totalCommission)}</p>
                            <p className="text-[9px] text-text-secondary uppercase font-bold tracking-widest">Commission</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {leaderboard.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-sm text-text-secondary italic">Calculating real-time rankings...</p>
                    </div>
                  )}
                </div>

                <div className="bg-bg-surface/10 border border-gold-500/5 rounded-2xl p-8 text-center">
                  <p className="text-text-secondary text-sm font-medium tracking-wide">Global Analytical Data visualizer integrated. Detailed charts active in Admin HQ.</p>
                </div>
              </motion.div>
            )}

            {activeTab === "Customers" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-text-primary">My Customers</h3>
                  <button onClick={() => setIsRegModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold transition-all transform active:scale-95">
                    <UserPlus className="w-4 h-4" /> Add Customer
                  </button>
                </div>
                <div className="bg-bg-surface/30 border border-gold-500/10 rounded-2xl overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-bg-app text-[10px] text-text-secondary uppercase tracking-widest font-bold border-b border-gold-500/10">
                        <th className="p-4">Customer</th>
                        <th className="p-4">Advance Amount</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/5">
                      {customers.map((c) => (
                        <tr key={c.id}>
                          <td className="p-4">
                            <p className="text-text-primary font-medium">{c.name}</p>
                            <p className="text-xs text-text-secondary">{c.email}</p>
                          </td>
                          <td className="p-4 text-blue-500 dark:text-blue-400 font-bold">
                            {formatCurrency(c.totalGoldAdvanceAmount || 0)}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setSelectedCustomer(c)} 
                                className="text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold uppercase tracking-wider">
                                <Plus className="w-3.5 h-3.5" /> Advance
                              </button>
                              <button onClick={() => { setWithdrawUser(c); setIsWithdrawModalOpen(true); }} 
                                className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold uppercase tracking-wider">
                                <ArrowUpRight className="w-3.5 h-3.5" /> Withdraw
                              </button>
                              <button onClick={() => { setHistoryCustomer(c); setIsHistoryOpen(true); }} 
                                className="text-xs bg-bg-app hover:bg-bg-surface text-text-secondary border border-gold-500/10 p-1.5 rounded-lg transition-all" title="View History">
                                <History className="w-4 h-4" />
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
                  <h3 className="text-xl font-bold text-text-primary">Customer Transactions</h3>
                </div>
                <div className="bg-bg-surface/30 border border-gold-500/10 rounded-2xl overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-bg-app text-[10px] text-text-secondary uppercase tracking-widest font-bold border-b border-gold-500/10">
                        <th className="p-4">Customer</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Description</th>
                        <th className="p-4">Processed By</th>
                        <th className="p-4 text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/5">
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="p-4">
                            <p className="text-text-primary font-medium">{tx.user?.name}</p>
                            <p className="text-[10px] text-text-secondary">{tx.user?.email}</p>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${tx.type === "WITHDRAWAL" ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-green-500/10 text-green-600 dark:text-green-400"}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className={`p-4 font-bold ${tx.type === "WITHDRAWAL" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                            {tx.type === "WITHDRAWAL" ? "-" : "+"}{formatCurrency(tx.amount)}
                          </td>
                          <td className="p-4 text-text-secondary text-xs italic max-w-[150px] truncate">
                            {tx.description || "-"}
                          </td>
                          <td className="p-4">
                            <p className="text-text-primary text-xs font-bold">{tx.performedBy?.name || "SYSTEM"}</p>
                            <p className="text-[10px] text-text-secondary italic">{new Date(tx.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="p-4 text-right">
                            {["GOLD_ADVANCE", "WITHDRAWAL", "DEPOSIT"].includes(tx.type) && (
                              <button onClick={() => handleDownload(tx)} title="Download Receipt" className="p-2 text-blue-400 hover:text-blue-300 hover:scale-110 transition-all inline-flex">
                                <Download className="w-4 h-4" />
                              </button>
                            )}
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
                <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-4 mb-5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "ALL", label: "All Time" },
                        { id: "TODAY", label: "Today" },
                        { id: "7D", label: "Last 7 Days" },
                        { id: "30D", label: "Last 30 Days" }
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => applyCoinDatePreset(preset.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${coinDatePreset === preset.id ? "bg-purple-500 text-white" : "bg-bg-app text-text-secondary border border-gold-500/10 hover:text-text-primary"}`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <input
                        type="date"
                        value={coinDateFrom}
                        onChange={(e) => {
                          setCoinDatePreset("CUSTOM");
                          setCoinDateFrom(e.target.value);
                        }}
                        className="bg-bg-app border border-gold-500/10 rounded-lg px-3 py-1.5 text-xs text-text-primary"
                      />
                      <span className="text-[10px] text-text-secondary text-center">to</span>
                      <input
                        type="date"
                        value={coinDateTo}
                        onChange={(e) => {
                          setCoinDatePreset("CUSTOM");
                          setCoinDateTo(e.target.value);
                        }}
                        className="bg-bg-app border border-gold-500/10 rounded-lg px-3 py-1.5 text-xs text-text-primary"
                      />
                      <button
                        onClick={() => applyCoinDatePreset("ALL")}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-bg-app border border-gold-500/10 text-text-secondary hover:text-text-primary transition-all"
                      >
                        Clear Range
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-4">
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-2">Coin Incentive Total (Visible)</p>
                    <p className="text-2xl font-black text-purple-500 dark:text-purple-400">{formatCurrency(visibleCoinIncentiveTotal)}</p>
                  </div>
                  <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-4">
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mb-2">Coin Incentive Orders (Visible)</p>
                    <p className="text-2xl font-black text-text-primary">{coinIncentives.length}</p>
                  </div>
                </div>

                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleExportCoinIncentivesCsv}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gold-500/20 text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-gold-500/10 transition-all"
                  >
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>

                <div className="bg-bg-surface/30 border border-gold-500/10 rounded-2xl overflow-x-auto mb-5">
                  <div className="px-4 py-3 border-b border-gold-500/10 bg-bg-app/40">
                    <h4 className="text-sm font-bold text-text-primary">Coin Incentive Credits</h4>
                  </div>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-bg-app text-xs text-text-secondary uppercase tracking-wider">
                        <th className="p-4">Customer</th>
                        <th className="p-4">Order Ref</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/5">
                      {coinIncentives.map((tx) => (
                        <tr key={tx.id}>
                          <td className="p-4">
                            <p className="text-text-primary text-sm font-medium">{tx.performedBy?.name || "Customer"}</p>
                            <p className="text-[10px] text-text-secondary">{tx.performedBy?.email || "-"}</p>
                          </td>
                          <td className="p-4 text-text-secondary text-xs font-mono">
                            {tx.entityId ? (
                              <button
                                onClick={() => openOrderDetails(tx.entityId)}
                                className="text-blue-500 hover:text-blue-400 underline underline-offset-2"
                              >
                                {tx.entityId}
                              </button>
                            ) : "-"}
                          </td>
                          <td className="p-4 text-purple-500 dark:text-purple-400 font-bold">+{formatCurrency(tx.amount)}</td>
                          <td className="p-4 text-right text-text-secondary text-sm">{new Date(tx.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {coinIncentives.length === 0 && (
                        <tr><td colSpan={4} className="p-10 text-center text-gray-500">No coin incentive credits yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="bg-emerald-950/30 border border-gold-500/10 rounded-2xl overflow-x-auto">
                  <div className="px-4 py-3 border-b border-gold-500/10 bg-bg-app/40">
                    <h4 className="text-sm font-bold text-text-primary">All Commission Earnings</h4>
                  </div>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-bg-app text-xs text-text-secondary uppercase tracking-wider">
                        <th className="p-4">Source</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/5">
                      {earnings.map((e) => (
                        <tr key={e.id}>
                          <td className="p-4 text-text-primary text-sm">Daily Commission</td>
                          <td className="p-4 text-green-600 dark:text-green-400 font-bold">{formatCurrency(e.amount)}</td>
                          <td className="p-4 text-right text-text-secondary text-sm">{new Date(e.createdAt).toLocaleDateString()}</td>
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
            {activeTab === "Profile" && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <ProfileTab 
                  user={currentUser || user} 
                  onUpdateSuccess={(updated) => {
                    setCurrentUser(updated);
                    localStorage.setItem("user", JSON.stringify({ ...user, ...updated }));
                    showToast("Profile updated successfully!");
                  }} 
                />
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

        <ManualWithdrawalModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          user={withdrawUser}
          onSuccess={(msg) => { showToast(msg); refetchCustomers(); }}
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
              className="fixed bottom-6 right-6 z-50 bg-bg-surface border border-gold-500/20 text-text-primary px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <span className="text-sm font-medium">{toast}</span>
              <button onClick={() => setToast(null)}><X className="w-4 h-4 text-text-secondary hover:text-text-primary" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOrderModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-5"
              onClick={() => setIsOrderModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 12 }}
                className="w-full max-w-xl bg-bg-surface border border-gold-500/20 rounded-2xl p-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-text-primary">Order Details</h3>
                  <button onClick={() => setIsOrderModalOpen(false)} className="text-text-secondary hover:text-text-primary"><X className="w-4 h-4" /></button>
                </div>
                {isOrderLoading ? (
                  <div className="py-10 flex items-center justify-center text-text-secondary">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading order...
                  </div>
                ) : selectedOrder ? (
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="bg-bg-app rounded-lg p-3 border border-gold-500/10">
                        <p className="text-text-secondary text-xs mb-1">Order ID</p>
                        <p className="text-text-primary font-mono break-all mb-2">{selectedOrder.id}</p>
                        <button onClick={copyOrderId} className="px-2 py-1 rounded-md border border-gold-500/20 text-xs text-text-secondary hover:text-text-primary hover:bg-gold-500/10 transition-all">
                          Copy Order ID
                        </button>
                      </div>
                      <div className="bg-bg-app rounded-lg p-3 border border-gold-500/10">
                        <p className="text-text-secondary text-xs mb-1">Status</p>
                        <span className={`inline-flex px-2 py-1 text-xs rounded font-bold uppercase tracking-wider ${getOrderStatusClass(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="bg-bg-app rounded-lg p-3 border border-gold-500/10"><p className="text-text-secondary text-xs mb-1">Customer</p><p className="text-text-primary">{selectedOrder.user?.name || "-"}</p></div>
                      <div className="bg-bg-app rounded-lg p-3 border border-gold-500/10"><p className="text-text-secondary text-xs mb-1">Product</p><p className="text-text-primary">{selectedOrder.product?.name || "-"}</p></div>
                      <div className="bg-bg-app rounded-lg p-3 border border-gold-500/10"><p className="text-text-secondary text-xs mb-1">Quantity</p><p className="text-text-primary">{selectedOrder.quantity || 0}</p></div>
                      <div className="bg-bg-app rounded-lg p-3 border border-gold-500/10"><p className="text-text-secondary text-xs mb-1">Total</p><p className="text-text-primary font-semibold">{formatCurrency(selectedOrder.total || 0)}</p></div>
                      <div className="bg-bg-app rounded-lg p-3 border border-gold-500/10"><p className="text-text-secondary text-xs mb-1">Created</p><p className="text-text-primary">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "-"}</p></div>
                      <div className="bg-bg-app rounded-lg p-3 border border-gold-500/10"><p className="text-text-secondary text-xs mb-1">Expected Delivery</p><p className="text-text-primary">{selectedOrder.expectedDeliveryDate ? new Date(selectedOrder.expectedDeliveryDate).toLocaleString() : "-"}</p></div>
                    </div>

                    <div className="mt-4 bg-bg-app rounded-lg p-4 border border-gold-500/10">
                      <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">Order Timeline</p>
                      <div className="sm:hidden grid grid-cols-1 gap-2">
                        {getOrderTimelineSteps(selectedOrder).map((step, idx) => (
                          <motion.div
                            key={step.key}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: idx * 0.05 }}
                            className={`rounded-lg p-2 border ${step.reached ? "border-green-500/30 bg-green-500/5" : "border-gold-500/10 bg-bg-surface/40"}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${step.reached ? "bg-green-500/20 text-green-500" : "bg-bg-surface text-text-secondary border border-gold-500/10"}`}>
                                {idx + 1}
                              </span>
                              <p className={`text-[10px] uppercase tracking-wider font-bold ${step.reached ? "text-green-500" : "text-text-secondary"}`}>{step.label}</p>
                            </div>
                            <p className="text-[11px] text-text-primary mt-1 ml-7">
                              {step.time ? new Date(step.time).toLocaleString() : "Pending"}
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      <div className="hidden sm:flex items-start">
                        {getOrderTimelineSteps(selectedOrder).map((step, idx, arr) => (
                          <div key={step.key} className="flex items-start flex-1">
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.22, delay: idx * 0.06 }}
                              className={`rounded-lg p-2 border w-full min-h-[72px] ${step.reached ? "border-green-500/30 bg-green-500/5" : "border-gold-500/10 bg-bg-surface/40"}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${step.reached ? "bg-green-500/20 text-green-500" : "bg-bg-surface text-text-secondary border border-gold-500/10"}`}>
                                  {idx + 1}
                                </span>
                                <p className={`text-[10px] uppercase tracking-wider font-bold ${step.reached ? "text-green-500" : "text-text-secondary"}`}>{step.label}</p>
                              </div>
                              <p className="text-[11px] text-text-primary mt-1 ml-7">
                                {step.time ? new Date(step.time).toLocaleString() : "Pending"}
                              </p>
                            </motion.div>
                            {idx < arr.length - 1 && (
                              <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.2, delay: idx * 0.06 + 0.1 }}
                                className={`h-[2px] mt-5 mx-2 flex-1 origin-left ${step.reached ? "bg-green-500/40" : "bg-gold-500/10"}`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary py-6 text-center">Order information unavailable.</p>
                )}
                {!isOrderLoading && (
                  <div className="mt-5 pt-4 border-t border-gold-500/10 flex justify-end gap-2">
                    <button
                      onClick={() => setIsOrderModalOpen(false)}
                      className="px-3 py-2 rounded-lg border border-gold-500/20 text-xs font-bold text-text-secondary hover:text-text-primary transition-all"
                    >
                      Close
                    </button>
                    <button
                      onClick={jumpToTransactionsTab}
                      className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold transition-all"
                    >
                      Open Full Transaction List
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </RoleGuard>
  );
}


