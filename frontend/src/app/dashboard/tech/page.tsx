"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Terminal, Zap, ShieldCheck, Settings, LogOut, Bell,
  Plus, Trash2, ToggleLeft, ToggleRight, X, CheckCircle2,
  Activity, Database, Clock, Menu, Code2, AlertTriangle
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  isEnabled: boolean;
  category: "ROLE" | "FEATURE" | "NOTIFICATION" | "CUSTOM";
  updatedBy?: string;
}

// ─── Default flags (mirrors seed.ts) ─────────────────────────────────────────
const defaultFlags: FeatureFlag[] = [
  { key: "MANAGER_ROLE",      label: "Manager Role (Level 3)",       description: "When OFF → only 3 levels: Investor, Employee, Admin",               isEnabled: true,  category: "ROLE",         updatedBy: "System" },
  { key: "REFER_EARN",        label: "Refer & Earn System",          description: "Investors earn referral commissions on referred investor portfolios", isEnabled: true,  category: "FEATURE",      updatedBy: "System" },
  { key: "WITHDRAWALS",       label: "Investor Withdrawals",         description: "Investors can submit withdrawal requests from dashboard",             isEnabled: true,  category: "FEATURE",      updatedBy: "System" },
  { key: "PDF_DOWNLOADS",     label: "PDF Invoice Downloads",        description: "Download PDF invoices and statements",                                isEnabled: true,  category: "FEATURE",      updatedBy: "System" },
  { key: "LEADERBOARD",       label: "Employee Leaderboard",         description: "Show lead leaderboard to Manager and Admin",                          isEnabled: true,  category: "FEATURE",      updatedBy: "System" },
  { key: "WHATSAPP_NOTIFS",   label: "WhatsApp Notifications",       description: "Send WhatsApp messages for deposits, yields, withdrawals",             isEnabled: false, category: "NOTIFICATION", updatedBy: "System" },
  { key: "SMS_ALERTS",        label: "SMS Notifications",            description: "Send real-time SMS alerts for deposits and commissions via 2Factor",   isEnabled: true,  category: "NOTIFICATION", updatedBy: "System" },
  { key: "OTP_LOGIN",         label: "OTP Authentication",           description: "Enable secure 6-digit OTP login for investors",                        isEnabled: true,  category: "FEATURE",      updatedBy: "System" },
  { key: "SELF_REGISTRATION", label: "Investor Self-Registration",   description: "New investors can self-register (currently employee-only)",           isEnabled: false, category: "FEATURE",      updatedBy: "System" },
];

const categoryColor = (c: string) =>
  c === "ROLE" ? "bg-red-500/10 text-red-400 border-red-500/20" :
  c === "NOTIFICATION" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
  c === "CUSTOM" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
  "bg-gold-500/10 text-gold-400 border-gold-500/20";

const navItems = [
  { id: "flags", name: "Feature Flags", icon: ToggleRight },
  { id: "health", name: "System Health", icon: Activity },
  { id: "notes", name: "Deploy Notes", icon: Code2 },
];

// ─── Toast ───────────────────────────────────────────────────────────────────
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

// ─── Flag Toggle Card ─────────────────────────────────────────────────────────
function FlagCard({ flag, onToggle, onDelete }: {
  flag: FeatureFlag;
  onToggle: (key: string) => void;
  onDelete?: (key: string) => void;
}) {
  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className={`bg-navy-900/40 border rounded-2xl p-5 transition-all ${flag.isEnabled ? "border-gold-500/20" : "border-white/5"}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-semibold text-white text-sm">{flag.label}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${categoryColor(flag.category)}`}>
              {flag.category}
            </span>
          </div>
          <p className="text-xs text-gray-500">{flag.description}</p>
          {flag.updatedBy && (
            <p className="text-[10px] text-gray-600 mt-1">Last set by: {flag.updatedBy}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onDelete && flag.category === "CUSTOM" && (
            <button onClick={() => onDelete(flag.key)} className="text-gray-600 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onToggle(flag.key)}
            className={`transition-all ${flag.isEnabled ? "text-gold-400" : "text-gray-600 hover:text-gray-400"}`}>
            {flag.isEnabled
              ? <ToggleRight className="w-9 h-9" />
              : <ToggleLeft className="w-9 h-9" />
            }
          </button>
        </div>
      </div>
      <div className={`text-xs font-semibold mt-1 ${flag.isEnabled ? "text-green-400" : "text-red-400"}`}>
        {flag.isEnabled ? "● ENABLED" : "● DISABLED"}
      </div>
    </motion.div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function TechTeamDashboardPage() {
  const [activeTab, setActiveTab] = useState("flags");
  const [flags, setFlags] = useState<FeatureFlag[]>(defaultFlags);
  const [toast, setToast] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [newFlag, setNewFlag] = useState({ key: "", label: "", description: "" });
  const [addingFlag, setAddingFlag] = useState(false);
  const [notes, setNotes] = useState(`# Deploy Notes — v2.0.0

## 2026-03-14
- Added: Level 5 Tech Team Dashboard with live feature flags
- Added: Refer & Earn system (referral code + commission tracking)
- Updated: Prisma schema v2 — FeatureFlag, Referral, ReferralEarning models
- Updated: TECH_TEAM role added to enum

## 2026-03-13
- Added: Manager Dashboard (Level 3) — full rebuild
- Fixed: BranchBarChart SSR blank chart bug
- Added: Admin Dashboard (Level 4) with Panic Mode

## Next Steps
- [ ] Wire all dashboards to real backend API
- [ ] Deploy backend to Hostinger hosting
- [ ] Push schema to Hostinger MySQL
`);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const handleToggle = (key: string) => {
    setFlags(prev => prev.map(f => {
      if (f.key !== key) return f;
      const next = { ...f, isEnabled: !f.isEnabled, updatedBy: "Tech Lead" };
      showToast(
        next.isEnabled
          ? `✅ "${next.label}" ENABLED — changes live across platform`
          : `🔴 "${next.label}" DISABLED — feature hidden from all users`
      );
      return next;
    }));
    // TODO: POST to /api/flags/:key when backend is connected
  };

  const handleDeleteFlag = (key: string) => {
    const flag = flags.find(f => f.key === key);
    setFlags(prev => prev.filter(f => f.key !== key));
    showToast(`"${flag?.label}" flag removed`);
  };

  const handleAddFlag = () => {
    if (!newFlag.key || !newFlag.label) return;
    const key = newFlag.key.toUpperCase().replace(/\s+/g, "_");
    if (flags.find(f => f.key === key)) { showToast("Flag with this key already exists!"); return; }
    setFlags(prev => [...prev, { ...newFlag, key, isEnabled: true, category: "CUSTOM", updatedBy: "Tech Lead" }]);
    setNewFlag({ key: "", label: "", description: "" });
    setAddingFlag(false);
    showToast(`"${newFlag.label}" custom flag added`);
  };

  const groupedFlags = {
    ROLE: flags.filter(f => f.category === "ROLE"),
    FEATURE: flags.filter(f => f.category === "FEATURE"),
    NOTIFICATION: flags.filter(f => f.category === "NOTIFICATION"),
    CUSTOM: flags.filter(f => f.category === "CUSTOM"),
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b border-gold-500/10">
        <div className="flex items-center gap-3 mb-1">
          <Terminal className="w-6 h-6 text-gold-400" />
          <span className="text-xl font-heading font-bold text-white tracking-wider">Tech <span className="text-gold-400">Team</span></span>
        </div>
        <p className="text-xs text-gray-500 mt-1 ml-9">Level 5 — Platform Control</p>
        <div className="mt-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold-950 border-2 border-gold-500/30 flex items-center justify-center text-gold-400 font-bold">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Tech Lead</p>
            <div className="flex items-center text-xs text-gold-400 mt-0.5">
              <Zap className="w-3 h-3 mr-1" /> Platform God Mode
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
            {item.id === "flags" && (
              <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold">
                {flags.filter(f => f.isEnabled).length}/{flags.length}
              </span>
            )}
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
    <div className="min-h-screen flex bg-navy-950">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-navy-900/50 border-r border-gold-500/10 hidden lg:flex flex-col z-20">
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
        <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-gold-900/5 rounded-full blur-[150px] pointer-events-none" />

        {/* Header */}
        <header className="sticky top-0 z-30 bg-navy-950/90 backdrop-blur-md border-b border-gold-500/10 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-400 hover:text-white p-1" onClick={() => setMobileSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-sm text-gray-400">RGT Platform Control — v2.0.0</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live — changes affect all users
            </div>
            <button onClick={() => showToast("No system alerts")} className="text-gray-400 hover:text-gold-400 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto p-5 lg:p-10 relative z-10">
          <AnimatePresence mode="wait">

            {/* ── FEATURE FLAGS ── */}
            {activeTab === "flags" && (
              <motion.div key="flags" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-white mb-1">Feature Flags</h1>
                    <p className="text-gray-400 text-sm">Toggle any feature live — no code deploy needed</p>
                  </div>
                  <button onClick={() => setAddingFlag(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm font-bold transition-all">
                    <Plus className="w-4 h-4" /> Add Flag
                  </button>
                </div>

                {/* Manager OFF warning */}
                {!flags.find(f => f.key === "MANAGER_ROLE")?.isEnabled && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="my-4 bg-red-950/50 border border-red-500/30 rounded-xl p-3 flex items-center gap-3 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span><strong>Manager Role is DISABLED</strong> — Platform is running with 3 levels only: Investor, Employee, Admin</span>
                  </motion.div>
                )}

                {/* Add Flag Panel */}
                <AnimatePresence>
                  {addingFlag && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="mb-5 bg-navy-900/60 border border-gold-500/20 rounded-2xl p-5 overflow-hidden">
                      <p className="text-white font-semibold text-sm mb-3">Add Custom Feature Flag</p>
                      <div className="grid sm:grid-cols-3 gap-3 mb-3">
                        <input value={newFlag.key} onChange={(e) => setNewFlag(p => ({ ...p, key: e.target.value.toUpperCase().replace(/\s+/g, "_") }))}
                          placeholder="FLAG_KEY" className="bg-navy-800 border border-gold-500/20 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-gold-500/50" />
                        <input value={newFlag.label} onChange={(e) => setNewFlag(p => ({ ...p, label: e.target.value }))}
                          placeholder="Feature Name" className="bg-navy-800 border border-gold-500/20 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-gold-500/50" />
                        <input value={newFlag.description} onChange={(e) => setNewFlag(p => ({ ...p, description: e.target.value }))}
                          placeholder="Description (optional)" className="bg-navy-800 border border-gold-500/20 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-gold-500/50" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleAddFlag}
                          className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm font-bold transition-all">
                          Add Flag
                        </button>
                        <button onClick={() => setAddingFlag(false)} className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 text-sm hover:text-white transition-all">
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Grouped flag sections */}
                {(["ROLE", "FEATURE", "NOTIFICATION", "CUSTOM"] as const).map((cat) =>
                  groupedFlags[cat].length === 0 ? null : (
                    <div key={cat} className="mb-6">
                      <h2 className={`text-xs font-bold uppercase tracking-widest mb-3 px-1 ${
                        cat === "ROLE" ? "text-red-400" :
                        cat === "NOTIFICATION" ? "text-purple-400" :
                        cat === "CUSTOM" ? "text-blue-400" : "text-gold-400"
                      }`}>{cat === "ROLE" ? "🎭 Role Controls" : cat === "FEATURE" ? "⚡ Feature Flags" : cat === "NOTIFICATION" ? "🔔 Notifications" : "🔧 Custom Flags"}</h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {groupedFlags[cat].map((flag) => (
                          <FlagCard key={flag.key} flag={flag} onToggle={handleToggle}
                            onDelete={cat === "CUSTOM" ? handleDeleteFlag : undefined} />
                        ))}
                      </div>
                    </div>
                  )
                )}
              </motion.div>
            )}

            {/* ── SYSTEM HEALTH ── */}
            {activeTab === "health" && (
              <motion.div key="health" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="mb-6">
                  <h1 className="text-2xl font-heading font-bold text-white mb-1">System Health</h1>
                  <p className="text-gray-400 text-sm">Real-time infrastructure status</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-5 mb-6">
                  {[
                    { label: "Frontend (Next.js)", status: "Healthy", latency: "3.6s cold start", icon: Activity, color: "text-green-400" },
                    { label: "Backend API (Express)", status: "Healthy", latency: "localhost:4000", icon: Zap, color: "text-green-400" },
                    { label: "Hostinger MySQL DB", status: "Connected", latency: "Remote · Hostinger", icon: Database, color: "text-green-400" },
                    { label: "Prisma Client", status: "v3 — Up to date", latency: "Client synchronized (OTP)", icon: ShieldCheck, color: "text-green-400" },
                    { label: "Prisma Studio", status: "Running", latency: "localhost:5555", icon: ShieldCheck, color: "text-green-400" },
                    { label: "Next.js Dev Server", status: "Running", latency: "localhost:3000", icon: Terminal, color: "text-green-400" },
                  ].map(({ label, status, latency, icon: Icon, color }) => (
                    <div key={label} className="bg-navy-900/40 border border-gold-500/10 rounded-2xl p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-navy-800 flex items-center justify-center">
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{label}</p>
                          <p className="text-xs text-gray-500">{latency}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${color === "text-green-400" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-navy-900/40 border border-gold-500/10 rounded-2xl p-5">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-gold-400" /> Next Actions Required</h3>
                  <div className="space-y-2 text-sm text-gray-400">
                    {[
                      "Run npx prisma generate to regenerate client with v2 schema",
                      "Run npx prisma db push to push new tables to Hostinger MySQL",
                      "Run npm run db:seed to seed default FeatureFlags & Tech Team account",
                      "Wire frontend dashboards to real API (replace mock data)",
                    ].map((action, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-navy-800/30 transition-colors">
                        <span className="w-5 h-5 rounded bg-gold-500/10 text-gold-400 text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">{i + 1}</span>
                        <span className="font-mono text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── DEPLOY NOTES ── */}
            {activeTab === "notes" && (
              <motion.div key="notes" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-white mb-1">Deploy Notes</h1>
                    <p className="text-gray-400 text-sm">Internal tech team notes and changelogs</p>
                  </div>
                  <button onClick={() => showToast("Notes saved!")}
                    className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm font-bold transition-all">
                    Save Notes
                  </button>
                </div>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[500px] bg-navy-900/40 border border-gold-500/10 text-gray-300 rounded-2xl p-6 text-sm font-mono outline-none focus:border-gold-500/30 resize-none leading-relaxed"
                  spellCheck={false} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
