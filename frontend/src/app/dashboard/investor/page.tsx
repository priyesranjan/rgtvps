"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Wallet, TrendingUp, ArrowDownRight, ArrowUpRight, LogOut,
  Download, Plus, Settings, LineChart, ShieldCheck, X,
  Menu, CheckCircle2, Clock, FileText
} from "lucide-react";
import { downloadInvoicePDF } from "@/lib/downloadInvoice";

// Dynamic import prevents SSR which causes -1/-1 dimension bug in Recharts
const YieldChart = dynamic(() => import("@/components/ui/YieldChart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
      Loading chart...
    </div>
  ),
});

/* ─── Mock Data ─── */
const chartDataSets: Record<string, { name: string; yield: number }[]> = {
  "Last 6 Months": [
    { name: "Oct", yield: 12000 }, { name: "Nov", yield: 12400 },
    { name: "Dec", yield: 13100 }, { name: "Jan", yield: 13800 },
    { name: "Feb", yield: 14200 }, { name: "Mar", yield: 14500 },
  ],
  "Year to Date": [
    { name: "Jan", yield: 10200 }, { name: "Feb", yield: 10900 },
    { name: "Mar", yield: 11700 }, { name: "Apr", yield: 12400 },
    { name: "May", yield: 13100 }, { name: "Jun", yield: 13800 },
    { name: "Jul", yield: 14200 }, { name: "Aug", yield: 14900 },
  ],
  "All Time": [
    { name: "2023", yield: 8000 }, { name: "H1 2024", yield: 10500 },
    { name: "H2 2024", yield: 12800 }, { name: "2025", yield: 14500 },
  ],
};

const transactions = [
  { type: "Yield Payout", date: "Mar 10, 2026", amount: "+₹4,100", status: "Completed", statusColor: "green", icon: ArrowDownRight, iconBg: "bg-green-500/10", iconColor: "text-green-400", amountColor: "text-green-400" },
  { type: "Capital Investment", date: "Jan 15, 2026", amount: "₹12,45,000", status: "Processed", statusColor: "green", icon: Plus, iconBg: "bg-gold-500/10", iconColor: "text-gold-400", amountColor: "text-gold-400" },
  { type: "Withdrawal Request", date: "Dec 01, 2025", amount: "-₹50,000", status: "Settled", statusColor: "blue", icon: ArrowUpRight, iconBg: "bg-blue-500/10", iconColor: "text-blue-400", amountColor: "text-white" },
  { type: "Yield Payout", date: "Nov 05, 2025", amount: "+₹3,900", status: "Completed", statusColor: "green", icon: ArrowDownRight, iconBg: "bg-green-500/10", iconColor: "text-green-400", amountColor: "text-green-400" },
];

const invoices = [
  { id: "INV-2026-003", date: "Mar 10, 2026", type: "Yield Payout Receipt", amount: "₹4,100" },
  { id: "INV-2026-001", date: "Jan 15, 2026", type: "Capital Deposit Receipt", amount: "₹12,45,000" },
  { id: "INV-2025-012", date: "Dec 01, 2025", type: "Withdrawal Receipt", amount: "₹50,000" },
  { id: "INV-2025-009", date: "Nov 05, 2025", type: "Yield Payout Receipt", amount: "₹3,900" },
];

function handleInvoiceDownload(inv: typeof invoices[0], showToast: (m: string) => void) {
  downloadInvoicePDF({ ...inv, investorName: "Abhishek Kumar", investorId: "RGT-INV-001" });
  showToast(`${inv.id} downloaded successfully!`);
}

const navItems = [
  { label: "Portfolio", icon: Wallet },
  { label: "Transactions", icon: TrendingUp },
  { label: "Withdrawals", icon: ArrowUpRight },
  { label: "Invoices", icon: FileText },
];

/* ─── Toast ─── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-50 bg-navy-900 border border-green-500/30 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3"
    >
      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
    </motion.div>
  );
}

/* ─── Withdrawal Modal ─── */
function WithdrawalModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        className="bg-navy-900 border border-gold-500/20 rounded-3xl p-8 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-heading font-bold text-white">Request Withdrawal</h2>
            <p className="text-gray-400 text-sm mt-1">Processed within 7 business days.</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="bg-navy-950/60 border border-gold-500/10 rounded-2xl p-4 mb-6">
          <p className="text-xs text-gray-500 mb-1">Available Balance</p>
          <p className="text-2xl font-heading font-bold text-gold-400">₹12,45,000</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Amount (₹)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 50000"
              className="w-full bg-navy-950/50 border border-gold-500/20 focus:border-gold-500/50 text-white rounded-xl py-3 px-4 outline-none transition-all" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Reason (Optional)</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Medical, Business, etc."
              className="w-full bg-navy-950/50 border border-gold-500/20 focus:border-gold-500/50 text-white rounded-xl py-3 px-4 outline-none transition-all resize-none" />
          </div>
          <div className="flex items-start gap-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
            <Clock className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-300">Reviewed in 1–2 days, physically processed within 7 days.</p>
          </div>
          <button
            onClick={() => { if (amount) { onSubmit(); onClose(); } }}
            disabled={!amount}
            className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed text-navy-950 font-bold transition-all"
          >
            Submit Withdrawal Request
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Transaction Table ─── */
function TransactionTable({ rows, onDownload }: { rows: typeof transactions; onDownload: (t: string, idx: number) => void }) {
  return (
    <div className="bg-navy-900/30 border border-gold-500/10 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-navy-900/50 border-b border-gold-500/10 text-xs uppercase tracking-wider text-gray-500 font-medium">
              <th className="p-4 pl-6">Type</th>
              <th className="p-4 hidden sm:table-cell">Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4 hidden md:table-cell">Status</th>
              <th className="p-4 pr-6 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold-500/5">
            {rows.map((tx, i) => (
              <tr key={i} className="hover:bg-navy-800/20 transition-colors">
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
                <td className="p-4 hidden md:table-cell">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tx.statusColor === "green" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  <button onClick={() => onDownload(tx.type, i)} className="text-gold-500 hover:text-gold-400 hover:scale-110 transition-all inline-flex">
                    <Download className="w-4 h-4" />
                  </button>
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
  const [chartPeriod, setChartPeriod] = useState("Last 6 Months");
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b border-gold-500/10">
        <Link href="/" className="text-2xl font-heading font-bold tracking-wider text-white">
          <span className="text-gold-400">RGT</span> Vault
        </Link>
        <div className="mt-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-navy-800 border-2 border-gold-500/30 flex items-center justify-center text-gold-400 font-bold">AK</div>
          <div>
            <p className="text-sm font-medium text-white">Abhishek Kumar</p>
            <p className="text-xs text-green-400 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified Investor</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-6 space-y-1">
        {navItems.map(({ label, icon: Icon }) => (
          <button key={label} onClick={() => { setActiveTab(label); setMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === label ? "bg-gold-500/10 text-gold-400 border border-gold-500/20" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
            <Icon className="w-4 h-4" />
            {label}
            {label === "Withdrawals" && <span className="ml-auto bg-blue-500/20 text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded">1</span>}
          </button>
        ))}
      </nav>
      <div className="p-6 border-t border-gold-500/10 space-y-1">
        <button onClick={() => showToast("Settings coming soon!")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
          <Settings className="w-4 h-4" /> Settings
        </button>
        <Link href="/auth/login">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4" /> Secure Logout
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-950 flex">

      {/* Desktop Sidebar */}
      <aside className="w-72 bg-navy-900/50 border-r border-gold-500/10 hidden lg:flex flex-col relative z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileSidebarOpen(false)}>
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-72 h-full bg-navy-900 border-r border-gold-500/10"
              onClick={(e) => e.stopPropagation()}>
              <SidebarContent />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-6xl mx-auto p-4 lg:p-10 relative z-10">

          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 text-gray-400 hover:text-white" onClick={() => setMobileSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white mb-1">
                  Welcome back, <span className="text-gold-400">Abhishek</span>
                </h1>
                <p className="text-gray-400 text-sm">Your physical gold vault — {activeTab}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => showToast("Tax report PDF generating...")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gold-500/20 text-gray-300 hover:text-white hover:border-gold-500/40 text-sm font-medium transition-all">
                <Download className="w-4 h-4" /> Tax Report
              </button>
              <button onClick={() => setShowWithdrawalModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm font-bold transition-all">
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
                <div className="grid md:grid-cols-3 gap-5 mb-8">
                  {[
                    { icon: Wallet, color: "text-gold-400", label: "Total Vault Balance", value: "₹12,45,000", sub: "+2.4% this month", subColor: "text-green-400", pill: true },
                    { icon: TrendingUp, color: "text-blue-400", label: "Total Yield Earned", value: "₹85,420", sub: "Since Jan 2025", subColor: "text-gray-500", pill: false },
                    { icon: ArrowDownRight, color: "text-purple-400", label: "Next Payout Due", value: "₹4,100", sub: "Due in 5 Days", subColor: "text-gold-400", pill: false },
                  ].map(({ icon: Icon, color, label, value, sub, subColor, pill }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="bg-navy-900/40 border border-gold-500/10 p-6 rounded-2xl relative overflow-hidden group hover:border-gold-500/25 transition-all">
                      <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover:opacity-5 transition-opacity" />
                      <div className={`${color} mb-4`}><Icon className="w-6 h-6" /></div>
                      <p className="text-sm text-gray-400 mb-1">{label}</p>
                      <h2 className="text-3xl font-heading font-bold text-white">{value}</h2>
                      <div className={`mt-4 inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${pill ? "bg-green-500/10 border border-green-500/20" : ""} ${subColor}`}>{sub}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Chart */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-gold-400" /> Yield Performance
                    </h3>
                    <select value={chartPeriod} onChange={(e) => setChartPeriod(e.target.value)}
                      className="bg-navy-900 border border-gold-500/20 text-gray-300 text-sm rounded-lg px-3 py-1.5 outline-none cursor-pointer">
                      {Object.keys(chartDataSets).map((k) => <option key={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="bg-navy-900/30 border border-gold-500/10 rounded-2xl p-6 h-[280px] lg:h-[320px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gold-gradient opacity-5 pointer-events-none" />
                    <YieldChart data={chartDataSets[chartPeriod]} />
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-heading font-semibold text-white">Recent Vault Activity</h3>
                    <button onClick={() => setActiveTab("Transactions")} className="text-sm text-gold-500 hover:text-gold-400 transition-colors">View All →</button>
                  </div>
                  <TransactionTable rows={transactions.slice(0, 3)} onDownload={(t, idx) => {
                    const inv = invoices[idx] ?? { id: `TXN-${idx}`, type: t, date: new Date().toLocaleDateString(), amount: transactions[idx]?.amount ?? "" };
                    handleInvoiceDownload(inv, showToast);
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
                    { label: "Total Deposits", value: "₹12,45,000", color: "text-gold-400" },
                    { label: "Total Yield", value: "₹85,420", color: "text-green-400" },
                    { label: "Withdrawals", value: "₹50,000", color: "text-blue-400" },
                    { label: "Net Balance", value: "₹12,80,420", color: "text-white" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-navy-900/40 border border-gold-500/10 rounded-2xl p-4">
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className={`text-xl font-heading font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
                <TransactionTable rows={transactions} onDownload={(t, idx) => {
                  const inv = invoices[idx] ?? { id: `TXN-${idx}`, type: t, date: new Date().toLocaleDateString(), amount: transactions[idx]?.amount ?? "" };
                  handleInvoiceDownload(inv, showToast);
                }} />
              </motion.div>
            )}

            {/* WITHDRAWALS */}
            {activeTab === "Withdrawals" && (
              <motion.div key="withdrawals" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-bold text-white">Withdrawal Centre</h2>
                  <button onClick={() => setShowWithdrawalModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm font-bold transition-all">
                    <ArrowUpRight className="w-4 h-4" /> New Request
                  </button>
                </div>
                {/* Active request tracker */}
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 mb-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-semibold">Withdrawal #WD-2025-001</p>
                      <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">Processing</span>
                    </div>
                    <p className="text-gray-400 text-sm">Requested Dec 01, 2025 · ₹50,000</p>
                    <div className="mt-3 h-1.5 bg-navy-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full w-[70%]" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">Processing Day 5 of 7</p>
                  </div>
                </div>
                {/* Policy */}
                <div className="bg-navy-900/30 border border-gold-500/10 rounded-2xl p-6">
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

            {/* INVOICES */}
            {activeTab === "Invoices" && (
              <motion.div key="invoices" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-bold text-white">Digital Invoices</h2>
                  <span className="text-xs text-gray-500">Legally valid receipts</span>
                </div>
                <div className="space-y-3">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="bg-navy-900/30 border border-gold-500/10 hover:border-gold-500/25 rounded-2xl p-5 flex items-center justify-between transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gold-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{inv.type}</p>
                          <p className="text-xs text-gray-500">{inv.id} · {inv.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="font-bold text-gold-400">{inv.amount}</p>
                          <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">Issued</span>
                        </div>
                        <button onClick={() => handleInvoiceDownload(inv, showToast)} className="text-gold-500 hover:text-gold-400 hover:scale-110 transition-all">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
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
            onSubmit={() => showToast("Withdrawal request submitted! Processing in 7 days.")}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
