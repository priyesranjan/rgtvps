"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck, Shield, Users, Building, Activity, Settings, LogOut,
  Download, AlertTriangle, CheckCircle2, X, Menu, Bell,
  TrendingUp, Eye, Lock, Unlock, Search, RefreshCw, Crown, Wallet, Loader2, UserPlus, History
} from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";
import { formatCurrency } from "@/lib/utils";
import ProfileTab from "@/components/dashboard/ProfileTab";
import { User } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { downloadInvoicePDF } from "@/lib/downloadInvoice";
import UserRegistrationModal from "@/components/dashboard/UserRegistrationModal";
import UserDetailsModal from "@/components/dashboard/UserDetailsModal";
import UserProfileModal from "@/components/dashboard/UserProfileModal";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import UserTransactionHistoryModal from "@/components/dashboard/UserTransactionHistoryModal";
import AddGoldAdvanceModal from "@/components/dashboard/AddGoldAdvanceModal";
import ThemeToggle from "@/components/ui/ThemeToggle";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const AdminAUMChart = dynamic(() => import("@/components/ui/AdminAUMChart"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">Loading chart...</div>,
});

const navItems = [
  { id: "overview", name: "Global Command Center", icon: Activity },
  { id: "users", name: "User Management", icon: Users },
  { id: "transactions", name: "Global Transactions", icon: TrendingUp },
  { id: "withdrawals", name: "Withdrawals", icon: Wallet },
  { id: "settings", name: "System Settings", icon: Settings },
  { id: "profile", name: "My Profile", icon: User },
];

const roleColor = (role: string) =>
  role === "SUPERADMIN" ? "bg-red-500/10 text-red-500 font-bold" :
  role === "ADMIN" ? "bg-red-500/10 text-red-400" :
  "bg-green-500/10 text-green-400";

/* ─── Toast ─── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-50 bg-bg-surface border border-green-500/30 text-text-primary px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3">
      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 text-text-secondary hover:text-text-primary" /></button>
    </motion.div>
  );
}

/* ─── Main ─── */
export default function AdminDashboardPage() {
  /* ─── State ─── */
  const [activeTab, setActiveTab] = useState("overview");
  const userJson = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userJson ? JSON.parse(userJson) : null;
  const [toast, setToast] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [panicMode, setPanicMode] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [userSubTab, setUserSubTab] = useState("CUSTOMER");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  /* ─── Real Data State ─── */
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [globalTransactions, setGlobalTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [historyUser, setHistoryUser] = useState<any>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [allStaff, setAllStaff] = useState<any[]>([]);
   const [isAddGoldModalOpen, setIsAddGoldModalOpen] = useState(false);
  const [goldModalUser, setGoldModalUser] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  /* ─── System Settings State ─── */
  const [showGST, setShowGST] = useState(true);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [monthlyProfitPercentage, setMonthlyProfitPercentage] = useState(5.0);
  const [monthlyReferralPercentage, setMonthlyReferralPercentage] = useState(5.0);
  const [monthlyStaffPercentage, setMonthlyStaffPercentage] = useState(5.0);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  
  /* ─── Search & Sort State ─── */
  const [userSearch, setUserSearch] = useState("");
  const [userSortBy, setUserSortBy] = useState("createdAt");
  const [userSortOrder, setUserSortOrder] = useState("desc");

  const [txSearch, setTxSearch] = useState("");
  const [txSortBy, setTxSortBy] = useState("createdAt");
  const [txSortOrder, setTxSortOrder] = useState("desc");

  const [wdSearch, setWdSearch] = useState("");
  const [wdSortBy, setWdSortBy] = useState("createdAt");
  const [wdSortOrder, setWdSortOrder] = useState("desc");

  const [txTypeFilter, setTxTypeFilter] = useState("ALL");

  /* ─── Pagination State ─── */
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [wdPage, setWdPage] = useState(1);
  const [wdTotalPages, setWdTotalPages] = useState(1);

  /* ─── Debounced Search ─── */
  const [debouncedUserSearch, setDebouncedUserSearch] = useState("");
  const [debouncedTxSearch, setDebouncedTxSearch] = useState("");
  const [debouncedWdSearch, setDebouncedWdSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedUserSearch(userSearch), 400);
    return () => clearTimeout(timer);
  }, [userSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTxSearch(txSearch), 400);
    return () => clearTimeout(timer);
  }, [txSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedWdSearch(wdSearch), 400);
    return () => clearTimeout(timer);
  }, [wdSearch]);

  const USERS_LIMIT = 10;
  const router = useRouter();

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };


  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const sRes = await apiClient.get("/admin/stats", token);
      setStats(sRes);
    } catch (err) {
      console.error("Fetch stats failed:", err);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const query = new URLSearchParams({
        role: userSubTab,
        page: userPage.toString(),
        limit: USERS_LIMIT.toString(),
        search: debouncedUserSearch,
        sortBy: userSortBy,
        sortOrder: userSortOrder
      });
      const res = await apiClient.get(`/admin/users?${query.toString()}`, token);
      setUsers(res.data || []);
      setUserTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error("Fetch users failed:", err);
    }
  };

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const query = new URLSearchParams({
        page: txPage.toString(),
        limit: USERS_LIMIT.toString(),
        search: debouncedTxSearch,
        sortBy: txSortBy,
        sortOrder: txSortOrder
      });
      if (txTypeFilter !== "ALL") {
        query.append("type", txTypeFilter);
      }
      const res = await apiClient.get(`/admin/transactions?${query.toString()}`, token);
      setGlobalTransactions(res.data || []);
      setTxTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error("Fetch transactions failed:", err);
    }
  };

   const fetchWithdrawals = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const query = new URLSearchParams({
        page: wdPage.toString(),
        limit: USERS_LIMIT.toString(),
        search: debouncedWdSearch,
        sortBy: wdSortBy,
        sortOrder: wdSortOrder
      });
      const res = await apiClient.get(`/withdrawals/admin/all?${query.toString()}`, token);
      setWithdrawals(res.data || []);
      setWdTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error("Fetch withdrawals failed:", err);
    }
  };

   const fetchSystemSettings = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await apiClient.get("/settings", token);
      setShowGST(res.showGST);
      setGstPercentage(Number(res.gstPercentage));
      setMonthlyProfitPercentage(Number(res.monthlyProfitPercentage || 5.0));
      setMonthlyReferralPercentage(Number(res.monthlyReferralPercentage || 5.0));
      setMonthlyStaffPercentage(Number(res.monthlyStaffPercentage || 5.0));
      setShowAdvancedSettings(!!res.showAdvancedSettings);
    } catch (err) {
      console.error("Fetch settings failed:", err);
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

   const fetchStaff = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await apiClient.get("/admin/staff/list", token);
      setAllStaff(res || []);
    } catch (err) {
      console.error("Fetch staff failed:", err);
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

  const handleUpdateSettings = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setIsSettingsSaving(true);
    try {
      await apiClient.put("/settings", { 
        showGST, 
        gstPercentage,
        monthlyProfitPercentage,
        monthlyReferralPercentage,
        monthlyStaffPercentage,
        showAdvancedSettings
      }, token);
      showToast("System settings updated successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSettingsSaving(false);
    }
  };

  const loadTabData = async (tab: string) => {
    // Only fetch for the specific tab
    switch (tab) {
      case "overview":
        await Promise.all([fetchStats(), fetchLeaderboard()]);
        break;
      case "users":
        await Promise.all([fetchUsers(), fetchStaff()]);
        break;
      case "transactions":
        await fetchTransactions();
        break;
      case "withdrawals":
        await fetchWithdrawals();
        break;
      case "settings":
        await fetchSystemSettings();
        break;
      case "profile":
        await fetchCurrentUser();
        break;
    }
  };

  // ── Initialization ──
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return router.push("/auth/login");
      
      // Load both basic stats AND current tab data in parallel or sequence
      // fetchStats is needed for KPI cards visible on all tabs (like pending withdrawals count)
      await Promise.all([fetchStats(), fetchLeaderboard(), fetchCurrentUser()]);
      if (activeTab !== "overview" && activeTab !== "profile") {
        await loadTabData(activeTab);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  // ── Tab or Filter Refresh ──
  useEffect(() => {
    if (isLoading) return; // Wait for initial mount/auth check
    
    loadTabData(activeTab);
  }, [activeTab, userSubTab, userPage, txPage, wdPage, debouncedUserSearch, userSortBy, userSortOrder, debouncedTxSearch, txSortBy, txSortOrder, txTypeFilter, debouncedWdSearch, wdSortBy, wdSortOrder]);

  // Reset page when switching or searching
  useEffect(() => { setUserPage(1); }, [userSubTab, debouncedUserSearch, userSortBy, userSortOrder]);
  useEffect(() => { setTxPage(1); }, [debouncedTxSearch, txSortBy, txSortOrder, txTypeFilter]);
  useEffect(() => { setWdPage(1); }, [debouncedWdSearch, wdSortBy, wdSortOrder]);

  const handleWithdrawal = async (id: string, action: "approve" | "reject") => {
    try {
      const token = localStorage.getItem("token");
      await apiClient.post(`/withdrawals/admin/${action}`, { requestId: id }, token ?? undefined);
      showToast(`Withdrawal ${action}d successfully`);
      // Refresh list and stats
      fetchWithdrawals();
      fetchStats();
    } catch (err: any) {
      alert(err.message);
    }
  };

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




  const sidebarItems = navItems.map(item => ({
    ...item,
    badge: item.id === "withdrawals" 
      ? (stats?.pendingWithdrawalsCount || undefined)
      : undefined,
    badgeColor: "bg-red-500/20 text-red-300"
  }));

  const adminUser = {
    name: currentUser?.name || user?.name || "Administrator",
    role: user?.role === "SUPERADMIN" ? "SUPER ADMIN" : "ADMIN",
    details: user?.role === "SUPERADMIN" ? "System Root" : "Administrator",
    icon: user?.role === "SUPERADMIN" ? Crown : ShieldCheck,
    iconBg: user?.role === "SUPERADMIN" ? "bg-red-950" : "bg-bg-surface",
    iconColor: user?.role === "SUPERADMIN" ? "text-red-400" : "text-gold-400",
    borderColor: user?.role === "SUPERADMIN" ? "border-red-500/30" : "border-gold-500/20",
    photo: currentUser?.photo
  };

  /* ─── Search Bar Component ─── */
  const SearchBar = ({ value, onChange, placeholder }: any) => (
    <div className="relative group mb-6">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-gray-500 group-focus-within:text-gold-400 transition-colors" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg-surface border border-gold-500/10 focus:border-gold-400/30 text-text-primary text-sm rounded-xl py-3 pl-11 pr-4 outline-none transition-all placeholder:text-text-secondary/60 shadow-lg"
      />
    </div>
  );

  /* ─── Sortable Header Helper ─── */
  const SortHeader = ({ label, field, currentSort, currentOrder, onSort, align = "left" }: any) => {
    const isActive = currentSort === field;
    return (
      <th 
        className={`p-4 cursor-pointer hover:bg-gold-500/5 transition-colors ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"}`}
        onClick={() => onSort(field)}
      >
        <div className={`flex items-center gap-2 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : ""}`}>
          <span className={isActive ? "text-gold-400 font-bold" : ""}>{label}</span>
          <div className="flex flex-col -space-y-1">
            <TrendingUp className={`w-2 h-2 ${isActive && currentOrder === "asc" ? "text-gold-400" : "text-gray-600"}`} />
            <TrendingUp className={`w-2 h-2 rotate-180 ${isActive && currentOrder === "desc" ? "text-gold-400" : "text-gray-600"}`} />
          </div>
        </div>
      </th>
    );
  };

  const handleSort = (field: string, currentSort: string, setSort: any, currentOrder: string, setOrder: any) => {
    if (currentSort === field) {
      setOrder(currentOrder === "asc" ? "desc" : "asc");
    } else {
      setSort(field);
      setOrder("desc");
    }
  };

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className={`min-h-screen flex items-stretch transition-colors ${panicMode ? "bg-red-950" : "bg-bg-app"}`}>
      <DashboardSidebar
        items={sidebarItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={adminUser}
        onLogout={() => { localStorage.clear(); router.push("/auth/login"); }}
        isMobileOpen={mobileSidebarOpen}
        setIsMobileOpen={setMobileSidebarOpen}
        roleLabel={user?.role === "SUPERADMIN" ? "Super Admin" : "Admin"}
        accentColor="gold"
      />

      {/* Main */}
      <main className="flex-1 overflow-y-auto h-screen relative custom-scrollbar">
        <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-red-900/5 rounded-full blur-[150px] pointer-events-none" />

        {/* Panic Banner */}
        <AnimatePresence>
          {panicMode && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
              className="bg-red-600 text-white text-center py-2 text-sm font-bold tracking-wider z-50 relative overflow-hidden">
              ⚠ SYSTEM ALERT MODE ACTIVE — All branches notified. Review immediately.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="sticky top-0 z-30 bg-bg-app/90 backdrop-blur-md border-b border-gold-500/10 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-text-secondary hover:text-text-primary p-1" onClick={() => setMobileSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-sm text-text-secondary hidden sm:block">Royal Gold Traders — Global HQ</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => showToast("No new system alerts")} className="relative text-text-secondary hover:text-gold-500 dark:hover:text-gold-400 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
            <button onClick={() => { setPanicMode(!panicMode); showToast(panicMode ? "Alert mode deactivated" : "⚠ PANIC MODE ACTIVATED — All branches alerted!"); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${panicMode ? "bg-red-500 text-white animate-pulse" : "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"}`}>
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">{panicMode ? "Deactivate Alert" : "System Alert Mode"}</span>
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-5 lg:p-10 relative z-10">
          <AnimatePresence mode="wait">

            {/* ── GLOBAL COMMAND CENTER ── */}
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center justify-between mb-7">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-text-primary mb-1">Global Command Center</h1>
                    <p className="text-text-secondary text-sm">System-wide metrics across all branches</p>
                  </div>
                  <button onClick={() => { 
                    const tgaText = stats ? formatCurrency(stats.totalGoldAdvance) : "N/A";
                    downloadInvoicePDF({ 
                      id: "SYS-RPT", 
                      type: "Global System Report", 
                      date: new Date().toLocaleDateString(), 
                      amount: `${tgaText} Total Gold Advance`, 
                      rawAmount: stats?.totalGoldAdvance || 0,
                      customerName: "Super Admin" 
                    }); 
                    showToast("Global report downloaded!"); 
                  }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gold-500/20 text-text-secondary hover:text-text-primary text-sm font-medium transition-all"
                  >
                    <Download className="w-4 h-4" /> Export
                  </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-7">
                  {[
                    { label: "Today's Gold Advance", value: stats ? formatCurrency(stats.todayGoldAdvance || 0) : "...", status: "Today's Gold Advance", color: "text-gold-400", glass: "bg-gold-glass" },
                    { label: "Today's Withdrawals", value: stats ? formatCurrency(stats.todayWithdrawals || 0) : "...", status: "Today's Payouts", color: "text-red-400", glass: "bg-red-glass" },
                    { label: "Monthly Net Flow", value: stats ? formatCurrency(stats.monthlyNetFlow || 0) : "...", status: stats?.monthlyNetFlow >= 0 ? "Positive Flow" : "Negative Flow", color: stats?.monthlyNetFlow >= 0 ? "text-green-400" : "text-red-400", glass: stats?.monthlyNetFlow >= 0 ? "bg-green-glass" : "bg-red-glass" },
                    { label: "Monthly Growth", value: stats ? `${stats.monthlyGrowth || 0}%` : "...", status: "AUM Growth", color: "text-blue-400", glass: "bg-blue-glass" },
                    { label: "Total Gold Advance", value: stats ? formatCurrency(stats.totalGoldAdvance) : "...", status: "↑ Healthy", color: "text-gold-400", glass: "bg-gold-glass" },
                    { label: "Total Withdrawals", value: stats ? formatCurrency(stats.totalWithdrawals) : "...", status: "Approved Payouts", color: "text-red-400", glass: "bg-red-glass" },
                    { label: "Total Pending amount", value: stats ? formatCurrency(stats.totalPendingAmount || 0) : "...", status: "Awaiting Pay", color: "text-orange-400", glass: "bg-gold-glass" },
                    { label: "Total Customer", value: stats ? String(stats.customersCount || 0) : "...", status: "Verified Accounts", color: "text-green-400", glass: "bg-green-glass" },
                    { label: "Total Staffs", value: stats ? String(stats.staffCount || 0) : "...", status: "Active Personnel", color: "text-purple-400", glass: "bg-blue-glass" },
                    { label: "Pending Req", value: stats ? String(stats.pendingWithdrawalsCount || 0) : "...", status: "Requires Approval", color: "text-blue-400", glass: "bg-blue-glass" },
                  ].map(({ label, value, status, color, glass }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className={`${glass} p-6 rounded-2xl transition-all hover:scale-[1.03] active:scale-95 cursor-default`}>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">{label}</p>
                      <h3 className={`text-2xl font-heading font-black text-text-primary mb-3 tracking-tight ${color.includes('gold') || color.includes('orange') ? 'text-glow-gold' : color.includes('red') ? 'text-red-500' : 'text-glow-blue'}`}>{value}</h3>
                      <div className={`text-[10px] font-bold ${color} flex items-center gap-1.5 uppercase tracking-tighter`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} /> {status}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* AUM Chart */}
                <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-heading font-semibold text-text-primary mb-5 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-gold-500" /> Global Gold Advance Growth
                  </h3>
                  <div className="h-[220px]">
                    {stats?.aumTrend && <AdminAUMChart data={stats.aumTrend} />}
                  </div>
                </div>

                {/* Analytical Leaderboards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                  {/* Top Customers */}
                  <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-heading font-semibold text-text-primary flex items-center gap-2">
                        <Crown className="w-5 h-5 text-gold-500" /> Top Customers
                      </h3>
                      <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">High Value</span>
                    </div>
                    <div className="space-y-4">
                      {stats?.topCustomers?.map((c: any, i: number) => (
                        <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-gold-500/10 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-600 dark:text-gold-400 text-xs font-bold">
                              {i + 1}
                            </div>
                            <div>
                              <p className="text-sm text-text-primary font-medium">{c.name}</p>
                              <p className="text-[10px] text-text-secondary">{c.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gold-600 dark:text-gold-400">{formatCurrency(c.goldAdvance)}</p>
                            <p className="text-[10px] text-text-secondary uppercase tracking-tighter font-bold">Gold Advance</p>
                          </div>
                        </div>
                      ))}
                      {(!stats?.topCustomers || stats.topCustomers.length === 0) && (
                        <p className="text-sm text-gray-500 text-center py-5 italic">No customer data available yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Top Referrers */}
                  <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-heading font-semibold text-text-primary flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" /> Top Network Referrers
                      </h3>
                      <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Top 5</span>
                    </div>
                    <div className="space-y-4">
                      {stats?.topReferrers?.map((r: any, i: number) => (
                        <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-gold-500/10 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 dark:text-blue-400 text-xs font-bold">
                              {i + 1}
                            </div>
                            <div>
                              <p className="text-sm text-text-primary font-medium">{r.name}</p>
                              <p className="text-[10px] text-text-secondary">{r.refereeCount} Network users</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gold-600 dark:text-gold-400">{formatCurrency(r.totalNetworkAUM)}</p>
                            <p className="text-[10px] text-text-secondary uppercase tracking-tighter font-bold">Network AUM</p>
                          </div>
                        </div>
                      ))}
                      {(!stats?.topReferrers || stats.topReferrers.length === 0) && (
                        <p className="text-sm text-gray-500 text-center py-5 italic">No referral data available yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Staff Performance Leaderboard */}
                  <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6 text-purple-400">
                      <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
                        <Crown className="w-5 h-5" /> Staff Performance Leaderboard
                      </h3>
                      <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Commission Based</span>
                    </div>

                    <div className="space-y-4">
                      {leaderboard.map((s: any, i: number) => (
                        <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-gold-500/10 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${i === 0 ? "bg-gold-500/10 border-gold-500 text-gold-500 shadow-[0_0_15px_rgba(255,215,0,0.2)]" : i === 1 ? "bg-gray-400/10 border-gray-400 text-gray-400" : i === 2 ? "bg-orange-600/10 border-orange-600 text-orange-600" : "bg-bg-surface border-gold-500/20 text-text-secondary"}`}>
                              {i + 1}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-text-primary">{s.name}</p>
                              <p className="text-[10px] text-text-secondary">{s.customersCount} active customers</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-500 dark:text-emerald-200">{formatCurrency(s.totalCommission)}</p>
                            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Commission</p>
                          </div>
                        </div>
                      ))}
                      {(!leaderboard || leaderboard.length === 0) && (
                        <p className="text-sm text-gray-500 text-center py-5 italic w-full">No staff performance data available yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}


            {/* ── WITHDRAWALS ── */}
            {activeTab === "withdrawals" && (
              <motion.div key="withdrawals" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h1 className="text-2xl font-heading font-bold text-text-primary mb-6">Withdrawal Requests</h1>
                
                <SearchBar 
                  value={wdSearch} 
                  onChange={setWdSearch} 
                  placeholder="Search by ID, Customer Name or Email..." 
                />

                <div className="bg-bg-surface/30 border border-gold-500/10 rounded-2xl shadow-2xl overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-bg-app text-[10px] text-text-secondary uppercase tracking-widest font-bold border-b border-gold-500/10">
                      <tr>
                        <SortHeader label="Customer" field="user.name" currentSort={wdSortBy} currentOrder={wdSortOrder} onSort={(f: any) => handleSort(f, wdSortBy, setWdSortBy, wdSortOrder, setWdSortOrder)} />
                        <SortHeader label="Amount" field="amount" currentSort={wdSortBy} currentOrder={wdSortOrder} onSort={(f: any) => handleSort(f, wdSortBy, setWdSortBy, wdSortOrder, setWdSortOrder)} />
                        <SortHeader label="Date" field="createdAt" currentSort={wdSortBy} currentOrder={wdSortOrder} onSort={(f: any) => handleSort(f, wdSortBy, setWdSortBy, wdSortOrder, setWdSortOrder)} />
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/5">
                      {withdrawals.map((w) => (
                        <tr key={w.id}>
                          <td className="p-4">
                            <p className="text-text-primary font-medium">{w.user?.name}</p>
                            <p className="text-xs text-text-secondary">{w.user?.email}</p>
                          </td>
                          <td className="p-4 text-gold-500 dark:text-gold-400 font-bold">{formatCurrency(w.amount)}</td>
                          <td className="p-4 text-text-secondary text-sm">{new Date(w.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${w.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500 dark:text-yellow-400" : w.status === "APPROVED" ? "bg-green-500/10 text-green-500 dark:text-green-400" : "bg-red-500/10 text-red-500 dark:text-red-400"}`}>
                              {w.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {w.status === "PENDING" && (
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleWithdrawal(w.id, "approve")} className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20"><CheckCircle2 className="w-4 h-4" /></button>
                                <button onClick={() => handleWithdrawal(w.id, "reject")} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"><X className="w-4 h-4" /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {withdrawals.length === 0 && (
                        <tr><td colSpan={5} className="p-10 text-center text-gray-500">No withdrawal requests found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="mt-4 bg-bg-app border border-gold-500/10 p-4 rounded-xl flex items-center justify-between">
                  <p className="text-xs text-text-secondary">
                    Page <span className="text-text-primary font-bold">{wdPage}</span> of <span className="text-text-primary font-bold">{wdTotalPages}</span>
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setWdPage(prev => Math.max(1, prev - 1))}
                      disabled={wdPage === 1}
                      className="px-4 py-2 rounded-lg border border-gold-500/10 text-xs font-bold text-text-secondary hover:text-gold-500 hover:bg-gold-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <button 
                      onClick={() => setWdPage(prev => Math.min(wdTotalPages, prev + 1))}
                      disabled={wdPage >= wdTotalPages}
                      className="px-4 py-2 rounded-lg border border-gold-500/10 text-xs font-bold text-text-secondary hover:text-gold-500 hover:bg-gold-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TRANSACTIONS ── */}
            {activeTab === "transactions" && (
              <motion.div key="transactions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h1 className="text-2xl font-heading font-bold text-text-primary mb-6">Global Transaction History</h1>
                
                {/* Transaction Type Sub-Tabs */}
                <div className="flex gap-2 mb-6 p-1 bg-bg-app rounded-xl w-fit border border-gold-500/10">
                  {[
                    { id: "ALL", label: "All Transactions" },
                    { id: "DEPOSIT", label: "Deposits" },
                    { id: "WITHDRAWAL", label: "Withdrawals" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setTxTypeFilter(tab.id)}
                      className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${txTypeFilter === tab.id ? "bg-gold-500 text-bg-app shadow-lg" : "text-text-secondary hover:text-gold-500"}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <SearchBar 
                  value={txSearch} 
                  onChange={setTxSearch} 
                  placeholder="Search by ID, User Name or Description..." 
                />

                <div className="bg-bg-surface/30 border border-gold-500/10 rounded-2xl shadow-2xl overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-bg-app text-[10px] text-text-secondary uppercase tracking-widest font-bold border-b border-gold-500/10">
                      <tr>
                        <SortHeader label="User" field="user.name" currentSort={txSortBy} currentOrder={txSortOrder} onSort={(f: any) => handleSort(f, txSortBy, setTxSortBy, txSortOrder, setTxSortOrder)} />
                        <SortHeader label="Type" field="type" currentSort={txSortBy} currentOrder={txSortOrder} onSort={(f: any) => handleSort(f, txSortBy, setTxSortBy, txSortOrder, setTxSortOrder)} />
                        <SortHeader label="Amount" field="amount" currentSort={txSortBy} currentOrder={txSortOrder} onSort={(f: any) => handleSort(f, txSortBy, setTxSortBy, txSortOrder, setTxSortOrder)} />
                        <th className="p-4">Description</th>
                        <th className="p-4 text-right text-text-secondary">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/5">
                      {globalTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-bg-app/50 transition-colors">
                          <td className="p-4">
                            <p className="text-text-primary font-medium text-sm">{tx.user?.name}</p>
                            <p className="text-[10px] text-text-secondary">{tx.user?.email}</p>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${tx.type === "WITHDRAWAL" ? "bg-red-500/10 text-red-500 dark:text-red-400" : "bg-green-500/10 text-green-500 dark:text-green-400"}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className={`p-4 font-bold text-sm ${tx.type === "WITHDRAWAL" ? "text-red-500" : "text-green-500 dark:text-green-400"}`}>
                            {tx.type === "WITHDRAWAL" ? "-" : "+"}{formatCurrency(tx.amount)}
                          </td>
                          <td className="p-4 text-text-secondary text-xs italic">{tx.description || "-"}</td>
                          <td className="p-4 text-text-secondary text-xs">{tx.performedBy?.name || "SYSTEM"}</td>
                          <td className="p-4 text-text-secondary text-xs">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            {["GOLD_ADVANCE", "WITHDRAWAL", "DEPOSIT"].includes(tx.type) && (
                              <button onClick={() => handleDownload(tx)} title="Download Receipt" className="p-2 text-gold-500 dark:text-gold-400 hover:text-gold-400 hover:scale-110 transition-all inline-flex">
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {globalTransactions.length === 0 && (
                        <tr><td colSpan={5} className="p-10 text-center text-gray-500 italic">No transactions found in system.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="mt-4 bg-bg-surface border border-gold-500/10 p-4 rounded-xl flex items-center justify-between">
                  <p className="text-xs text-text-secondary">
                    Page <span className="text-text-primary font-bold">{txPage}</span> of <span className="text-text-primary font-bold">{txTotalPages}</span>
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setTxPage(prev => Math.max(1, prev - 1))}
                      disabled={txPage === 1}
                      className="px-4 py-2 rounded-lg border border-gold-500/10 text-xs font-bold text-text-secondary hover:text-gold-500 hover:bg-gold-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <button 
                      onClick={() => setTxPage(prev => Math.min(txTotalPages, prev + 1))}
                      disabled={txPage >= txTotalPages}
                      className="px-4 py-2 rounded-lg border border-gold-500/10 text-xs font-bold text-text-secondary hover:text-gold-500 hover:bg-gold-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── USER MANAGEMENT ── */}
            {activeTab === "users" && (
              <motion.div key="users" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-text-primary mb-1">User Management</h1>
                    <p className="text-text-secondary text-sm">Manage system access and relationships</p>
                  </div>
                  <button onClick={() => setIsRegModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-bg-app text-sm font-bold transition-all transform active:scale-95 shadow-lg shadow-gold-500/20">
                    <UserPlus className="w-4 h-4" /> Add New User
                  </button>
                </div>

                {/* Sub Tabs */}
                <div className="flex gap-2 mb-6 p-1 bg-bg-app rounded-xl w-fit border border-gold-500/10">
                  {["CUSTOMER", "STAFF", "ADMIN", "SUPERADMIN"].map((role) => (
                    <button
                      key={role}
                      onClick={() => setUserSubTab(role)}
                      className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${userSubTab === role ? "bg-gold-500 text-bg-app shadow-lg" : "text-text-secondary hover:text-gold-500"}`}
                    >
                      {role === "SUPERADMIN" ? "SUPERADMINS" : `${role}S`}
                    </button>
                  ))}
                </div>

                <SearchBar 
                  value={userSearch} 
                  onChange={setUserSearch} 
                  placeholder={`Search ${userSubTab.toLowerCase()}s by ID, Name, Email or Phone...`} 
                />

                <div className="bg-bg-surface border border-gold-500/10 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-bg-app border-b border-gold-500/10">
                        <tr className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">
                          <th className="p-4 pl-6 text-center w-16">#</th>
                          <SortHeader label="Identity" field="name" currentSort={userSortBy} currentOrder={userSortOrder} onSort={(f: any) => handleSort(f, userSortBy, setUserSortBy, userSortOrder, setUserSortOrder)} />
                          {userSubTab === "CUSTOMER" && <th className="p-4">Referrer</th>}
                          {userSubTab === "CUSTOMER" && <th className="p-4">Assigned Staff</th>}
                          {userSubTab === "STAFF" && <th className="p-4">Managed Clients</th>}
                          <SortHeader label="Total Gold Advance" field="goldAdvancesSum" currentSort={userSortBy} currentOrder={userSortOrder} onSort={(f: any) => handleSort(f, userSortBy, setUserSortBy, userSortOrder, setUserSortOrder)} />
                          <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold-500/5">
                        {users.map((u, i) => (
                          <tr key={u.id} className="hover:bg-emerald-900/10 dark:hover:bg-emerald-900/20 transition-colors group">
                            <td className="p-4 pl-6 text-center">
                              <span className="text-xs text-text-secondary font-mono">
                                {((userPage - 1) * USERS_LIMIT + (i + 1)).toString().padStart(2, '0')}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${roleColor(u.role)}`}>
                                  {u.name[0]}
                                </div>
                                <div>
                                  <p className="font-semibold text-text-primary text-sm group-hover:text-gold-500 transition-colors">{u.name}</p>
                                  <p className="text-[10px] text-text-secondary font-mono uppercase">{u.id} · {u.email}</p>
                                </div>
                              </div>
                            </td>
                            {userSubTab === "CUSTOMER" && (
                              <td className="p-4">
                                {u.referrer ? (
                                  <div>
                                    <p className="text-xs text-text-primary">{u.referrer.name}</p>
                                    <p className="text-[9px] text-text-secondary">{u.referrer.email}</p>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-text-secondary italic">None</span>
                                )}
                              </td>
                            )}
                            {userSubTab === "CUSTOMER" && (
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                                  <span className="text-xs text-text-secondary">{u.assignedStaff?.name || "Unassigned"}</span>
                                </div>
                              </td>
                            )}
                            {userSubTab === "STAFF" && (
                              <td className="p-4">
                                <span className="bg-bg-app px-2 py-1 rounded text-xs text-text-secondary font-bold border border-gold-500/10">
                                  {u.customers?.length || 0} Clients
                                </span>
                              </td>
                            )}
                            <td className="p-4">
                              <p className="text-sm font-bold text-gold-400">
                                {formatCurrency(u.totalGoldAdvanceAmount || 0)}
                              </p>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => { setSelectedUser(u); setIsDetailsModalOpen(true); }} 
                                  className="p-2 rounded-lg border border-gold-500/10 text-gold-600 dark:text-gold-500 hover:bg-gold-500/10 transition-all">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button onClick={() => { setHistoryUser(u); setIsHistoryModalOpen(true); }} 
                                  className="p-2 rounded-lg border border-blue-500/10 text-blue-600 dark:text-blue-500 hover:bg-blue-500/10 transition-all">
                                  <History className="w-4 h-4" />
                                </button>
                                  <button onClick={() => { setProfileUser(u); setIsProfileModalOpen(true); }} 
                                    className="p-2 rounded-lg border border-gold-500/10 text-text-secondary hover:text-gold-500 hover:bg-gold-500/10 transition-all">
                                    <Settings className="w-4 h-4" />
                                  </button>
                                  {u.role === "CUSTOMER" && (
                                    <button onClick={() => { setGoldModalUser(u); setIsAddGoldModalOpen(true); }} 
                                      className="p-2 rounded-lg border border-green-500/10 text-green-500 hover:text-white hover:bg-green-500/20 hover:border-green-500/40 transition-all"
                                      title="Add Gold Advance">
                                      <Wallet className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                            </td>
                          </tr>
                        ))}
                        {users.filter(u => u.role === userSubTab).length === 0 && (
                          <tr><td colSpan={7} className="p-20 text-center text-gray-500 italic text-sm">No {userSubTab.toLowerCase()} accounts found in system.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="bg-bg-app border-t border-gold-500/10 p-4 flex items-center justify-between">
                    <p className="text-xs text-text-secondary">
                      Page <span className="text-text-primary font-bold">{userPage}</span> of <span className="text-text-primary font-bold">{userTotalPages}</span>
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setUserPage(prev => Math.max(1, prev - 1))}
                        disabled={userPage === 1}
                        className="px-4 py-2 rounded-lg border border-gold-500/10 text-xs font-bold text-text-secondary hover:text-gold-500 hover:bg-gold-500/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        Previous
                      </button>
                      <button 
                        onClick={() => setUserPage(prev => Math.min(userTotalPages, prev + 1))}
                        disabled={userPage >= userTotalPages}
                        className="px-4 py-2 rounded-lg border border-gold-500/10 text-xs font-bold text-text-secondary hover:text-gold-500 hover:bg-gold-500/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}


            {/* ── SYSTEM SETTINGS ── */}
            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="mb-7">
                  <h1 className="text-2xl font-heading font-bold text-text-primary mb-1">System Settings</h1>
                  <p className="text-text-secondary text-sm">Global configuration — Admin access only</p>
                </div>
                <div className="space-y-5 max-w-2xl">
                  {/* System Info */}
                  <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6">
                    <h3 className="font-semibold text-text-primary mb-4">Platform Identity</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Platform Name", value: "Royal Gold Traders" },
                        { label: "Version", value: "v2.0.0-production" },
                        { label: "Headquarters", value: "Patna, Bihar, India" },
                        { label: "Database", value: "Hostinger MySQL · Connected ✓" },
                        { label: "Active Since", value: "January 2024" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between py-2 border-b border-gold-500/5 last:border-0 text-sm">
                          <span className="text-text-secondary">{label}</span>
                          <span className="font-medium text-text-primary">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                   {/* Global Controls */}
                  <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6">
                    <h3 className="font-semibold text-text-primary mb-4">Global Controls</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b border-gold-500/5">
                        <div className="flex flex-col">
                          <span className="text-sm text-text-primary font-medium tracking-wide">Show GST in Invoice</span>
                          <span className="text-[10px] text-text-secondary">Enable or disable GST calculations on customer receipts</span>
                        </div>
                        <button onClick={() => setShowGST(!showGST)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${showGST ? "bg-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.3)]" : "bg-bg-app border border-gold-500/20"}`}>
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${showGST ? "left-[22px]" : "left-0.5"}`} />
                        </button>
                      </div>

                      {showGST && (
                        <div className="flex items-center justify-between pb-4 border-b border-gold-500/5">
                          <div className="flex flex-col">
                            <span className="text-sm text-text-primary font-medium tracking-wide">GST Percentage (%)</span>
                            <span className="text-[10px] text-text-secondary">The current GST rate applied to taxable gold advances</span>
                          </div>
                          <div className="relative w-20">
                            <input 
                              type="number" 
                              value={gstPercentage}
                              onChange={(e) => setGstPercentage(Number(e.target.value))}
                              className="w-full bg-bg-app border border-gold-500/20 rounded-lg py-1.5 px-3 text-sm text-text-primary text-right outline-none focus:border-gold-500/50 transition-all"
                            />
                            <span className="absolute right-[-14px] top-1/2 -translate-y-1/2 text-text-secondary text-xs">%</span>
                          </div>
                        </div>
                      )}

                      {[
                        { label: "Nightly yield distribution (cron job)", on: true },
                        { label: "New customer self-registration", on: false },
                        { label: "SMS notifications to all customers", on: true },
                      ].map(({ label, on }, i) => (
                        <div key={i} className="flex items-center justify-between opacity-50 cursor-not-allowed">
                          <span className="text-sm text-text-secondary">{label}</span>
                          <button disabled
                            className={`w-10 h-5 rounded-full transition-colors relative ${on ? "bg-gold-500/40" : "bg-bg-app border border-gold-500/10"}`}>
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Profit Configuration - Only shown if showAdvancedSettings is true in DB */}
                  {showAdvancedSettings && (
                    <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6">
                      <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-gold-500" /> Profit & Commission Rates
                      </h3>
                      <div className="space-y-4">
                        {[
                          { label: "Monthly Profit (%)", value: monthlyProfitPercentage, setter: setMonthlyProfitPercentage, desc: "Customer's monthly return on advance" },
                          { label: "Monthly Referral (%)", value: monthlyReferralPercentage, setter: setMonthlyReferralPercentage, desc: "Referrer's reward per unique advance" },
                          { label: "Monthly Staff (%)", value: monthlyStaffPercentage, setter: setMonthlyStaffPercentage, desc: "Staff commission per managed client" }
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between pb-4 border-b border-gold-500/5 last:border-0 last:pb-0">
                            <div className="flex flex-col">
                              <span className="text-sm text-text-primary font-medium tracking-wide">{item.label}</span>
                              <span className="text-[10px] text-text-secondary">{item.desc}</span>
                            </div>
                            <div className="relative w-24">
                              <input 
                                type="number" 
                                step="0.1"
                                value={item.value}
                                onChange={(e) => item.setter(Number(e.target.value))}
                                className="w-full bg-bg-app border border-gold-500/20 rounded-lg py-1.5 px-3 text-sm text-text-primary text-right outline-none focus:border-gold-500/50 transition-all"
                              />
                              <span className="absolute right-[-14px] top-1/2 -translate-y-1/2 text-text-secondary text-xs">%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Danger Zone */}
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                    <h3 className="font-semibold text-red-500 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Danger Zone
                    </h3>
                    <div className="space-y-3">
                      {["Force logout all sessions", "Reset all branch monthly lead counts", "Trigger full system backup now"].map((action) => (
                        <button key={action} onClick={() => showToast(`"${action}" — requires backend confirmation.`)}
                          className="w-full py-2.5 rounded-xl border border-red-500/20 text-red-500 text-sm hover:bg-red-500/10 transition-all text-left px-4 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 shrink-0" /> {action}
                        </button>
                      ))}
                    </div>
                  </div>
                   <button 
                    onClick={handleUpdateSettings}
                    disabled={isSettingsSaving}
                    className={`w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-bg-app font-bold transition-all flex items-center justify-center gap-2 ${isSettingsSaving ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {isSettingsSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSettingsSaving ? "Updating System..." : "Save Global Settings"}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
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
        </div>
      </main>

      {/* Modals */}
      <UserRegistrationModal 
        isOpen={isRegModalOpen} 
        onClose={() => setIsRegModalOpen(false)} 
        onSuccess={(msg) => { showToast(msg); fetchUsers(); }}
        callerRole="ADMIN"
      />

      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        user={selectedUser}
        allStaff={allStaff}
        onUpdate={() => { fetchUsers(); setIsDetailsModalOpen(false); }}
      />

      <UserTransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        user={historyUser}
        callerRole="ADMIN"
      />

      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        user={profileUser} 
        onUpdate={() => { showToast("Profile updated successfully"); fetchUsers(); }} 
        callerRole="ADMIN"
      />

      <AddGoldAdvanceModal 
        isOpen={isAddGoldModalOpen} 
        onClose={() => { setIsAddGoldModalOpen(false); setGoldModalUser(null); }} 
        user={goldModalUser} 
        onSuccess={(m) => { showToast(m); fetchUsers(); fetchStats(); }} 
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  </RoleGuard>
);
}


