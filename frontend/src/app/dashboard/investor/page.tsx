"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, TrendingUp, ArrowDownRight, ArrowUpRight, LogOut,
  Download, Plus, Settings, LineChart, ShieldCheck, X,
  Menu, CheckCircle2, Clock, FileText, Loader2, Check, Info, ArrowRight
} from "lucide-react";
import { downloadInvoicePDF } from "@/lib/downloadInvoice";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { formatCurrency } from "@/lib/utils";
import RoleGuard from "@/components/auth/RoleGuard";
import { apiClient } from "@/lib/api-client";

// Dynamic import prevents SSR which causes -1/-1 dimension bug in Recharts
const YieldChart = dynamic(() => import("@/components/ui/YieldChart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
      Loading chart...
    </div>
  ),
});


function handleInvoiceDownload(inv: any, showToast: (m: string) => void) {
  downloadInvoicePDF({ ...inv, investorName: "Customer", investorId: "RGT-CUST" });
  showToast(`${inv.id} downloaded successfully!`);
}

const navItems = [
  { label: "Portfolio", icon: Wallet },
  { label: "Transactions", icon: TrendingUp },
  { label: "Withdrawals", icon: ArrowUpRight },
  { label: "Invoices", icon: FileText },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/* ─── Toast ─── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-green-500/30 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3"
    >
      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
    </motion.div>
  );
}

/* ─── Withdrawal Modal ─── */
interface WithdrawalModalProps {
  onClose: () => void;
  onSuccess: (m: string) => void;
  investedBalance: number;
  profitBalance: number;
  referralBalance: number;
}

function WithdrawalModal({ onClose, onSuccess, investedBalance, profitBalance, referralBalance }: WithdrawalModalProps) {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<"GOLD_ADVANCE" | "PROFIT" | "REFERRAL">("PROFIT");
  const [isLoading, setIsLoading] = useState(false);

  const getSourceBalance = (src: string) => {
    if (src === "GOLD_ADVANCE") return investedBalance;
    if (src === "PROFIT") return profitBalance;
    if (src === "REFERRAL") return referralBalance;
    return 0;
  };

  const currentBalance = getSourceBalance(source);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return;
    if (Number(amount) > currentBalance) {
      alert("Insufficient balance in the selected source.");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/withdrawals`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ amount: Number(amount), source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit request");
      onSuccess("Withdrawal request submitted! Pending approval.");
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sources = [
    { id: "BALANCE", label: "Wallet Balance", icon: Wallet, color: "text-green-400" },
    { id: "GOLD_ADVANCE", label: "Gold Advance Amount", icon: ShieldCheck, color: "text-gold-400" },
    { id: "PROFIT", label: "Profit Earning", icon: TrendingUp, color: "text-blue-400" },
    { id: "REFERRAL", label: "Referral Earning", icon: ArrowDownRight, color: "text-purple-400" },
  ];

  const totalWithdrawable = investedBalance + profitBalance + referralBalance;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        className="bg-emerald-950 border border-gold-500/20 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-heading font-bold text-white">Request Withdrawal</h2>
            <p className="text-gray-400 text-sm mt-1">Review your limits and enter amount.</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-emerald-1000/60 border border-gold-500/10 rounded-2xl p-4 mb-6">
          <p className="text-xs text-gray-500 mb-1">Total Withdrawable Portfolio</p>
          <p className="text-2xl font-heading font-bold text-gold-400">{formatCurrency(totalWithdrawable)}</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wider">Amount to Withdraw</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500 font-bold">₹</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                className="w-full bg-emerald-1000/50 border border-gold-500/20 focus:border-gold-500/50 text-white rounded-xl py-3 pl-8 pr-4 outline-none transition-all text-lg font-bold" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-3 block uppercase tracking-wider">Select Withdrawal Mode</label>
            <div className="grid grid-cols-1 gap-2">
              {sources.map((s) => {
                const bal = getSourceBalance(s.id);
                const eligible = bal >= (Number(amount) || 0);
                const isSelected = source === s.id;

                return (
                  <button
                    key={s.id}
                    onClick={() => setSource(s.id as any)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left group
                      ${isSelected ? "bg-gold-500/10 border-gold-500" : "bg-emerald-1000/20 border-gold-500/10 hover:border-gold-500/30"}
                      ${!eligible && amount && Number(amount) > 0 ? "opacity-60" : ""}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? "bg-gold-500/20" : "bg-emerald-950"} ${s.color}`}>
                        <s.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isSelected ? "text-gold-400" : "text-gray-300"}`}>{s.label}</p>
                        <p className="text-[10px] text-gray-500">Bal: {formatCurrency(bal)}</p>
                      </div>
                    </div>
                    {amount && Number(amount) > 0 && eligible === false ? (
                      <span className="text-[10px] text-red-400 bg-red-400/10 px-2 py-0.5 rounded">Insufficient</span>
                    ) : (
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-gold-500 bg-gold-500" : "border-gray-600"}`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-emerald-1000" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-start gap-2 bg-blue-500/5 border border-blue-500/10 rounded-xl p-3">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-blue-300 font-medium tracking-tight leading-relaxed">Admin will review and process your request within 7 business days.</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!amount || isLoading || Number(amount) > currentBalance}
            className="w-full py-4 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-1000 font-bold transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Request <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Transaction Table ─── */
function TransactionTable({ rows, onDownload }: { rows: any[]; onDownload: (tx: any) => void }) {
  return (
    <div className="bg-emerald-950/30 border border-gold-500/10 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-emerald-950/50 border-b border-gold-500/10 text-xs uppercase tracking-wider text-gray-500 font-medium">
              <th className="p-4 pl-6">Type</th>
              <th className="p-4 hidden sm:table-cell">Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Processed By</th>
              <th className="p-4 hidden md:table-cell">Status</th>
              <th className="p-4 pr-6 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold-500/5">
            {rows.map((tx, i) => (
              <tr key={i} className="hover:bg-emerald-900/20 transition-colors">
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${tx.iconBg} flex items-center justify-center ${tx.iconColor} shrink-0`}>
                      <tx.icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-gray-200 text-sm">{tx.type}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-400 text-sm hidden sm:table-cell">{tx.date}</td>
                <td className={`p-4 font-medium ${tx.amountColor}`}>{tx.amount}</td>
                <td className="p-4 text-xs text-gray-500">{tx.processedBy || "SYSTEM"}</td>
                <td className="p-4 hidden md:table-cell">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tx.statusColor === "green" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  {/* Show download button for Gold Advances / Deposits / Withdrawals */}
                  {(tx.rawType === "GOLD_ADVANCE" || tx.rawType === "DEPOSIT" || tx.rawType === "WITHDRAWAL") && (
                    <button onClick={() => onDownload(tx)} title={`Download ${tx.rawType}`} className="text-gold-500 hover:text-gold-400 hover:scale-110 transition-all inline-flex p-2">
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function InvestorDashboardPage() {
  const [activeTab, setActiveTab] = useState("Portfolio");
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const router = useRouter();

  /* ─── Real Data State ─── */
  const [userData, setUserData] = useState<any>(null);
  const [goldAdvances, setGoldAdvances] = useState<any[]>([]);
  const [transactionsData, setTransactionsData] = useState<any[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const fetchBaseData = async () => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (!token || !userJson) return null;
    const user = JSON.parse(userJson);
    try {
      const userRes = await apiClient.get(`/users/${user.id}`, token);
      const data = userRes.data || userRes;
      setUserData(data);
      return data;
    } catch (err: any) {
      handleApiError(err);
      return null;
    }
  };

  const fetchPortfolioData = async (userOverride?: any) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const user = userOverride || userData;
    if (!user?.id) return;

    try {
      const [advRes, txRes] = await Promise.all([
        apiClient.get(`/gold-advances`, token),
        apiClient.get(`/users/${user.id}/transactions`, token)
      ]);
      setGoldAdvances(advRes.data || advRes);
      mapTransactions(txRes.data || txRes);
    } catch (err: any) {
      handleApiError(err);
    }
  };

  const fetchReferralData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const refRes = await apiClient.get(`/referrals`, token);
      setReferrals(refRes.data || refRes);
    } catch (err: any) {
      handleApiError(err);
    }
  };

  const fetchWithdrawalHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await apiClient.get(`/withdrawals`, token);
      setWithdrawalsList(res.data || res);
    } catch (err: any) {
      console.error("Fetch withdrawals failed:", err);
    }
  };

  const mapTransactions = (txRes: any) => {
    const dataArray = Array.isArray(txRes) ? txRes : (txRes?.data && Array.isArray(txRes.data) ? txRes.data : []);
    
    const mappedTxs = dataArray.map((tx: any) => {
      let icon = Plus;
      let iconBg = "bg-gold-500/10";
      let iconColor = "text-gold-400";
      let amountColor = "text-green-400";
      let status = "Completed";
      let statusColor = "green";

      switch (tx.type) {
        case "GOLD_ADVANCE":
          icon = Plus; iconBg = "bg-gold-500/10"; iconColor = "text-gold-400"; break;
        case "WITHDRAWAL":
          icon = ArrowUpRight; iconBg = "bg-red-500/10"; iconColor = "text-red-400"; amountColor = "text-red-400"; break;
        case "PROFIT":
          icon = TrendingUp; iconBg = "bg-blue-500/10"; iconColor = "text-blue-400"; break;
        case "REFERRAL":
          icon = ArrowDownRight; iconBg = "bg-purple-500/10"; iconColor = "text-purple-400"; break;
        case "INVESTMENT":
          icon = Wallet; iconBg = "bg-green-500/10"; iconColor = "text-green-400"; break;
      }

      return {
        ...tx,
        rawType: tx.type, // Keep raw type for logic
        icon, iconBg, iconColor, amountColor,
        status, statusColor,
        processedBy: tx.performedBy?.name,
        date: new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        amount: Number(tx.amount)
      };
    });
    setTransactionsData(mappedTxs);
  };

  const handleApiError = (err: any) => {
    console.error("API error:", err);
    if (err.message === "Unauthorized") {
      localStorage.clear();
      router.push("/auth/login");
      return;
    }
    showToast(err.message || "Connection error");
  };

  const loadTabData = async (tab: string, userOverride?: any) => {
    switch (tab) {
      case "Portfolio":
      case "Transactions":
        await Promise.all([fetchPortfolioData(userOverride), fetchWithdrawalHistory()]);
        break;
      case "Referrals":
        await fetchReferralData();
        break;
      case "History":
      case "Invoices":
      case "Withdrawals":
        await fetchWithdrawalHistory();
        break;
    }
  };

  // ── Initialization ──
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return router.push("/auth/login");

      const u = await fetchBaseData();
      if (u) {
        await loadTabData(activeTab, u);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  // ── Tab Refresh ──
  useEffect(() => {
    if (isLoading) return;
    
    loadTabData(activeTab);
  }, [activeTab]);

  // Derive Chart Data - Placeholder if no profit data directly accessible yet
  // Derive Chart Data from real transactions
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const realChartData: { name: string; goldAdvance: number; withdrawable: number }[] = [];

  // Sort transactions by date for cumulative calculation
  const sortedTxsForChart = [...transactionsData].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  for (let i = 5; i >= 0; i--) {
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const label = months[endOfMonth.getMonth()];

    // Transactions up to the end of this month
    const txsUpTo = sortedTxsForChart.filter(tx => new Date(tx.createdAt) <= endOfMonth);
    const latestTx = txsUpTo[txsUpTo.length - 1];
    
    // Total Portfolio = cumulative total of all credits minus debits
    const withdrawable = txsUpTo.reduce((sum, tx) => {
      if (tx.type === "DEPOSIT" || tx.type === "GOLD_ADVANCE" || tx.type === "PROFIT" || tx.type === "REFERRAL") {
        return sum + Number(tx.amount);
      }
      if (tx.type === "WITHDRAWAL") {
        return sum - Number(tx.amount);
      }
      return sum;
    }, 0);
    
    // Total Capital = sum of all DEPOSIT/GOLD_ADVANCE minus capital withdrawals
    const goldAdvance = txsUpTo
      .reduce((sum, tx) => {
        if (tx.type === "DEPOSIT" || tx.type === "GOLD_ADVANCE") {
          return sum + Number(tx.amount);
        }
        if (tx.type === "WITHDRAWAL" && tx.description?.toLowerCase().includes("from gold_advance")) {
          return sum - Number(tx.amount);
        }
        return sum;
      }, 0);

    realChartData.push({ name: label, goldAdvance, withdrawable });
  }

  const activeWithdrawal = withdrawalsList.find(w => w.status === "PENDING");

  const sidebarItems = [
    ...navItems.map(item => ({
      id: item.label,
      name: item.label,
      icon: item.icon,
      badge: item.label === "Withdrawals" && activeWithdrawal ? 1 : undefined,
      badgeColor: "bg-blue-500/20 text-blue-300"
    })),
    { id: "Referrals", name: "Referrals", icon: Plus }
  ];

  const userJson = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userJson ? JSON.parse(userJson) : null;

  const investorUser = {
    name: user?.name || "Verified Customer",
    role: "CUSTOMER",
    details: "Vault Owner",
    icon: ShieldCheck,
    iconBg: "bg-emerald-900",
    iconColor: "text-gold-400",
    borderColor: "border-gold-500/30"
  };

  const totalInvested = Number(userData?.totalGoldAdvanceAmount || 0);
  const mainVaultBalance = Number(userData?.balance || 0);

  return (
    <RoleGuard allowedRoles={["CUSTOMER"]}>
      <div className="min-h-screen bg-emerald-1000 flex">
        <DashboardSidebar
          items={sidebarItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={investorUser}
          onLogout={() => { localStorage.clear(); router.push("/auth/login"); }}
          isMobileOpen={mobileSidebarOpen}
          setIsMobileOpen={setMobileSidebarOpen}
          roleLabel="Vault"
          accentColor="gold"
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative h-screen custom-scrollbar">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[150px] pointer-events-none" />

          <div className="max-w-6xl mx-auto p-4 lg:p-10 pb-24 relative z-10">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 text-gray-400 hover:text-white" onClick={() => setMobileSidebarOpen(true)}>
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white mb-1">
                    Welcome back, <span className="text-gold-400">{user?.name?.split(" ")[0] || "Customer"}</span>
                  </h1>
                  <p className="text-gray-400 text-sm">Your physical gold vault — {activeTab}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                <button onClick={() => showToast("Tax report PDF generating...")}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gold-500/20 text-gray-300 hover:text-white hover:border-gold-500/40 text-sm font-medium transition-all w-full sm:w-auto">
                  <Download className="w-4 h-4" /> Tax Report
                </button>
                <button onClick={() => setShowWithdrawalModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-emerald-1000 text-sm font-bold transition-all w-full sm:w-auto">
                  <ArrowUpRight className="w-4 h-4" /> Request Withdrawal
                </button>
              </div>
            </header>

            {/* ── Tab Content ── */}
            <AnimatePresence mode="wait">

              {/* PORTFOLIO */}
              {activeTab === "Portfolio" && (
                <motion.div key="portfolio" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
                    {[
                      { icon: Wallet, color: "text-gold-400", label: "Main Vault Balance", value: formatCurrency(mainVaultBalance), sub: `Total Withdrawable: ${formatCurrency(mainVaultBalance)}`, subColor: "text-green-400", pill: true },
                      { icon: ShieldCheck, color: "text-gold-400", label: "Total Gold Advance", value: formatCurrency(userData?.totalGoldAdvanceAmount || 0), sub: `Active Capital: ${formatCurrency(userData?.activeGoldAdvanceAmount || 0)}`, subColor: "text-gold-400", pill: false },
                      { icon: TrendingUp, color: "text-blue-400", label: "Total Profit Earned", value: formatCurrency(userData?.profitBalance || 0), sub: "Daily Distribution", subColor: "text-gray-500", pill: false },
                      { icon: ArrowDownRight, color: "text-purple-400", label: "Referral Earnings", value: formatCurrency(userData?.referralBalance || 0), sub: "Total Rewards", subColor: "text-gold-400", pill: false },
                    ].map(({ icon: Icon, color, label, value, sub, subColor, pill }, i) => (
                      <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-emerald-950/40 border border-gold-500/10 p-5 rounded-2xl relative overflow-hidden group hover:border-gold-500/25 transition-all">
                        <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover:opacity-5 transition-opacity" />
                        <div className={`${color} mb-4`}><Icon className="w-6 h-6" /></div>
                        <p className="text-sm text-gray-400 mb-1">{label}</p>
                        <h2 className="text-2xl font-heading font-bold text-white">{value}</h2>
                        <div className={`mt-4 inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full ${pill ? "bg-green-500/10 border border-green-500/20" : ""} ${subColor}`}>{sub}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Chart */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
                        <LineChart className="w-5 h-5 text-gold-400" /> Yield Performance
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          (Total Withdrawable: <span className="text-green-400 font-medium">{formatCurrency(mainVaultBalance)}</span>)
                        </span>
                      </h3>
                    </div>
                    <div className="bg-emerald-950/30 border border-gold-500/10 rounded-2xl p-6 h-[280px] lg:h-[320px] relative overflow-hidden">
                      <div className="absolute inset-0 bg-gold-gradient opacity-5 pointer-events-none" />
                      <YieldChart data={realChartData} />
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-heading font-semibold text-white">Recent Vault Activity</h3>
                      <button onClick={() => setActiveTab("Transactions")} className="text-sm text-gold-500 hover:text-gold-400 transition-colors">View All →</button>
                    </div>
                    <TransactionTable rows={transactionsData.slice(0, 5).map(tx => ({
                      type: tx.type.replace(/_/g, " "),
                      date: new Date(tx.createdAt).toLocaleDateString(),
                      amount: `${tx.type === "WITHDRAWAL" ? "-" : "+"}${formatCurrency(tx.amount)}`,
                      status: tx.status || "Completed",
                      statusColor: tx.status === "PENDING" ? "blue" : "green",
                      icon: tx.icon,
                      iconBg: tx.iconBg,
                      iconColor: tx.iconColor,
                      amountColor: tx.amountColor,
                      balanceAfter: formatCurrency(tx.balanceAfter || 0),
                      rawType: tx.rawType,
                      id: tx.id,
                      description: tx.description
                    }))} onDownload={async (tx) => {
                      const typeLabel = tx.rawType === "WITHDRAWAL" ? "voucher" : "invoice";
                      showToast(`Generating ${typeLabel}...`);
                      try {
                        const token = localStorage.getItem("token");
                        
                        let url = "";
                        if (tx.rawType === "WITHDRAWAL") {
                          const withdrawalId = tx.entityId || tx.id;
                          url = `${API_BASE}/withdrawals/${withdrawalId}/invoice`;
                        } else {
                          // Try entityId first, then description match, then fallback to tx.id
                          const match = tx.description?.match(/#([a-z0-9-]+)/i);
                          const advanceId = tx.entityId || (match ? match[1] : (tx.rawType === "GOLD_ADVANCE" ? tx.id : null));
                          
                          if (!advanceId) {
                            throw new Error("Could not determine Gold Advance reference.");
                          }
                          url = `${API_BASE}/gold-advances/${advanceId}/invoice`;
                        }

                        const res = await fetch(url, {
                          headers: { "Authorization": `Bearer ${token}` }
                        });
                        if (!res.ok) throw new Error(`${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} generation failed.`);
                        const html = await res.text();
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          printWindow.document.write(html);
                          printWindow.document.close();
                          printWindow.focus();
                          setTimeout(() => {
                            printWindow.print();
                          }, 500);
                        }
                      } catch (err: any) {
                        showToast(err.message);
                      }
                    }} />
                  </div>
                </motion.div>
              )}

              {/* TRANSACTIONS */}
              {activeTab === "Transactions" && (
                <motion.div key="transactions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-heading font-bold text-white">Transaction History</h2>
                    <button onClick={() => showToast("Exporting full history...")}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gold-500/20 text-gray-300 hover:text-white text-sm font-medium transition-all">
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                       { label: "Total Gold Advance", value: formatCurrency(userData?.totalGoldAdvanceAmount || 0), color: "text-gold-400" },
                      { label: "Total Yield", value: formatCurrency(userData?.profitBalance || 0), color: "text-green-400" },
                      { label: "Withdrawals", value: formatCurrency(transactionsData.filter(tx => tx.type === "WITHDRAWAL").reduce((sum, tx) => sum + Number(tx.amount || 0), 0)), color: "text-blue-400" },
                      { label: "Net Balance", value: formatCurrency(mainVaultBalance), color: "text-white" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-emerald-950/40 border border-gold-500/10 rounded-2xl p-4">
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        <p className={`text-xl font-heading font-bold ${color}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                  <TransactionTable rows={transactionsData.map(tx => ({
                    type: tx.type.replace(/_/g, " "),
                    date: new Date(tx.createdAt).toLocaleDateString(),
                    amount: `${tx.type === "WITHDRAWAL" ? "-" : "+"}${formatCurrency(tx.amount)}`,
                    status: tx.status || "Completed",
                    statusColor: tx.status === "PENDING" ? "blue" : "green",
                    icon: tx.icon,
                    iconBg: tx.iconBg,
                    iconColor: tx.iconColor,
                    amountColor: tx.amountColor,
                    balanceAfter: formatCurrency(tx.balanceAfter || 0),
                    rawType: tx.rawType,
                    id: tx.id,
                    description: tx.description
                  }))} onDownload={async (tx) => {
                    const typeLabel = tx.rawType === "WITHDRAWAL" ? "voucher" : "invoice";
                    showToast(`Generating ${typeLabel}...`);
                    try {
                      const token = localStorage.getItem("token");
                      
                      let url = "";
                      if (tx.rawType === "WITHDRAWAL") {
                        url = `${API_BASE}/withdrawals/${tx.id}/invoice`;
                      } else {
                        const match = tx.description?.match(/#([a-z0-9-]+)/i);
                        const advanceId = match ? match[1] : (tx.rawType === "GOLD_ADVANCE" ? tx.id : null);
                        
                        if (!advanceId) {
                          throw new Error("Could not determine Gold Advance reference.");
                        }
                        url = `${API_BASE}/gold-advances/${advanceId}/invoice`;
                      }

                      const res = await fetch(url, {
                        headers: { "Authorization": `Bearer ${token}` }
                      });
                      if (!res.ok) throw new Error(`${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} generation failed.`);
                      const html = await res.text();
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(html);
                        printWindow.document.close();
                        printWindow.focus();
                        setTimeout(() => {
                          printWindow.print();
                        }, 500);
                      }
                    } catch (err: any) {
                      showToast(err.message);
                    }
                  }} />
                </motion.div>
              )}

              {/* WITHDRAWALS */}
              {activeTab === "Withdrawals" && (
                <motion.div key="withdrawals" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-heading font-bold text-white">Withdrawal Centre</h2>
                    <button onClick={() => setShowWithdrawalModal(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-emerald-1000 text-sm font-bold transition-all">
                      <ArrowUpRight className="w-4 h-4" /> New Request
                    </button>
                  </div>
                  {/* Active request tracker */}
                  {activeWithdrawal && (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 mb-6 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white font-semibold">Active Withdrawal Request</p>
                          <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">Processing</span>
                        </div>
                        <p className="text-gray-400 text-sm">Requested {new Date(activeWithdrawal.createdAt).toLocaleDateString()} · {formatCurrency(activeWithdrawal.amount)}</p>
                        <div className="mt-3 h-1.5 bg-emerald-900 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-blue-500 rounded-full" initial={{ width: 0 }} animate={{ width: "60%" }} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">Request is currently under review by our finance team.</p>
                      </div>
                    </div>
                  )}

                  {/* History Table */}
                  <div className="bg-emerald-950/40 border border-gold-500/10 rounded-2xl overflow-hidden mb-8">
                    <div className="p-5 border-b border-gold-500/10">
                      <h3 className="text-lg font-bold text-white">Withdrawal History</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-emerald-1000 text-[10px] text-gray-500 uppercase tracking-widest font-bold border-b border-gold-500/10">
                          <tr>
                            <th className="p-4 pl-6">Request ID</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Source</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 pr-6 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gold-500/5">
                          {withdrawalsList.map((w) => (
                            <tr key={w.id} className="hover:bg-emerald-900/20 transition-colors">
                              <td className="p-4 pl-6 font-mono text-xs text-gray-500">{w.id.slice(-8).toUpperCase()}</td>
                              <td className="p-4 font-bold text-white">{formatCurrency(w.amount)}</td>
                              <td className="p-4">
                                <span className="text-[10px] text-gray-400 border border-gold-500/10 px-2 py-0.5 rounded uppercase">{w.source.replace(/_/g, ' ')}</span>
                              </td>
                              <td className="p-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  w.status === "PENDING" ? "bg-blue-500/10 text-blue-400" :
                                  w.status === "APPROVED" ? "bg-green-500/10 text-green-400" :
                                  "bg-red-500/10 text-red-400"
                                }`}>
                                  {w.status}
                                </span>
                              </td>
                              <td className="p-4 pr-6 text-right text-xs text-gray-500">
                                {new Date(w.createdAt).toLocaleDateString("en-IN")}
                              </td>
                            </tr>
                          ))}
                          {withdrawalsList.length === 0 && (
                            <tr><td colSpan={5} className="p-10 text-center text-gray-500 italic text-sm">No withdrawal history found.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Policy */}
                  <div className="bg-emerald-950/30 border border-gold-500/10 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-4">Withdrawal Policy</h3>
                    <div className="space-y-3">
                      {[
                        "Requests are reviewed within 1–2 business days",
                        "Physical cash handover within 7 business days",
                        "Minimum withdrawal amount: ₹10,000",
                        "Partial withdrawals allowed without closing account",
                      ].map((point) => (
                        <div key={point} className="flex items-center gap-3 text-sm text-gray-400">
                          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* REFERRALS */}
              {activeTab === "Referrals" && (
                <motion.div key="referrals" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-heading font-bold text-white">Referral Network</h2>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Total referral earnings</p>
                      <p className="text-2xl font-heading font-bold text-gold-400">{formatCurrency(userData?.referralBalance || 0)}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-950/40 border border-gold-500/10 rounded-2xl p-6 mb-8">
                    <h3 className="text-white font-semibold mb-2">Share your link</h3>
                    <p className="text-gray-400 text-sm mb-4">Earn benefits for every active Gold Advance made by your referrals.</p>
                    <div className="flex gap-2">
                      <input readOnly value={`${typeof window !== "undefined" ? window.location.origin : ""}/auth/register?ref=${user?.id}`}
                        className="flex-1 bg-emerald-1000 border border-gold-500/20 rounded-xl px-4 py-2 text-sm text-gray-300 outline-none" />
                      <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/auth/register?ref=${user?.id}`); showToast("Referral link copied!"); }}
                        className="px-4 py-2 bg-gold-500 text-emerald-1000 rounded-xl text-sm font-bold">Copy</button>
                    </div>
                  </div>
                  <div className="bg-emerald-950/30 border border-gold-500/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-emerald-950/50 border-b border-gold-500/10 text-xs uppercase text-gray-500">
                          <th className="p-4">Customer Name</th>
                          <th className="p-4">Joined Date</th>
                          <th className="p-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold-500/5">
                        {referrals.map((ref, i) => (
                          <tr key={ref.id || i}>
                            <td className="p-4 text-white text-sm">{ref.name}</td>
                            <td className="p-4 text-gray-400 text-sm">{new Date(ref.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 text-right">
                              <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded">Active</span>
                            </td>
                          </tr>
                        ))}
                        {referrals.length === 0 && (
                          <tr><td colSpan={3} className="p-10 text-center text-gray-500 text-sm">No referrals yet. Share your link to start earning!</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </main>

        {/* Modals & Toasts */}
        <AnimatePresence>
          {showWithdrawalModal && (
            <WithdrawalModal
              onClose={() => setShowWithdrawalModal(false)}
              onSuccess={(msg) => { showToast(msg); loadTabData(activeTab); }}
              investedBalance={totalInvested}
              profitBalance={Number(userData?.profitBalance) || 0}
              referralBalance={Number(userData?.referralBalance) || 0}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        </AnimatePresence>
      </div>
    </RoleGuard>
  );
}


