"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Users, UserPlus, ClipboardList, ArrowLeftRight, FileText,
  Search, Bell, ShieldCheck, LogOut, Download, MapPin, BadgeCheck,
  CheckCircle2, X, Clock, AlertCircle, Eye, Phone, IndianRupee, Menu, Loader2
} from "lucide-react";
import { downloadInvoicePDF } from "@/lib/downloadInvoice";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

const navItems = [
  { id: "new-advance", name: "Process Gold Advance", icon: UserPlus },
  { id: "withdrawals", name: "Manage Withdrawals", icon: ArrowLeftRight },
  { id: "clients", name: "Client Database", icon: Users },
  { id: "bills", name: "Generate Bills", icon: FileText },
  { id: "history", name: "Transaction Log", icon: ClipboardList },
];

/* ─── Toast ─── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-green-500/30 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3">
      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 text-gray-500 hover:text-white" /></button>
    </motion.div>
  );
}

/* ─── Main ─── */
export default function EmployeeDashboardPage() {
  const [activeTab, setActiveTab] = useState("new-advance");
  const [toast, setToast] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const router = useRouter();
  
  // Data State
  const [clients, setClients] = useState<any[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [txLog, setTxLog] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState({ 
    userId: "",
    mobile: "", 
    firstName: "", 
    lastName: "", 
    amount: "", 
    description: "Manual Cash Deposit",
    plan: "Standard Daily Yield (2.5% Monthly)" 
  });
  const [billGenerated, setBillGenerated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const fetchClients = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await apiClient.get("/staff/customers", token);
      setClients(res.data || res);
    } catch (err: any) {
      console.error("Fetch clients failed:", err);
    }
  };

  const fetchWithdrawals = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await apiClient.get("/withdrawals/staff", token);
      setWithdrawalRequests(res.data || res);
    } catch (err: any) {
      console.error("Fetch withdrawals failed:", err);
    }
  };

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await apiClient.get("/staff/transactions", token);
      setTxLog(res.data || res);
    } catch (err: any) {
      console.error("Fetch transactions failed:", err);
    }
  };

  const loadTabData = async (tab: string) => {
    if (tab === "new-advance") {
      // No data needed upfront
    } else if (tab === "withdrawals") {
      await fetchWithdrawals();
    } else if (tab === "clients" || tab === "bills") {
      await fetchClients();
    } else if (tab === "history") {
      await fetchTransactions();
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }
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

  const fetchStaffData = async () => {
    await loadTabData(activeTab);
  };

  const handleLookupUser = async () => {
    if (!formState.mobile || formState.mobile.length < 10) return;
    try {
      const user = await apiClient.get(`/auth/lookup-referrer?mobile=${formState.mobile}`);
      setFormState(prev => ({
        ...prev,
        userId: user.id,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ').slice(1).join(' ')
      }));
      showToast("User found!");
    } catch (err) {
      showToast("User not found. Please register them first.");
    }
  };

  const handleGenerateBill = async () => {
    if (!formState.userId || !formState.amount) {
      showToast("Please lookup user and enter amount first!");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      await apiClient.post("/gold-advances/admin/create", {
        userId: formState.userId,
        amount: Number(formState.amount),
        description: formState.description
      }, token || undefined);

      setBillGenerated(true);
      showToast("Gold Advance processed successfully!");
      fetchStaffData(); // Refresh logs
    } catch (err: any) {
      showToast(err.message || "Failed to process advance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadBill = () => {
    downloadInvoicePDF({
      id: `INV-${Date.now()}`,
      type: "Gold Advance Receipt",
      date: new Date().toLocaleDateString("en-IN"),
      amount: formatCurrency(Number(formState.amount)),
      investorName: `${formState.firstName} ${formState.lastName}`.trim(),
      investorId: formState.userId.slice(-6).toUpperCase(),
    });
    showToast("Gold advance receipt downloaded!");
  };

  const filteredClients = clients.filter(c =>
    (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.mobile || "").includes(searchQuery)
  );

  const employeeUser = {
    name: "Sanjay Jha", // In real app, get from auth context
    role: "EMPLOYEE",
    details: "Branch Executive",
    icon: BadgeCheck,
    iconBg: "bg-emerald-900",
    iconColor: "text-gold-400",
    borderColor: "border-gold-500/30"
  };

  const sidebarItems = navItems.map(item => ({
    ...item,
    badge: item.id === "withdrawals" ? withdrawalRequests.length : undefined,
    badgeColor: "bg-orange-500/20 text-orange-300"
  }));

  return (
    <div className="min-h-screen bg-emerald-1000 flex">
      <DashboardSidebar
        items={sidebarItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={employeeUser}
        onLogout={() => { localStorage.clear(); router.push("/auth/login"); }}
        isMobileOpen={mobileSidebarOpen}
        setIsMobileOpen={setMobileSidebarOpen}
        roleLabel="Office"
        accentColor="gold"
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative h-screen custom-scrollbar">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 bg-emerald-1000/90 backdrop-blur-md border-b border-gold-500/10 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-400 hover:text-white p-1" onClick={() => setMobileSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <MapPin className="w-4 h-4 text-gold-500" />
              <span className="hidden sm:inline">Kankarbagh Branch, Patna</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search client..." onClick={() => setActiveTab("clients")}
                className="bg-emerald-950 border border-gold-500/20 text-white text-sm rounded-full pl-10 pr-4 py-2 w-52 focus:outline-none focus:border-gold-500/50 transition-all" />
            </div>
            <button className="relative text-gray-400 hover:text-gold-400 transition-colors" onClick={() => showToast("No new notifications")}>
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <div className="p-5 lg:p-10 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">

            {/* ── PROCESS GOLD ADVANCE ── */}
            {activeTab === "new-advance" && (
              <motion.div key="advance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center justify-between mb-7">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white mb-1">Process New Gold Advance</h1>
                    <p className="text-gray-400 text-sm">Register physical cash deposits and allocate gold assets.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-sm font-medium">
                    <ShieldCheck className="w-4 h-4" /> Secure Terminal
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Form */}
                  <div className="bg-emerald-950/60 border border-gold-500/20 p-7 rounded-2xl shadow-xl">
                    <h2 className="text-lg font-heading font-semibold text-white mb-5 border-b border-gold-500/10 pb-4">Client Details</h2>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-300">Client Mobile Number</label>
                        <div className="relative flex gap-2">
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input type="tel" value={formState.mobile} onChange={(e) => setFormState({ ...formState, mobile: e.target.value })} placeholder="9876543210"
                              className="w-full bg-emerald-1000 border border-gold-500/20 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-gold-500/60 transition-colors" />
                          </div>
                          <button 
                            onClick={handleLookupUser}
                            className="px-4 py-2 bg-emerald-900 border border-gold-500/30 text-gold-400 rounded-xl text-sm font-medium hover:bg-emerald-800 transition-colors"
                          >
                            Lookup
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-300">First Name</label>
                          <input type="text" value={formState.firstName} onChange={(e) => setFormState({ ...formState, firstName: e.target.value })}
                            className="w-full bg-emerald-1000 border border-gold-500/20 text-white rounded-xl py-3 px-4 outline-none focus:border-gold-500/60" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-300">Last Name</label>
                          <input type="text" value={formState.lastName} onChange={(e) => setFormState({ ...formState, lastName: e.target.value })}
                            className="w-full bg-emerald-1000 border border-gold-500/20 text-white rounded-xl py-3 px-4 outline-none focus:border-gold-500/60" />
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-3 border-t border-gold-500/10">
                        <label className="text-sm font-medium text-gray-300">Physical Cash Deposited (₹)</label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
                          <input type="number" value={formState.amount} onChange={(e) => setFormState({ ...formState, amount: e.target.value })} placeholder="Enter amount"
                            className="w-full bg-emerald-1000 border-2 border-gold-500/30 text-gold-400 font-bold text-lg rounded-xl py-4 pl-10 pr-4 outline-none focus:border-gold-500 transition-all" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-300">Assign Yield Plan</label>
                        <select value={formState.plan} onChange={(e) => setFormState({ ...formState, plan: e.target.value })}
                          className="w-full bg-emerald-1000 border border-gold-500/20 text-white rounded-xl py-3.5 px-4 outline-none focus:border-gold-500/60">
                          <option>Standard Daily Yield (2.5% Monthly)</option>
                          <option>Premium Weekly Yield (3.0% Monthly)</option>
                          <option>Locked Monthly Yield (4.5% Monthly)</option>
                        </select>
                      </div>
                      <button onClick={handleGenerateBill}
                        className="w-full py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-emerald-1000 font-bold text-base shadow-gold-glow transition-all mt-2">
                        Verify & Generate Bill
                      </button>
                    </div>
                  </div>

                  {/* Bill Preview */}
                  <div className="bg-white/3 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    {!billGenerated ? (
                      <>
                        <div className="w-20 h-20 rounded-full bg-emerald-950 border border-gold-500/20 flex items-center justify-center mb-5">
                          <FileText className="w-8 h-8 text-gold-500" />
                        </div>
                        <h3 className="text-xl font-heading font-semibold text-white mb-2">Digital Bill Preview</h3>
                        <p className="text-gray-400 text-sm max-w-xs">Fill the form and click &quot;Verify &amp; Generate Bill&quot; to preview the official receipt.</p>
                      </>
                    ) : (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
                        <div className="w-full bg-white rounded-xl shadow-2xl p-6 text-left mb-4">
                          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-widest">Royal Gold Traders</p>
                              <p className="text-xs text-gray-400">Kankarbagh Branch, Patna</p>
                            </div>
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold">VERIFIED</span>
                          </div>
                          <p className="text-sm font-bold text-gray-800 mb-3">Gold Advance Receipt</p>
                          <div className="space-y-1.5 text-xs text-gray-600">
                            <div className="flex justify-between"><span>Client:</span><span className="font-medium text-gray-800">{formState.firstName} {formState.lastName}</span></div>
                            <div className="flex justify-between"><span>Mobile:</span><span>{formState.mobile}</span></div>
                            <div className="flex justify-between"><span>Plan:</span><span className="text-right max-w-[60%]">{formState.plan}</span></div>
                            <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                              <span className="font-bold text-gray-800">Amount:</span>
                              <span className="font-bold text-green-700 text-sm">₹{Number(formState.amount).toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between"><span>Date:</span><span>{new Date().toLocaleDateString("en-IN")}</span></div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={handleDownloadBill}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-emerald-1000 text-sm font-bold transition-all">
                            <Download className="w-4 h-4" /> Download PDF
                          </button>
                          <button onClick={() => showToast("SMS sent to client!")}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gold-500/20 text-gray-300 hover:text-white text-sm font-medium transition-all">
                            <Phone className="w-4 h-4" /> Send SMS
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── MANAGE WITHDRAWALS ── */}
            {activeTab === "withdrawals" && (
              <motion.div key="withdrawals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center justify-between mb-7">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-white mb-1">Manage Withdrawals</h1>
                    <p className="text-gray-400 text-sm">Review and process client withdrawal requests.</p>
                  </div>
                  <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-sm font-bold px-3 py-1.5 rounded-lg">
                    {withdrawalRequests.length} Pending
                  </span>
                </div>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                      <Loader2 className="w-8 h-8 animate-spin mb-3 text-gold-500" />
                      <p>Loading requests...</p>
                    </div>
                  ) : withdrawalRequests.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-emerald-950/40 rounded-2xl border border-gold-500/10">No pending withdrawal requests.</div>
                  ) : (
                    withdrawalRequests.map((req) => (
                      <div key={req.id} className="bg-emerald-950/40 border border-gold-500/10 rounded-2xl p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-medium text-white">{req.user?.name || "Unknown"}</span>
                              <span className="text-xs text-gray-500">{req.user?.id.slice(-6).toUpperCase()}</span>
                              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                req.status === "APPROVED" ? "bg-green-500/10 text-green-400" : 
                                req.status === "PENDING" ? "bg-orange-500/10 text-orange-400" : 
                                "bg-red-500/10 text-red-400"
                              }`}>
                                {req.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">Request #{req.id.slice(0,8)} · Requested {new Date(req.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-heading font-bold text-white">{formatCurrency(Number(req.amount))}</p>
                            <p className="text-[10px] text-gold-500 font-medium uppercase tracking-wider">{req.source}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {req.status === "PENDING" && (
                            <>
                              <button onClick={() => showToast(`Contact admin to approve this request.`)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400 hover:bg-gold-500/20 text-sm font-medium transition-all">
                                <CheckCircle2 className="w-4 h-4" /> Verify Details
                              </button>
                            </>
                          )}
                          <button onClick={() => downloadInvoicePDF({ id: req.id, type: "Withdrawal Receipt", date: new Date(req.createdAt).toLocaleDateString(), amount: formatCurrency(Number(req.amount)), investorName: req.user?.name })}
                            className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-gold-400 text-sm transition-all">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* ── CLIENT DATABASE ── */}
            {activeTab === "clients" && (
              <motion.div key="clients" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-white mb-1">Client Database</h1>
                    <p className="text-gray-400 text-sm">{clients.length} registered investors</p>
                  </div>
                  <button onClick={() => setActiveTab("new-advance")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-emerald-1000 text-sm font-bold transition-all">
                    <UserPlus className="w-4 h-4" /> Add Client
                  </button>
                </div>
                {/* search */}
                <div className="relative mb-5">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, ID, or mobile..." className="w-full bg-emerald-950 border border-gold-500/20 text-white rounded-xl py-3 pl-11 pr-4 outline-none focus:border-gold-500/50 transition-all" />
                </div>
                <div className="bg-emerald-950/30 border border-gold-500/10 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-emerald-950/50 border-b border-gold-500/10">
                        <tr className="text-xs uppercase tracking-wider text-gray-500">
                          <th className="p-4 pl-6">Client</th>
                          <th className="p-4 hidden sm:table-cell">Mobile</th>
                          <th className="p-4">Invested</th>
                          <th className="p-4 hidden md:table-cell">Yield Earned</th>
                          <th className="p-4 hidden md:table-cell">Status</th>
                          <th className="p-4 pr-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold-500/5">
                        {isLoading ? (
                          <tr><td colSpan={6} className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gold-500" /></td></tr>
                        ) : filteredClients.map((c) => (
                          <tr key={c.id} className="hover:bg-emerald-900/20 transition-colors">
                            <td className="p-4 pl-6">
                              <div>
                                <p className="font-medium text-white text-sm">{c.name}</p>
                                <p className="text-xs text-gray-500">{c.id.slice(-6).toUpperCase()} · {new Date(c.createdAt).toLocaleDateString()}</p>
                              </div>
                            </td>
                            <td className="p-4 text-gray-400 text-sm hidden sm:table-cell">{c.mobile || "N/A"}</td>
                            <td className="p-4 font-medium text-gold-400 text-sm">{formatCurrency(c.totalGoldAdvanceAmount || 0)}</td>
                            <td className="p-4 text-green-400 text-sm hidden md:table-cell">{formatCurrency(c.profitBalance || 0)}</td>
                            <td className="p-4 hidden md:table-cell">
                              <span className="text-xs px-2 py-0.5 rounded font-medium bg-green-500/10 text-green-400">
                                Active
                              </span>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <button onClick={() => showToast(`Viewing ${c.name}'s profile...`)} className="text-gold-500 hover:text-gold-400 transition-all">
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredClients.length === 0 && (
                      <div className="p-10 text-center text-gray-500">No clients found for &quot;{searchQuery}&quot;</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── GENERATE BILLS ── */}
            {activeTab === "bills" && (
              <motion.div key="bills" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="mb-7">
                  <h1 className="text-2xl font-heading font-bold text-white mb-1">Generate Bills</h1>
                  <p className="text-gray-400 text-sm">Create and download receipts for any client transaction.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {clients.map((c) => (
                    <div key={c.id} className="bg-emerald-950/40 border border-gold-500/10 hover:border-gold-500/25 rounded-2xl p-5 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-white">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.id}</p>
                        </div>
                        <span className="text-gold-400 font-bold">{c.invested}</span>
                      </div>
                      <div className="flex gap-2">
                        {["Deposit Receipt", "Yield Statement", "Account Summary"].map((type) => (
                          <button key={type} onClick={() => {
                            downloadInvoicePDF({ id: c.id, type, date: new Date().toLocaleDateString("en-IN"), amount: c.invested, investorName: c.name });
                            showToast(`${type} for ${c.name} downloaded!`);
                          }} className="flex-1 py-1.5 text-[11px] rounded-lg border border-gold-500/20 text-gray-400 hover:text-gold-400 hover:border-gold-500/40 transition-all flex items-center justify-center gap-1">
                            <Download className="w-3 h-3" /> {type.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── TRANSACTION LOG ── */}
            {activeTab === "history" && (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-white mb-1">Transaction Log</h1>
                    <p className="text-gray-400 text-sm">All transactions processed by this branch.</p>
                  </div>
                  <button onClick={() => showToast("Exporting full log as CSV...")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gold-500/20 text-gray-300 hover:text-white text-sm font-medium transition-all">
                    <Download className="w-4 h-4" /> Export
                  </button>
                </div>
                <div className="bg-emerald-950/30 border border-gold-500/10 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-emerald-950/50 border-b border-gold-500/10">
                        <tr className="text-xs uppercase tracking-wider text-gray-500">
                          <th className="p-4 pl-6">ID</th>
                          <th className="p-4">Type</th>
                          <th className="p-4 hidden sm:table-cell">Client</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4 hidden md:table-cell">Date</th>
                          <th className="p-4 pr-6 hidden md:table-cell">By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold-500/5">
                        {isLoading ? (
                          <tr><td colSpan={6} className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gold-500" /></td></tr>
                        ) : txLog.map((t) => (
                          <tr key={t.id} className="hover:bg-emerald-900/20 transition-colors">
                            <td className="p-4 pl-6 text-xs text-gray-500 font-mono">{t.id.slice(0,8)}</td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                t.type === "GOLD_ADVANCE" || t.type === "DEPOSIT" ? "bg-gold-500/10 text-gold-400" :
                                t.type === "DAILY_RETURN" ? "bg-green-500/10 text-green-400" :
                                "bg-blue-500/10 text-blue-400"
                              }`}>{t.type}</span>
                            </td>
                            <td className="p-4 text-gray-300 text-sm hidden sm:table-cell">{t.user?.name || "System"}</td>
                            <td className="p-4 font-medium text-white">{formatCurrency(Number(t.amount))}</td>
                            <td className="p-4 text-gray-400 text-sm hidden md:table-cell">{new Date(t.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 pr-6 text-gray-400 text-sm hidden md:table-cell">{t.description?.slice(0, 20)}...</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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


