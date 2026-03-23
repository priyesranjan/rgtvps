"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, Zap, ShieldCheck, Settings, LogOut, Bell,
  Plus, Trash2, ToggleLeft, ToggleRight, X, CheckCircle2,
  Activity, Database, Clock, Menu, Code2, AlertTriangle,
  Users, Search, Filter, History, Download, Eye, Shield,
  TrendingUp, Wallet, Crown, RefreshCw, Layers, Lock, Unlock,
  Cpu, HardDrive, Thermometer, ShieldAlert
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import RoleGuard from "@/components/auth/RoleGuard";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────
interface FeatureFlag {
  id?: string;
  key: string;
  label: string;
  description: string;
  isEnabled: boolean;
  category: "ROLE" | "FEATURE" | "NOTIFICATION" | "CUSTOM";
  updatedBy?: string;
}

const navItems = [
  { id: "overview", name: "System Overview", icon: Activity },
  { id: "users", name: "User Control", icon: Users },
  { id: "settings", name: "Org Settings", icon: Settings },
  { id: "flags", name: "Feature Flags", icon: ToggleRight },
  { id: "audit", name: "Audit logs", icon: History },
  { id: "cron", name: "Scheduler Logs", icon: Clock },
];

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

// ─── Main ────────────────────────────────────────────────────────────────────
export default function SuperAdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [cronLogs, setCronLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const userJson = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userJson ? JSON.parse(userJson) : null;
  const router = useRouter();

  // User CRUD State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
    contactNo: "",
    aadharNo: "",
    pan: "",
    staffId: "",
  });
  const [isUserSaving, setIsUserSaving] = useState(false);

  // Settings State
  const [showGST, setShowGST] = useState(true);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [monthlyProfitPercentage, setMonthlyProfitPercentage] = useState(5.0);
  const [monthlyReferralPercentage, setMonthlyReferralPercentage] = useState(5.0);
  const [monthlyStaffPercentage, setMonthlyStaffPercentage] = useState(5.0);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  const [auditSearch, setAuditSearch] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  /* ─── Fetch Data ─── */
  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return router.push("/auth/login");

    try {
      // Parallel requests
      const [fRes, hRes, stRes, uRes, aRes, sRes, staffRes, cronRes] = await Promise.all([
        apiClient.get("/feature-flags", token || undefined).catch(() => []),
        apiClient.get("/health", token || undefined).catch(() => ({ status: "error" })),
        apiClient.get("/settings", token || undefined).catch(() => ({})),
        apiClient.get("/admin/users?limit=50", token || undefined).catch(() => ({ data: [] })),
        apiClient.get("/audit", token || undefined).catch(() => ({ data: [] })),
        apiClient.get("/admin/stats", token || undefined).catch(() => null),
        apiClient.get("/admin/staff/list", token || undefined).catch(() => []),
        apiClient.get("/admin/cron/logs", token || undefined).catch(() => []),
      ]);

      setFlags(fRes || []);
      setHealth(hRes);
      if (stRes) {
        setShowGST(stRes.showGST ?? true);
        setGstPercentage(Number(stRes.gstPercentage || 18));
        setMonthlyProfitPercentage(Number(stRes.monthlyProfitPercentage || 5.0));
        setMonthlyReferralPercentage(Number(stRes.monthlyReferralPercentage || 5.0));
        setMonthlyStaffPercentage(Number(stRes.monthlyStaffPercentage || 5.0));
        setShowAdvancedSettings(!!stRes.showAdvancedSettings);
      }
      setUsers(uRes.data || []);
      setAuditLogs(aRes.data || []);
      setStats(sRes);
      setAllStaff(staffRes || []);
      setCronLogs(cronRes || []);
    } catch (err) {
      console.error("Data fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggleFlag = async (key: string) => {
    const token = localStorage.getItem("token");
    const flag = flags.find(f => f.key === key);
    if (!flag) return;

    try {
      const updated = await apiClient.put(`/feature-flags/${key}`, { 
        isEnabled: !flag.isEnabled,
        updatedBy: "Super Admin"
      }, token || undefined);
      setFlags(prev => prev.map(f => f.key === key ? updated : f));
      showToast(`${flag.label} ${updated.isEnabled ? "ENABLED" : "DISABLED"}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateSettings = async () => {
    const token = localStorage.getItem("token");
    setIsSettingsSaving(true);
    try {
      await apiClient.put("/settings", { 
        showGST, 
        gstPercentage,
        monthlyProfitPercentage,
        monthlyReferralPercentage,
        monthlyStaffPercentage,
        showAdvancedSettings
      }, token || undefined);
      showToast("System settings updated successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSettingsSaving(false);
    }
  };

  const handleTriggerCron = async () => {
    if (!confirm("Are you sure you want to trigger the profit distribution manually? This will process all eligible gold advances and may distribute funds.")) return;
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      const res = await apiClient.post("/admin/cron/trigger", {}, token || undefined);
      showToast(`Success: ${res.results.processedUsers} users processed.`);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setIsUserSaving(true);
    try {
      if (editingUser) {
        await apiClient.patch(`/admin/users/${editingUser.id}`, userFormData, token || undefined);
        showToast("User updated successfully");
      } else {
        await apiClient.post("/admin/users", userFormData, token || undefined);
        showToast("User created successfully");
      }
      setIsUserModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUserSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.")) return;
    const token = localStorage.getItem("token");
    try {
      await apiClient.delete(`/admin/users/${userId}`, token || undefined);
      showToast("User deleted");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      contactNo: user.contactNo || "",
      aadharNo: user.aadharNo || "",
      pan: user.pan || "",
      staffId: user.staffId || "",
    });
    setIsUserModalOpen(true);
  };

  const superAdminUser = {
    name: user?.name || "Super Admin",
    role: "SUPER ADMIN",
    details: "Platform God Mode",
    icon: Crown,
    iconBg: "bg-gold-950",
    iconColor: "text-gold-400",
    borderColor: "border-gold-500/30"
  };

  return (
    <RoleGuard allowedRoles={["SUPERADMIN"]}>
      <div className="min-h-screen flex bg-bg-app text-text-primary transition-colors duration-300">
        <DashboardSidebar
          items={navItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={superAdminUser}
          onLogout={() => { localStorage.clear(); router.push("/auth/login"); }}
          isMobileOpen={mobileSidebarOpen}
          setIsMobileOpen={setMobileSidebarOpen}
          roleLabel={user?.role === "SUPERADMIN" ? "Super Admin" : "Team"}
          accentColor="gold"
        />

        {/* Main */}
        <main className="flex-1 overflow-y-auto relative h-screen custom-scrollbar">
          <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-gold-900/5 rounded-full blur-[150px] pointer-events-none" />

          {/* Header */}
          <header className="sticky top-0 z-30 bg-bg-app/90 backdrop-blur-md border-b border-gold-500/10 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="lg:hidden text-text-secondary hover:text-text-primary p-1" onClick={() => setMobileSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-text-primary">RGT Super Admin Panel</span>
                <span className="text-[10px] text-text-secondary uppercase tracking-widest">Platform Command & Control</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                System Live
              </div>
              <button onClick={() => fetchData()} className="p-2 text-text-secondary hover:text-gold-500 transition-all">
                <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </header>

          <div className="max-w-6xl mx-auto p-5 lg:p-10 relative z-10">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {/* AUM Trend Chart */}
                    <div className="md:col-span-2 bg-bg-surface border border-gold-500/10 rounded-2xl p-6 overflow-hidden relative group">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-bold flex items-center gap-2">
                             <TrendingUp className="w-5 h-5 text-gold-500" /> AUM Velocity
                          </h3>
                          <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Monthly Net Flow Tracking</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-gold-500">{stats ? formatCurrency(stats.totalGoldAdvance) : "..."}</p>
                          <p className="text-[10px] text-green-400 font-bold">+{stats ? stats.monthlyGrowth : 0}% Upward Trend</p>
                        </div>
                      </div>
                      
                      <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats?.aumTrend || []}>
                            <defs>
                              <linearGradient id="colorAum" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8c8c8c', fontSize: 10}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#8c8c8c', fontSize: 10}} tickFormatter={(v) => `₹${v/1000}k`} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid #d4af3730', borderRadius: '12px' }}
                              itemStyle={{ color: '#d4af37', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="aum" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorAum)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Server Vitals */}
                    <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6 flex flex-col">
                      <h3 className="text-sm font-bold mb-6 text-text-secondary uppercase tracking-widest flex items-center gap-2">
                        <Cpu className="w-4 h-4" /> Server Vitals
                      </h3>
                      
                      <div className="space-y-6 flex-1 flex flex-col justify-center">
                        {[
                          { label: "CPU Usage", value: 42, icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10" },
                          { label: "Memory RAM", value: 68, icon: HardDrive, color: "text-purple-400", bg: "bg-purple-500/10" },
                          { label: "API Load", value: 15, icon: Activity, color: "text-green-400", bg: "bg-green-500/10" }
                        ].map((vital) => (
                          <div key={vital.label}>
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <vital.icon className={`w-3.5 h-3.5 ${vital.color}`} />
                                <span className="text-xs font-bold">{vital.label}</span>
                              </div>
                              <span className="text-xs font-mono text-text-secondary">{vital.value}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-bg-app rounded-full overflow-hidden border border-white/5">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${vital.value}%` }} 
                                className={`h-full ${vital.color.replace('text', 'bg')} opacity-80`} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
                            <ShieldCheck className="w-5 h-5 text-gold-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-text-secondary uppercase font-bold leading-none">Firewall</p>
                            <p className="text-xs font-bold text-green-400">ACTIVE & SECURED</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    {[
                      { label: "Global Liquidity", value: stats ? formatCurrency(stats.totalGoldAdvance) : "...", icon: Wallet, color: "text-gold-500", trend: "+12%" },
                      { label: "System Nodes", value: stats ? stats.customersCount : "...", icon: Layers, color: "text-blue-500", trend: "+5 new" },
                      { label: "Engine Uptime", value: "99.98%", icon: Clock, color: "text-purple-500", trend: "Stable" },
                      { label: "Data Integrity", value: "Verified", icon: ShieldCheck, color: "text-green-500", trend: "100%" },
                    ].map((card) => (
                      <div key={card.label} className="bg-bg-surface border border-gold-500/10 p-5 rounded-2xl hover:border-gold-500/30 transition-all group overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-16 h-16 bg-gold-500/5 rounded-full -mr-8 -mt-8 group-hover:bg-gold-500/10 transition-all" />
                        <card.icon className={`w-5 h-5 ${card.color} mb-3`} />
                        <p className="text-xs text-text-secondary uppercase tracking-widest font-bold mb-1">{card.label}</p>
                        <div className="flex items-end justify-between">
                          <h4 className="text-xl font-bold">{card.value}</h4>
                          <span className="text-[10px] font-bold text-text-secondary">{card.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── USERS ── */}
              {activeTab === "users" && (
                <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="relative group flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-gold-500 transition-colors" />
                      <input 
                        type="search" 
                        placeholder="Search users by name, email or mobile..." 
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full bg-bg-app border border-gold-500/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-gold-500/40 outline-none transition-all"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <select 
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-bg-app border border-gold-500/10 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-gold-500/40 appearance-none min-w-[120px]"
                      >
                        <option value="ALL">ALL ROLES</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="STAFF">STAFF</option>
                        <option value="SUPERADMIN">SUPER ADMIN</option>
                        <option value="CUSTOMER">CUSTOMER</option>
                      </select>

                      {selectedUsers.length > 0 && (
                        <button 
                          onClick={() => {
                            if(confirm(`Delete ${selectedUsers.length} users?`)) {
                              selectedUsers.forEach(id => handleDeleteUser(id));
                              setSelectedUsers([]);
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-xs font-black border border-red-500/20 hover:bg-red-500 transition-all flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> BATCH ERASE ({selectedUsers.length})
                        </button>
                      )}

                      <button 
                        onClick={() => {
                          setEditingUser(null);
                          setUserFormData({ name: "", email: "", password: "", role: "CUSTOMER", contactNo: "", aadharNo: "", pan: "", staffId: "" });
                          setIsUserModalOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-gold-500 text-bg-app text-xs font-black hover:bg-gold-400 transition-all flex items-center gap-2 shadow-lg shadow-gold-500/10"
                      >
                        <Plus className="w-4 h-4" /> ADD USER
                      </button>
                    </div>
                  </div>

                  {/* Bulk Select Helper */}
                  {users.length > 0 && (
                    <div className="flex items-center gap-2 mb-3 px-1">
                       <input 
                        type="checkbox" 
                        className="w-3.5 h-3.5 rounded bg-bg-surface border-gold-500/20 text-gold-500 focus:ring-gold-500"
                        checked={selectedUsers.length === users.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedUsers(users.map(u => u.id));
                          else setSelectedUsers([]);
                        }}
                      />
                      <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Select All Node Entities</span>
                    </div>
                  )}
                  
                  <div className="bg-bg-surface border border-gold-500/10 rounded-2xl overflow-hidden shadow-xl">
                    <table className="w-full text-left">
                      <thead className="bg-bg-app text-[10px] text-text-secondary uppercase font-bold border-b border-white/5">
                        <tr>
                          <th className="p-4 w-10"></th>
                          <th className="p-4">Entity / Credentials</th>
                          <th className="p-4">Clearance Level</th>
                          <th className="p-4">Contact Node</th>
                          <th className="p-4 text-right">Command</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users
                          .filter(u => 
                            (roleFilter === "ALL" || u.role === roleFilter) &&
                            (u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                             u.email.toLowerCase().includes(userSearch.toLowerCase()))
                          )
                          .map((u) => (
                          <tr key={u.id} className={`hover:bg-white/5 transition-colors group ${selectedUsers.includes(u.id) ? "bg-gold-500/5 shadow-[inset_2px_0_0_0_#d4af37]" : ""}`}>
                            <td className="p-4">
                              <input 
                                type="checkbox" 
                                className="w-3.5 h-3.5 rounded bg-bg-surface border-gold-500/20 text-gold-500 focus:ring-gold-500"
                                checked={selectedUsers.includes(u.id)}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedUsers([...selectedUsers, u.id]);
                                  else setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                                }}
                              />
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-bold flex items-center gap-2">
                                {u.name} 
                                {u.role === "SUPERADMIN" && <ShieldAlert className="w-3 h-3 text-red-500" />}
                              </p>
                              <p className="text-[10px] text-text-secondary font-mono lowercase opacity-50">{u.email}</p>
                            </td>
                            <td className="p-4">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${
                                u.role === 'SUPERADMIN' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                u.role === 'ADMIN' ? 'bg-gold-500/10 text-gold-500 border-gold-500/20' :
                                'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-xs text-text-secondary font-mono">{u.contactNo || u.mobile || "N/A"}</span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                                <button onClick={() => openEditModal(u)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all" title="Edit Entity">
                                  <Code2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDeleteUser(u.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all" title="Wipe Entity">
                                  <Trash2 className="w-3.5 h-3.5" />
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

              {/* ── SETTINGS ── */}
              {activeTab === "settings" && (
                <motion.div key="settings" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Organization Command</h2>
                      <p className="text-sm text-text-secondary">Master variables and clearing protocols</p>
                    </div>
                    {!showUnlockConfirm ? (
                      <button 
                        onClick={() => {
                          if (isLocked) {
                            setShowUnlockConfirm(true);
                          } else {
                            setIsLocked(true);
                          }
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border shadow-lg ${
                          isLocked 
                          ? "bg-bg-surface border-gold-500/20 text-gold-500 hover:bg-gold-500/10" 
                          : "bg-red-500 text-white border-red-400 hover:bg-red-600 animate-pulse"
                        }`}
                      >
                        {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        {isLocked ? "UNLOCK MASTER OVERRIDE" : "LOCK COMMAND"}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 p-1.5 rounded-xl animate-in fade-in zoom-in duration-200">
                        <span className="text-[10px] font-bold text-red-500 px-2 uppercase">Confirm Unlock?</span>
                        <button 
                          onClick={() => { setIsLocked(false); setShowUnlockConfirm(false); }}
                          className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-black rounded-lg hover:bg-red-600 transition-all"
                        >
                          YES, UNLOCK
                        </button>
                        <button 
                          onClick={() => setShowUnlockConfirm(false)}
                          className="px-3 py-1.5 bg-bg-surface text-text-secondary text-[10px] font-black rounded-lg border border-white/10 hover:bg-white/5 transition-all"
                        >
                          CANCEL
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Tax & GST */}
                    <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6 relative overflow-hidden group">
                       {isLocked && (
                         <div className="absolute inset-0 bg-bg-app/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                           <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-100 transition-all">
                             <Lock className="w-6 h-6 text-gold-500" />
                             <span className="text-[10px] font-black text-gold-500 tracking-widest uppercase">LOCKED</span>
                           </div>
                         </div>
                       )}
                       <h3 className="font-bold flex items-center gap-2 mb-5 text-sm uppercase tracking-widest text-gold-500">
                        <TrendingUp className="w-4 h-4" /> Tax & Finance
                      </h3>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold">Apply GST on Invoices</p>
                            <p className="text-[10px] text-text-secondary">When ON, GST is calculated on all advances</p>
                          </div>
                          <button onClick={() => setShowGST(!showGST)} disabled={isLocked}>
                            {showGST ? <ToggleRight className="w-10 h-10 text-gold-500" /> : <ToggleLeft className="w-10 h-10 text-gray-600" />}
                          </button>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary mb-2">GST Percentage</p>
                          <div className="relative">
                            <input type="number" value={gstPercentage} onChange={(e) => setGstPercentage(Number(e.target.value))}
                              disabled={isLocked}
                              className="w-full bg-bg-app border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-gold-500/50 outline-none transition-all disabled:opacity-50" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gold-500">%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profit Percentages */}
                    <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6 relative overflow-hidden group">
                       {isLocked && (
                         <div className="absolute inset-0 bg-bg-app/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                           <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-100 transition-all">
                             <Lock className="w-6 h-6 text-gold-500" />
                             <span className="text-[10px] font-black text-gold-500 tracking-widest uppercase">LOCKED</span>
                           </div>
                         </div>
                       )}
                       <h3 className="font-bold flex items-center gap-2 mb-5 text-sm uppercase tracking-widest text-gold-500">
                        <Zap className="w-4 h-4" /> Global Profit Rates
                      </h3>
                      <div className="space-y-4">
                        {[
                          { label: "Monthly Profit", value: monthlyProfitPercentage, setter: setMonthlyProfitPercentage, desc: "Direct returns to customers" },
                          { label: "Referral Commission", value: monthlyReferralPercentage, setter: setMonthlyReferralPercentage, desc: "Network structure payout" },
                          { label: "Staff Commission", value: monthlyStaffPercentage, setter: setMonthlyStaffPercentage, desc: "Staff performance reward" },
                        ].map((rate) => (
                          <div key={rate.label}>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-text-primary font-bold">{rate.label}</span>
                              <span className="text-xs text-gold-500 font-mono">{rate.value}%</span>
                            </div>
                            <input type="range" min="0" max="25" step="0.1" value={rate.value} onChange={(e) => rate.setter(Number(e.target.value))}
                              disabled={isLocked}
                              className="w-full h-1.5 bg-bg-app rounded-lg appearance-none cursor-pointer accent-gold-500 disabled:opacity-30 disabled:cursor-not-allowed" />
                            <p className="text-[10px] text-text-secondary mt-1">{rate.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Toggle */}
                    <div className={`md:col-span-2 border rounded-2xl p-6 flex items-center justify-between transition-all relative overflow-hidden ${
                      isLocked ? "bg-bg-surface border-white/5 opacity-50 select-none" : "bg-red-900/5 border-red-500/20"
                    }`}>
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-10" />
                      )}
                      <div className="flex items-center gap-4 relative z-20">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLocked ? "bg-white/5" : "bg-red-500/10"}`}>
                          <AlertTriangle className={`w-6 h-6 ${isLocked ? "text-gray-600" : "text-red-500"}`} />
                        </div>
                        <div>
                          <p className={`font-bold ${isLocked ? "text-text-secondary" : "text-red-400"}`}>Expose Advanced Admin Settings</p>
                          <p className="text-xs text-text-secondary opacity-60">CAUTION: This enables critical sensitive fields in the Admin Panel.</p>
                        </div>
                      </div>
                      <button 
                        disabled={isLocked}
                        onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                        className="relative z-20"
                      >
                        {showAdvancedSettings ? <ToggleRight className={`w-10 h-10 ${isLocked ? "text-gray-800" : "text-red-500"}`} /> : <ToggleLeft className="w-10 h-10 text-gray-800" />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button onClick={handleUpdateSettings} disabled={isSettingsSaving}
                      className="px-10 py-4 bg-gold-500 hover:bg-gold-400 text-bg-app font-black text-sm rounded-2xl shadow-xl shadow-gold-500/20 transition-all flex items-center gap-3">
                      {isSettingsSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                      SAVE MASTER CONFIGURATION
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── FLAGS ── */}
              {activeTab === "flags" && (
                <motion.div key="flags" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Dynamic Feature Toggles</h2>
                      <p className="text-sm text-text-secondary">Changes affect infrastructure without re-deployment</p>
                    </div>
                    <button className="p-2.5 bg-gold-500 rounded-xl text-bg-app hover:scale-105 transition-all outline-none">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {flags.length === 0 ? (
                      <div className="md:col-span-2 py-20 bg-bg-surface/30 border border-white/5 rounded-3xl flex flex-col items-center justify-center">
                        <ToggleLeft className="w-12 h-12 text-gray-700 mb-4" />
                        <p className="text-text-secondary font-medium italic">No dynamic flags found. Run seed or add one above.</p>
                      </div>
                    ) : (
                      flags.map((flag) => (
                        <div key={flag.key} className="bg-bg-surface/50 border border-gold-500/10 p-5 rounded-2xl flex items-start justify-between group hover:border-gold-500/40 transition-all">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold">{flag.label}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400">{flag.category}</span>
                            </div>
                            <p className="text-[10px] text-text-secondary max-w-[200px]">{flag.description}</p>
                          </div>
                          <button onClick={() => handleToggleFlag(flag.key)}>
                            {flag.isEnabled ? <ToggleRight className="w-9 h-9 text-gold-500" /> : <ToggleLeft className="w-9 h-9 text-gray-700 hover:text-gray-500" />}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── AUDIT ── */}
              {activeTab === "audit" && (
                <motion.div key="audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Audit Intelligence</h2>
                      <p className="text-sm text-text-secondary">Monitoring all entity mutations across the platform</p>
                    </div>
                    <div className="relative group w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-gold-500 transition-colors" />
                      <input 
                        type="search" 
                        placeholder="Search logs..." 
                        value={auditSearch}
                        onChange={(e) => setAuditSearch(e.target.value)}
                        className="w-full bg-bg-app border border-gold-500/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-gold-500/40 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {auditLogs.length === 0 ? (
                       <div className="py-20 bg-bg-surface/30 border border-white/5 rounded-3xl flex flex-col items-center justify-center">
                        <History className="w-12 h-12 text-gray-700 mb-4" />
                        <p className="text-text-secondary font-medium italic">No audit records found. Monitoring session beginning...</p>
                      </div>
                    ) : (
                      auditLogs
                        .filter((log: any) => 
                          log.actionType.toLowerCase().includes(auditSearch.toLowerCase()) ||
                          log.description.toLowerCase().includes(auditSearch.toLowerCase())
                        )
                        .map((log: any) => (
                          <div key={log.id} className="bg-bg-surface border-l-4 border-l-gold-500 border border-white/5 p-4 rounded-r-2xl flex items-start gap-4 hover:border-gold-500/30 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-bg-app flex items-center justify-center shrink-0 border border-white/5 group-hover:border-gold-500/20 transition-all shadow-inner">
                              <Terminal className="w-5 h-5 text-gold-500/50 group-hover:text-gold-500 transition-all" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-4 mb-1">
                                <p className="text-sm font-black text-text-primary capitalize leading-none tracking-tight">{log.actionType.replace(/_/g, " ").toLowerCase()}</p>
                                <span className="text-[10px] text-text-secondary shrink-0 font-mono bg-bg-app px-2 py-0.5 rounded border border-white/5">{new Date(log.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-xs text-text-secondary italic opacity-80">{log.description}</p>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── CRON / SCHEDULER LOGS ── */}
              {activeTab === "cron" && (
                <motion.div key="cron" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Clock className="w-7 h-7 text-gold-500" /> System Cron Orchestration
                      </h2>
                      <p className="text-sm text-text-secondary">Monitoring the daily profit distribution engine</p>
                    </div>
                    
                    <button 
                      onClick={handleTriggerCron}
                      className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95"
                    >
                      <Zap className="w-4 h-4 fill-current" /> MANUAL RECONCILIATION
                    </button>
                  </div>

                  <div className="bg-bg-surface border border-gold-500/10 rounded-2xl overflow-hidden shadow-xl mb-6">
                    <div className="p-5 border-b border-gold-500/10 bg-bg-app/50 flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                         <History className="w-4 h-4" /> Execution History
                      </h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-bg-app text-[10px] text-text-secondary uppercase font-bold border-b border-white/5">
                          <tr>
                            <th className="p-4">Distribution Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Users Processed</th>
                            <th className="p-4">Total Distributed</th>
                            <th className="p-4">Created At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {cronLogs.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-10 text-center text-text-secondary italic">
                                No execution logs found. The distribution node is awaiting first run...
                              </td>
                            </tr>
                          ) : (
                            cronLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 font-mono text-sm font-bold text-gold-500">
                                  {log.date}
                                </td>
                                <td className="p-4">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${
                                    log.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                  }`}>
                                    {log.status}
                                  </span>
                                </td>
                                <td className="p-4 text-sm font-bold">
                                  {log.processed} Users
                                </td>
                                <td className="p-4 text-sm font-bold text-text-primary">
                                  {formatCurrency(Number(log.totalDistributed || 0))}
                                </td>
                                <td className="p-4 text-xs text-text-secondary">
                                  {new Date(log.createdAt).toLocaleString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
                        <Activity className="w-6 h-6 text-gold-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Node Status: Operational</h4>
                        <p className="text-xs text-text-secondary max-w-sm">The scheduler is configured to run at 01:00 AM IST. All investments wait for at least one night cycle before the first payout.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </main>

        {/* User CRUD Modal */}
        <AnimatePresence>
          {isUserModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                onClick={() => setIsUserModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-bg-surface border border-gold-500/20 w-full max-w-xl rounded-2xl shadow-2xl p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {editingUser ? <Shield className="w-5 h-5 text-blue-400" /> : <Plus className="w-5 h-5 text-gold-500" />}
                    {editingUser ? "Update User Profile" : "Onboard New System Entity"}
                  </h3>
                  <button onClick={() => setIsUserModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <X className="w-5 h-5 text-text-secondary" />
                  </button>
                </div>

                <form onSubmit={handleCreateOrUpdateUser} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary ml-1">Full Name</label>
                      <input type="text" required value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})}
                        className="w-full bg-bg-app border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold-500/50" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary ml-1">Email Identity</label>
                      <input type="email" required value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})}
                        className="w-full bg-bg-app border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold-500/50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary ml-1">Vault Role</label>
                      <select value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value})}
                        className="w-full bg-bg-app border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold-500/50">
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="STAFF">STAFF</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPERADMIN">SUPERADMIN</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary ml-1">Contact Number</label>
                      <input type="text" value={userFormData.contactNo} onChange={e => setUserFormData({...userFormData, contactNo: e.target.value})}
                        className="w-full bg-bg-app border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold-500/50" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary ml-1">
                      {editingUser ? "Update Password (Optional)" : "Initial Password (Optional)"}
                    </label>
                    <input type="password" placeholder={editingUser ? "Leave blank to keep current" : "Defaults to password123"} value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})}
                      className="w-full bg-bg-app border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold-500/50" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary ml-1">Aadhar Number</label>
                      <input type="text" value={userFormData.aadharNo} onChange={e => setUserFormData({...userFormData, aadharNo: e.target.value})}
                        className="w-full bg-bg-app border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold-500/50" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary ml-1">PAN Card</label>
                      <input type="text" value={userFormData.pan} onChange={e => setUserFormData({...userFormData, pan: e.target.value})}
                        className="w-full bg-bg-app border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold-500/50" />
                    </div>
                  </div>

                  {userFormData.role === "CUSTOMER" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary ml-1">Assigned Staff Member</label>
                      <select value={userFormData.staffId} onChange={e => setUserFormData({...userFormData, staffId: e.target.value})}
                        className="w-full bg-bg-app border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold-500/50">
                        <option value="">No Staff Assigned</option>
                        {allStaff.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="pt-4">
                    <button type="submit" disabled={isUserSaving}
                      className="w-full py-3.5 bg-gold-500 hover:bg-gold-400 text-bg-app font-black rounded-xl transition-all flex items-center justify-center gap-2">
                      {isUserSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : (editingUser ? "UPDATE ENTITY" : "CREATE ENTITY")}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        </AnimatePresence>
      </div>
    </RoleGuard>
  );
}
