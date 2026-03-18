"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck, Users, Building, Activity, Settings, LogOut,
  Download, AlertTriangle, CheckCircle2, X, Menu, Bell,
  TrendingUp, Eye, Lock, Unlock, Search, RefreshCw, Crown
} from "lucide-react";
import { downloadInvoicePDF } from "@/lib/downloadInvoice";

const AdminAUMChart = dynamic(() => import("@/components/ui/AdminAUMChart"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">Loading chart...</div>,
});

/* ─── Mock Data ─── */
const branches = [
  { id: "B1", name: "Kankarbagh Branch", city: "Patna", manager: "Priya Kumari", employees: 4, clients: 1420, aum: "₹187 Cr", status: "Active" },
  { id: "B2", name: "Boring Road Branch", city: "Patna", manager: "Rahul Sinha", employees: 3, clients: 890, aum: "₹98 Cr", status: "Active" },
  { id: "B3", name: "Gaya Central", city: "Gaya", manager: "Anita Mishra", employees: 2, clients: 560, aum: "₹65 Cr", status: "Active" },
  { id: "B4", name: "Chapra Branch", city: "Chapra", manager: "Vikram Yadav", employees: 2, clients: 340, aum: "₹45 Cr", status: "Inactive" },
];

const allUsers = [
  { id: "RGT-001", name: "Abhishek Kumar", role: "INVESTOR", mobile: "+91 98765 43210", status: "Active", createdBy: "Sanjay Jha", joined: "Jan 15, 2026" },
  { id: "EMP-002", name: "Sanjay Jha", role: "EMPLOYEE", mobile: "+91 87654 32109", status: "Active", createdBy: "System", joined: "Jan 2024" },
  { id: "EMP-001", name: "Priya Kumari", role: "MANAGER", mobile: "+91 76543 21098", status: "Active", createdBy: "System", joined: "Mar 2023" },
  { id: "RGT-002", name: "Priya Sharma", role: "INVESTOR", mobile: "+91 65432 10987", status: "Active", createdBy: "Raunak Singh", joined: "Feb 02, 2026" },
  { id: "EMP-003", name: "Raunak Singh", role: "EMPLOYEE", mobile: "+91 54321 09876", status: "Active", createdBy: "System", joined: "Apr 2024" },
];

const auditLogs = [
  { time: "04:42 AM", action: "Admin login from IP 10.54.x.x (Patna)", type: "warning", user: "Super Admin" },
  { time: "03:15 AM", action: "Daily yield distribution batch completed — 12,450 investors processed", type: "success", user: "System" },
  { time: "02:30 AM", action: 'Branch Manager "Kankarbagh" modified Employee access level', type: "info", user: "Priya Kumari" },
  { time: "Yesterday", action: "Database automated backup verified and stored in cold storage", type: "success", user: "System" },
  { time: "Yesterday", action: "Rate changed on INV-seed-003 from 2.80% → 3.00%", type: "info", user: "Priya Kumari" },
  { time: "Mar 12", action: "New branch 'Chapra' flagged as Inactive — under review", type: "warning", user: "Super Admin" },
  { time: "Mar 10", action: "Bulk yield payout processed: ₹4,100 × 12,450 accounts", type: "success", user: "System" },
];

const aumTrend = [
  { name: "Oct", aum: 320 }, { name: "Nov", aum: 345 }, { name: "Dec", aum: 370 },
  { name: "Jan", aum: 398 }, { name: "Feb", aum: 425 }, { name: "Mar", aum: 450 },
];

const navItems = [
  { id: "overview", name: "Global Command Center", icon: Activity },
  { id: "branches", name: "Branch Management", icon: Building },
  { id: "users", name: "User Management", icon: Users },
  { id: "audit", name: "Audit Logs", icon: AlertTriangle },
  { id: "settings", name: "System Settings", icon: Settings },
];

const roleColor = (role: string) =>
  role === "ADMIN" ? "bg-red-500/10 text-red-400" :
  role === "MANAGER" ? "bg-purple-500/10 text-purple-400" :
  role === "EMPLOYEE" ? "bg-blue-500/10 text-blue-400" :
  "bg-green-500/10 text-green-400";

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
export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [panicMode, setPanicMode] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b border-gold-500/10">
        <Link href="/" className="text-2xl font-heading font-bold tracking-wider text-white">
          <span className="text-gold-400">RGT</span> Admin
        </Link>
        <div className="mt-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-950 border-2 border-red-500/30 flex items-center justify-center text-red-400 font-bold">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Super Admin</p>
            <div className="flex items-center text-xs text-red-400 mt-0.5">
              <ShieldCheck className="w-3 h-3 mr-1" /> Absolute System Access
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
            {item.id === "audit" && <span className="ml-auto bg-yellow-500/20 text-yellow-300 text-[10px] font-bold px-1.5 py-0.5 rounded">2</span>}
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
    <div className={`min-h-screen flex transition-colors ${panicMode ? "bg-red-950" : "bg-navy-950"}`}>
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
        <header className="sticky top-0 z-30 bg-navy-950/90 backdrop-blur-md border-b border-gold-500/10 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-400 hover:text-white p-1" onClick={() => setMobileSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-sm text-gray-400 hidden sm:block">Royal Gold Traders — Global HQ</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => showToast("No new system alerts")} className="relative text-gray-400 hover:text-gold-400 transition-colors">
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
                    <h1 className="text-2xl font-heading font-bold text-white mb-1">Global Command Center</h1>
                    <p className="text-gray-400 text-sm">System-wide metrics across all branches</p>
                  </div>
                  <button onClick={() => { downloadInvoicePDF({ id: "SYS-RPT", type: "Global System Report", date: "Mar 14, 2026", amount: "₹450.2 Cr AUM", investorName: "Super Admin" }); showToast("Global report downloaded!"); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gold-500/20 text-gray-300 hover:text-white text-sm font-medium transition-all">
                    <Download className="w-4 h-4" /> Export
                  </button>
                </div>

                {/* KPI Cards */}
                <div className="grid sm:grid-cols-3 gap-5 mb-7">
                  {[
                    { label: "Total AUM", value: "₹450.2 Cr", status: "↑ Healthy", color: "text-gold-400", border: "border-t-gold-500/50" },
                    { label: "Active Branches", value: "14 Nationwide", status: "✓ Online", color: "text-green-400", border: "border-t-green-500/50" },
                    { label: "Global Investors", value: "12,450", status: "+150 this week", color: "text-blue-400", border: "border-t-blue-500/50" },
                  ].map(({ label, value, status, color, border }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className={`bg-navy-900/40 border border-gold-500/10 border-t-4 ${border} p-6 rounded-2xl hover:border-gold-500/20 transition-all`}>
                      <p className="text-sm text-gray-400 mb-1">{label}</p>
                      <h3 className="text-3xl font-heading font-bold text-white mb-3 tracking-tight">{value}</h3>
                      <span className={`text-xs font-medium ${color} flex items-center gap-1.5`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> {status}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* AUM Chart */}
                <div className="bg-navy-900/40 border border-gold-500/10 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-heading font-semibold text-white mb-5 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-gold-400" /> Global AUM Growth (₹ Crore)
                  </h3>
                  <div className="h-[220px]">
                    <AdminAUMChart data={aumTrend} />
                  </div>
                </div>

                {/* Recent Audit Logs preview */}
                <div className="bg-navy-900/40 border border-gold-500/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-heading font-semibold text-white">Live Audit Feed</h3>
                    <button onClick={() => setActiveTab("audit")} className="text-sm text-gold-500 hover:text-gold-400 transition-colors">View All →</button>
                  </div>
                  <div className="space-y-2">
                    {auditLogs.slice(0, 4).map((log, i) => (
                      <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-gold-500/10">
                        <span className="text-xs text-gray-500 w-24 shrink-0 pt-0.5">{log.time}</span>
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.type === "warning" ? "bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.6)]" : log.type === "success" ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" : "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]"}`} />
                        <span className="text-sm text-gray-300">{log.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── BRANCH MANAGEMENT ── */}
            {activeTab === "branches" && (
              <motion.div key="branches" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-white mb-1">Branch Management</h1>
                    <p className="text-gray-400 text-sm">{branches.length} branches across Bihar</p>
                  </div>
                  <button onClick={() => showToast("New branch creation requires backend setup.")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm font-bold transition-all">
                    <Building className="w-4 h-4" /> Add Branch
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  {branches.map((b) => (
                    <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="bg-navy-900/40 border border-gold-500/10 hover:border-gold-500/25 rounded-2xl p-5 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-white">{b.name}</p>
                          <p className="text-xs text-gray-500">{b.city} · {b.id}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${b.status === "Active" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"}`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[{ label: "Manager", val: b.manager.split(" ")[0] }, { label: "Employees", val: String(b.employees) }, { label: "AUM", val: b.aum }].map(({ label, val }) => (
                          <div key={label} className="text-center bg-navy-800/30 rounded-lg py-2">
                            <p className="text-xs text-gray-500">{label}</p>
                            <p className="text-sm font-bold text-white">{val}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => showToast(`Viewing ${b.name} details...`)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg border border-gold-500/20 text-gray-400 hover:text-gold-400 hover:border-gold-500/40 transition-all">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button onClick={() => showToast(`${b.name} status toggled!`)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg transition-all ${b.status === "Active" ? "border border-orange-500/20 text-orange-400 hover:bg-orange-500/10" : "border border-green-500/20 text-green-400 hover:bg-green-500/10"}`}>
                          {b.status === "Active" ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          {b.status === "Active" ? "Suspend" : "Activate"}
                        </button>
                        <button onClick={() => { downloadInvoicePDF({ id: b.id, type: "Branch Report", date: "Mar 14, 2026", amount: b.aum, investorName: b.manager }); showToast(`${b.name} report downloaded!`); }}
                          className="py-1.5 px-3 text-xs rounded-lg border border-gold-500/20 text-gold-400 hover:bg-gold-500/10 transition-all">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── USER MANAGEMENT ── */}
            {activeTab === "users" && (
              <motion.div key="users" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-white mb-1">User Management</h1>
                    <p className="text-gray-400 text-sm">{allUsers.length} system users across all roles</p>
                  </div>
                </div>
                <div className="relative mb-5">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, ID, or role..."
                    className="w-full bg-navy-900 border border-gold-500/20 text-white rounded-xl py-3 pl-11 pr-4 outline-none focus:border-gold-500/50 transition-all" />
                </div>
                <div className="bg-navy-900/30 border border-gold-500/10 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-navy-900/50 border-b border-gold-500/10">
                        <tr className="text-xs uppercase tracking-wider text-gray-500">
                          <th className="p-4 pl-6">User</th>
                          <th className="p-4">Role</th>
                          <th className="p-4 hidden sm:table-cell">Mobile</th>
                          <th className="p-4 hidden md:table-cell">Created By</th>
                          <th className="p-4 hidden md:table-cell">Status</th>
                          <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold-500/5">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-navy-800/20 transition-colors">
                            <td className="p-4 pl-6">
                              <p className="font-medium text-white text-sm">{u.name}</p>
                              <p className="text-xs text-gray-500">{u.id} · {u.joined}</p>
                            </td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-0.5 rounded font-bold ${roleColor(u.role)}`}>{u.role}</span>
                            </td>
                            <td className="p-4 text-gray-400 text-sm hidden sm:table-cell">{u.mobile}</td>
                            <td className="p-4 text-gray-400 text-sm hidden md:table-cell">{u.createdBy}</td>
                            <td className="p-4 hidden md:table-cell">
                              <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded">{u.status}</span>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => showToast(`Viewing ${u.name}'s profile...`)} className="text-gold-500 hover:text-gold-400 transition-all">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button onClick={() => showToast(`${u.name} access reset — requires backend.`)} className="text-orange-400 hover:text-orange-300 transition-all">
                                  <Lock className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                      <div className="p-10 text-center text-gray-500">No users found for &quot;{searchQuery}&quot;</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── AUDIT LOGS ── */}
            {activeTab === "audit" && (
              <motion.div key="audit" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-white mb-1">Audit Logs</h1>
                    <p className="text-gray-400 text-sm">All system events in real-time</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => showToast("Refreshing audit logs...")} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gold-500/20 text-gray-400 hover:text-white text-sm transition-all">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button onClick={() => { downloadInvoicePDF({ id: "AUDIT-001", type: "System Audit Log", date: "Mar 14, 2026", amount: "Full Log", investorName: "Super Admin" }); showToast("Audit log exported!"); }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gold-500/20 text-gray-300 hover:text-white text-sm transition-all">
                      <Download className="w-4 h-4" /> Export
                    </button>
                  </div>
                </div>
                {/* filter row */}
                <div className="flex gap-2 mb-5">
                  {["All", "Warning", "Success", "Info"].map((f) => (
                    <button key={f} onClick={() => showToast(`Filtered to ${f} logs`)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${f === "All" ? "bg-gold-500/10 border-gold-500/20 text-gold-400" : "border-white/10 text-gray-400 hover:text-white"}`}>
                      {f}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  {auditLogs.map((log, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-navy-900/30 border border-gold-500/10 hover:border-gold-500/20 transition-colors">
                      <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${log.type === "warning" ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" : log.type === "success" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"}`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-200">{log.action}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">{log.time}</span>
                          <span className="text-xs text-gray-600">·</span>
                          <span className="text-xs text-gray-500">by {log.user}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium shrink-0 ${log.type === "warning" ? "bg-yellow-500/10 text-yellow-400" : log.type === "success" ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400"}`}>
                        {log.type.toUpperCase()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── SYSTEM SETTINGS ── */}
            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="mb-7">
                  <h1 className="text-2xl font-heading font-bold text-white mb-1">System Settings</h1>
                  <p className="text-gray-400 text-sm">Global configuration — Admin access only</p>
                </div>
                <div className="space-y-5 max-w-2xl">
                  {/* System Info */}
                  <div className="bg-navy-900/40 border border-gold-500/10 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-4">Platform Identity</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Platform Name", value: "Royal Gold Traders" },
                        { label: "Version", value: "v2.0.0-production" },
                        { label: "Headquarters", value: "Patna, Bihar, India" },
                        { label: "Database", value: "Hostinger MySQL · Connected ✓" },
                        { label: "Active Since", value: "January 2024" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between py-2 border-b border-gold-500/5 last:border-0 text-sm">
                          <span className="text-gray-400">{label}</span>
                          <span className="font-medium text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Global Controls */}
                  <div className="bg-navy-900/40 border border-gold-500/10 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-4">Global Controls</h3>
                    <div className="space-y-4">
                      {[
                        { label: "Nightly yield distribution (cron job)", on: true },
                        { label: "New investor self-registration", on: false },
                        { label: "SMS notifications to all investors", on: true },
                        { label: "Admin login IP whitelist enforcement", on: true },
                        { label: "Database daily auto-backup", on: true },
                      ].map(({ label, on }, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">{label}</span>
                          <button onClick={() => showToast("Toggle saved — requires backend to persist")}
                            className={`w-10 h-5 rounded-full transition-colors relative ${on ? "bg-gold-500" : "bg-navy-800 border border-gold-500/20"}`}>
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Danger Zone */}
                  <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-6">
                    <h3 className="font-semibold text-red-400 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Danger Zone
                    </h3>
                    <div className="space-y-3">
                      {["Force logout all sessions", "Reset all branch monthly lead counts", "Trigger full system backup now"].map((action) => (
                        <button key={action} onClick={() => showToast(`"${action}" — requires backend confirmation.`)}
                          className="w-full py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 transition-all text-left px-4 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 shrink-0" /> {action}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => showToast("System settings saved! (Requires backend to persist)")}
                    className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold transition-all">
                    Save Global Settings
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
