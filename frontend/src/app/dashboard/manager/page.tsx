"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  BarChart as BarChartIcon, Users, TrendingUp, Activity,
  Settings, LogOut, ArrowUpRight, ArrowDownRight, Briefcase,
  Download, CheckCircle2, X, Menu, Phone, IndianRupee,
  Star, Target, Bell, MapPin
} from "lucide-react";
import { downloadInvoicePDF } from "@/lib/downloadInvoice";

/* ─── Dynamic Chart Imports (ssr:false prevents blank -1x-1 bug) ─── */
const BranchBarChart = dynamic(() => import("@/components/ui/BranchBarChart"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">Loading chart...</div>,
});
const NetFlowChart = dynamic(() => import("@/components/ui/NetFlowChart"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">Loading chart...</div>,
});

/* ─── Mock Data ─── */
const weeklyData = [
  { name: "Mon", deposits: 4200, withdrawals: 2400 },
  { name: "Tue", deposits: 3100, withdrawals: 1398 },
  { name: "Wed", deposits: 5200, withdrawals: 2100 },
  { name: "Thu", deposits: 2780, withdrawals: 3908 },
  { name: "Fri", deposits: 4890, withdrawals: 1800 },
  { name: "Sat", deposits: 3390, withdrawals: 2200 },
  { name: "Sun", deposits: 2490, withdrawals: 1300 },
];

const monthlyNetFlow = [
  { name: "Oct", net: 18000 }, { name: "Nov", net: 22000 },
  { name: "Dec", net: 19500 }, { name: "Jan", net: 28000 },
  { name: "Feb", net: 31000 }, { name: "Mar", net: 36000 },
];

const employees = [
  { name: "Sanjay Jha", avatar: "SJ", deposits: 42, amount: "₹1.2 Cr", target: 50, rating: 4.8, joined: "Jan 2024", status: "Active" },
  { name: "Ravi Kumar", avatar: "RK", deposits: 38, amount: "₹95 L", target: 50, rating: 4.5, joined: "Mar 2024", status: "Active" },
  { name: "Amit Singh", avatar: "AS", deposits: 31, amount: "₹88 L", target: 50, rating: 4.2, joined: "Jun 2024", status: "Active" },
  { name: "Neha Sharma", avatar: "NS", deposits: 24, amount: "₹65 L", target: 50, rating: 3.9, joined: "Sep 2024", status: "Active" },
];

const navItems = [
  { id: "overview", name: "Branch Overview", icon: Activity },
  { id: "employees", name: "Employee Performance", icon: Users },
  { id: "reports", name: "Financial Reports", icon: BarChartIcon },
  { id: "settings", name: "Branch Settings", icon: Settings },
];

/* ─── Toast ─── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-50 bg-navy-900 border border-green-500/30 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3">
      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 text-gray-500 hover:text-white" /></button>
    </motion.div>
  );
}

/* ─── Main ─── */
export default function ManagerDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b border-gold-500/10">
        <Link href="/" className="text-2xl font-heading font-bold tracking-wider text-white">
          <span className="text-gold-400">RGT</span> Analytics
        </Link>
        <div className="mt-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-navy-800 border-2 border-gold-500/30 flex items-center justify-center text-purple-400 font-bold">PK</div>
          <div>
            <p className="text-sm font-medium text-white">Priya Kumari</p>
            <div className="flex items-center text-xs text-purple-400 mt-0.5">
              <Briefcase className="w-3 h-3 mr-1" /> Branch Manager
            </div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-6 space-y-1">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? "bg-gold-500/10 text-gold-400 border border-gold-500/20" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
            <item.icon className="w-4 h-4" />
            {item.name}
          </button>
        ))}
      </nav>
      <div className="p-6 border-t border-gold-500/10">
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
            className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileSidebarOpen(false)}>
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-72 h-full bg-navy-900 border-r border-gold-500/10" onClick={(e) => e.stopPropagation()}>
              <SidebarContent />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />

        {/* Sticky Header */}
        <header className="sticky top-0 z-30 bg-navy-950/90 backdrop-blur-md border-b border-gold-500/10 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-400 hover:text-white p-1" onClick={() => setMobileSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <MapPin className="w-4 h-4 text-gold-500" />
              <span className="hidden sm:inline">Patna HQ Branch</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => showToast("No new alerts")} className="relative text-gray-400 hover:text-gold-400 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button onClick={() => showToast("Exporting weekly branch report...")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gold-500/20 text-gray-300 hover:text-white text-sm font-medium transition-all">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-5 lg:p-10 relative z-10">
          <AnimatePresence mode="wait">

            {/* ── BRANCH OVERVIEW ── */}
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="mb-8">
                  <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white mb-1">Branch Analytics</h1>
                  <p className="text-gray-400 text-sm">Monitoring Patna HQ — Weekly Performance Metrics</p>
                </div>

                {/* KPI Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                  {[
                    { label: "Total Deposits (Week)", value: "₹4.2 Cr", trend: "+12.5%", positive: true, icon: TrendingUp, color: "text-green-400" },
                    { label: "Total Withdrawals", value: "₹85 Lakh", trend: "-2.4%", positive: true, icon: ArrowDownRight, color: "text-blue-400" },
                    { label: "Active Clients", value: "1,420", trend: "+45 this week", positive: true, icon: Users, color: "text-purple-400" },
                    { label: "Avg Ticket Size", value: "₹5.5 L", trend: "+1.2%", positive: true, icon: IndianRupee, color: "text-gold-400" },
                  ].map(({ label, value, trend, positive, icon: Icon, color }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="bg-navy-900/40 border border-gold-500/10 p-5 rounded-2xl group hover:border-gold-500/20 transition-all">
                      <div className={`${color} mb-3`}><Icon className="w-5 h-5" /></div>
                      <p className="text-sm text-gray-400 mb-1">{label}</p>
                      <h3 className="text-2xl font-heading font-bold text-white mb-2">{value}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${positive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {trend}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Charts row */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                  <div className="lg:col-span-2 bg-navy-900/40 border border-gold-500/10 rounded-2xl p-6">
                    <h3 className="text-lg font-heading font-semibold text-white mb-5 flex items-center gap-2">
                      <BarChartIcon className="w-5 h-5 text-gold-400" /> Cash Flow — This Week
                    </h3>
                    <div className="h-[280px]">
                      <BranchBarChart data={weeklyData} />
                    </div>
                  </div>
                  <div className="bg-navy-900/40 border border-gold-500/10 rounded-2xl p-6">
                    <h3 className="text-lg font-heading font-semibold text-white mb-5">Top Employees</h3>
                    <div className="space-y-3">
                      {employees.map((emp, i) => (
                        <div key={emp.name} onClick={() => setActiveTab("employees")}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-gold-500/10 cursor-pointer transition-all">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-9 h-9 rounded-full bg-navy-800 border border-gold-500/20 flex items-center justify-center text-xs font-bold text-gray-300">{emp.avatar}</div>
                              {i === 0 && <Star className="absolute -top-1 -right-1 w-3.5 h-3.5 text-gold-400 fill-gold-400" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{emp.name}</p>
                              <p className="text-xs text-gray-400">{emp.deposits} deposits</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gold-400">{emp.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Alerts */}
                <div className="bg-navy-900/30 border border-gold-500/10 rounded-2xl p-6">
                  <h3 className="text-lg font-heading font-semibold text-white mb-4">Branch Alerts</h3>
                  <div className="space-y-3">
                    {[
                      { msg: "2 withdrawal requests pending approval for over 5 days", type: "warn" },
                      { msg: "Client RGT-004 KYC documents pending verification", type: "warn" },
                      { msg: "Monthly yield payout of ₹4,100 disbursed to RGT-001", type: "ok" },
                      { msg: "New investment of ₹2.5L processed by Sanjay Jha", type: "ok" },
                    ].map(({ msg, type }, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${type === "warn" ? "bg-orange-500/5 border border-orange-500/20" : "bg-green-500/5 border border-green-500/20"}`}>
                        {type === "warn" ? <ArrowUpRight className="w-4 h-4 text-orange-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
                        <p className="text-sm text-gray-300">{msg}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── EMPLOYEE PERFORMANCE ── */}
            {activeTab === "employees" && (
              <motion.div key="employees" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center justify-between mb-7">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-white mb-1">Employee Performance</h1>
                    <p className="text-gray-400 text-sm">Kankarbagh branch — this week's metrics</p>
                  </div>
                  <button onClick={() => showToast("Performance report exported!")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gold-500/20 text-gray-300 hover:text-white text-sm transition-all">
                    <Download className="w-4 h-4" /> Export
                  </button>
                </div>
                <div className="space-y-4">
                  {employees.map((emp, i) => (
                    <motion.div key={emp.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="bg-navy-900/40 border border-gold-500/10 rounded-2xl p-5 hover:border-gold-500/20 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-navy-800 border-2 border-gold-500/30 flex items-center justify-center font-bold text-gold-400">{emp.avatar}</div>
                            {i === 0 && <Star className="absolute -top-1 -right-1 w-4 h-4 text-gold-400 fill-gold-400" />}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{emp.name}</p>
                            <p className="text-xs text-gray-500">Joined {emp.joined} · {emp.status}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-right sm:text-right">
                          <div>
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="font-bold text-gold-400">{emp.amount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Rating</p>
                            <p className="font-bold text-yellow-400">⭐ {emp.rating}</p>
                          </div>
                          <button onClick={() => showToast(`${emp.name}'s detailed profile coming with backend!`)}
                            className="px-3 py-1.5 rounded-lg border border-gold-500/20 text-gold-400 text-xs hover:bg-gold-500/10 transition-all">
                            View
                          </button>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                          <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Weekly Target</span>
                          <span>{emp.deposits}/{emp.target} deposits</span>
                        </div>
                        <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(emp.deposits / emp.target) * 100}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className={`h-full rounded-full ${emp.deposits >= emp.target * 0.8 ? "bg-gold-500" : "bg-blue-500"}`} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── FINANCIAL REPORTS ── */}
            {activeTab === "reports" && (
              <motion.div key="reports" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center justify-between mb-7">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-white mb-1">Financial Reports</h1>
                    <p className="text-gray-400 text-sm">Branch-level monthly analytics</p>
                  </div>
                </div>

                {/* Net Flow Chart */}
                <div className="bg-navy-900/40 border border-gold-500/10 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-heading font-semibold text-white mb-5 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-gold-400" /> Net Cash Flow — Last 6 Months
                  </h3>
                  <div className="h-[260px]">
                    <NetFlowChart data={monthlyNetFlow} />
                  </div>
                </div>

                {/* Report Downloads */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { title: "Weekly Branch Report", desc: "Deposits, withdrawals & net flow this week", period: "Mar 8–14, 2026" },
                    { title: "Monthly P&L Statement", desc: "Revenue, expenses, and profit calculations", period: "February 2026" },
                    { title: "Client Growth Report", desc: "New registrations and churned clients", period: "Q1 2026" },
                    { title: "Employee Performance", desc: "Individual targets vs achievements", period: "March 2026" },
                    { title: "Yield Disbursement Log", desc: "All yield payouts processed this month", period: "March 2026" },
                    { title: "Compliance Report", desc: "KYC status and pending verifications", period: "March 2026" },
                  ].map((r) => (
                    <div key={r.title} className="bg-navy-900/30 border border-gold-500/10 hover:border-gold-500/25 rounded-2xl p-5 flex items-center justify-between transition-all">
                      <div>
                        <p className="font-medium text-white text-sm mb-1">{r.title}</p>
                        <p className="text-xs text-gray-500">{r.desc}</p>
                        <p className="text-xs text-gold-400 mt-1">{r.period}</p>
                      </div>
                      <button onClick={() => {
                        downloadInvoicePDF({ id: `RPT-${Date.now()}`, type: r.title, date: r.period, amount: "Branch Report", investorName: "Priya Kumari", investorId: "MGR-001" });
                        showToast(`${r.title} downloaded!`);
                      }} className="text-gold-500 hover:text-gold-400 hover:scale-110 transition-all ml-4 shrink-0">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── BRANCH SETTINGS ── */}
            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="mb-7">
                  <h1 className="text-2xl font-heading font-bold text-white mb-1">Branch Settings</h1>
                  <p className="text-gray-400 text-sm">Configure Kankarbagh branch operational parameters.</p>
                </div>
                <div className="space-y-5 max-w-2xl">
                  {/* Branch Info */}
                  <div className="bg-navy-900/40 border border-gold-500/10 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-5">Branch Information</h3>
                    <div className="space-y-4">
                      {[
                        { label: "Branch Name", value: "Kankarbagh Branch" },
                        { label: "Branch Code", value: "RGT-PNA-001" },
                        { label: "City", value: "Patna, Bihar" },
                        { label: "Branch Contact", value: "+91 9876543210" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between py-2 border-b border-gold-500/5 last:border-0">
                          <span className="text-sm text-gray-400">{label}</span>
                          <span className="text-sm font-medium text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Yield Plans */}
                  <div className="bg-navy-900/40 border border-gold-500/10 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-5">Active Yield Plans</h3>
                    <div className="space-y-3">
                      {[
                        { plan: "Standard Daily Yield", rate: "2.5% Monthly", clients: 981, active: true },
                        { plan: "Premium Weekly Yield", rate: "3.0% Monthly", clients: 312, active: true },
                        { plan: "Locked Monthly Yield", rate: "4.5% Monthly", clients: 127, active: true },
                      ].map(({ plan, rate, clients, active }) => (
                        <div key={plan} className="flex items-center justify-between p-3 rounded-xl bg-navy-800/30 border border-gold-500/10">
                          <div>
                            <p className="text-sm font-medium text-white">{plan}</p>
                            <p className="text-xs text-gray-500">{clients} clients enrolled</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gold-400">{rate}</span>
                            <button onClick={() => showToast(`${plan} settings require backend access.`)}
                              className={`text-xs px-2.5 py-1 rounded-lg ${active ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-gray-500/10 text-gray-400"}`}>
                              {active ? "Active" : "Inactive"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Notification Prefs */}
                  <div className="bg-navy-900/40 border border-gold-500/10 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-5">Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { label: "Daily deposit summary SMS", on: true },
                        { label: "Withdrawal alerts", on: true },
                        { label: "New client registration alerts", on: false },
                        { label: "Weekly P&L email report", on: true },
                      ].map(({ label, on }, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">{label}</span>
                          <button onClick={() => showToast(`Notification preference updated — requires backend.`)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${on ? "bg-gold-500" : "bg-navy-800 border border-gold-500/20"}`}>
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => showToast("Settings saved! (Requires backend to persist)")}
                    className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold transition-all">
                    Save Settings
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
