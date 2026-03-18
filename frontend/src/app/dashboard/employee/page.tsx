"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Users, UserPlus, ClipboardList, ArrowLeftRight, FileText,
  Search, Bell, ShieldCheck, LogOut, Download, MapPin, BadgeCheck,
  CheckCircle2, X, Clock, AlertCircle, Eye, Phone, IndianRupee, Menu
} from "lucide-react";
import { downloadInvoicePDF } from "@/lib/downloadInvoice";

/* ─── Mock Data ─── */
const clients = [
  { id: "RGT-001", name: "Abhishek Kumar", mobile: "+91 98765 43210", invested: "₹12,45,000", yield: "₹85,420", joined: "Jan 15, 2026", status: "Active" },
  { id: "RGT-002", name: "Priya Sharma", mobile: "+91 87654 32109", invested: "₹5,00,000", yield: "₹28,500", joined: "Feb 02, 2026", status: "Active" },
  { id: "RGT-003", name: "Rakesh Verma", mobile: "+91 76543 21098", invested: "₹8,00,000", yield: "₹52,000", joined: "Dec 10, 2025", status: "Active" },
  { id: "RGT-004", name: "Sunita Devi", mobile: "+91 65432 10987", invested: "₹2,50,000", yield: "₹14,200", joined: "Mar 01, 2026", status: "Pending" },
];

const withdrawalRequests = [
  { id: "WD-001", client: "Abhishek Kumar", clientId: "RGT-001", amount: "₹50,000", requested: "Dec 01, 2025", status: "Processing", day: 5 },
  { id: "WD-002", client: "Priya Sharma", clientId: "RGT-002", amount: "₹20,000", requested: "Mar 12, 2026", status: "Pending", day: 1 },
];

const txLog = [
  { id: "TXN-2026-009", type: "New Investment", client: "Sunita Devi", amount: "₹2,50,000", date: "Mar 01, 2026", by: "Sanjay Jha" },
  { id: "TXN-2026-008", type: "Yield Payout", client: "Abhishek Kumar", amount: "₹4,100", date: "Mar 10, 2026", by: "System" },
  { id: "TXN-2026-007", type: "Withdrawal", client: "Priya Sharma", amount: "₹20,000", date: "Mar 12, 2026", by: "Sanjay Jha" },
  { id: "TXN-2025-055", type: "New Investment", client: "Rakesh Verma", amount: "₹8,00,000", date: "Dec 10, 2025", by: "Sanjay Jha" },
];

const navItems = [
  { id: "new-investment", name: "Process Investment", icon: UserPlus },
  { id: "withdrawals", name: "Manage Withdrawals", icon: ArrowLeftRight },
  { id: "clients", name: "Client Database", icon: Users },
  { id: "bills", name: "Generate Bills", icon: FileText },
  { id: "history", name: "Transaction Log", icon: ClipboardList },
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

/* ─── Input ─── */
function Field({ label, type = "text", placeholder = "" }: { label: string; type?: string; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <input type={type} placeholder={placeholder}
        className="w-full bg-navy-950 border border-gold-500/20 text-white rounded-xl py-3 px-4 outline-none focus:border-gold-500/60 transition-colors" />
    </div>
  );
}

/* ─── Main ─── */
export default function EmployeeDashboardPage() {
  const [activeTab, setActiveTab] = useState("new-investment");
  const [toast, setToast] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [formState, setFormState] = useState({ mobile: "", firstName: "", lastName: "", amount: "", plan: "Standard Daily Yield (2.5% Monthly)" });
  const [billGenerated, setBillGenerated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const handleGenerateBill = () => {
    if (!formState.mobile || !formState.firstName || !formState.amount) {
      showToast("Please fill in Mobile, Name, and Amount first!");
      return;
    }
    setBillGenerated(true);
    showToast("Bill generated! Ready to print or SMS client.");
  };

  const handleDownloadBill = () => {
    downloadInvoicePDF({
      id: `INV-${Date.now()}`,
      type: "Capital Investment Receipt",
      date: new Date().toLocaleDateString("en-IN"),
      amount: `₹${Number(formState.amount).toLocaleString("en-IN")}`,
      investorName: `${formState.firstName} ${formState.lastName}`.trim(),
      investorId: `RGT-NEW`,
    });
    showToast("Investment receipt downloaded!");
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mobile.includes(searchQuery)
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b border-gold-500/10">
        <Link href="/" className="text-2xl font-heading font-bold tracking-wider text-white">
          <span className="text-gold-400">RGT</span> Office
        </Link>
        <div className="mt-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-navy-800 border-2 border-gold-500/30 flex items-center justify-center text-gold-400 font-bold">SJ</div>
          <div>
            <p className="text-sm font-medium text-white">Sanjay Jha</p>
            <div className="flex items-center text-xs text-blue-400 mt-0.5">
              <BadgeCheck className="w-3 h-3 mr-1" /> Branch Executive
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
            {item.id === "withdrawals" && <span className="ml-auto bg-orange-500/20 text-orange-300 text-[10px] font-bold px-1.5 py-0.5 rounded">{withdrawalRequests.length}</span>}
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 bg-navy-950/90 backdrop-blur-md border-b border-gold-500/10 px-5 py-4 flex items-center justify-between gap-4">
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
                className="bg-navy-900 border border-gold-500/20 text-white text-sm rounded-full pl-10 pr-4 py-2 w-52 focus:outline-none focus:border-gold-500/50 transition-all" />
            </div>
            <button className="relative text-gray-400 hover:text-gold-400 transition-colors" onClick={() => showToast("No new notifications")}>
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <div className="p-5 lg:p-10 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">

            {/* ── PROCESS INVESTMENT ── */}
            {activeTab === "new-investment" && (
              <motion.div key="investment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center justify-between mb-7">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-heading font-bold text-white mb-1">Process New Investment</h1>
                    <p className="text-gray-400 text-sm">Register physical cash deposits and allocate gold assets.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-sm font-medium">
                    <ShieldCheck className="w-4 h-4" /> Secure Terminal
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Form */}
                  <div className="bg-navy-900/60 border border-gold-500/20 p-7 rounded-2xl shadow-xl">
                    <h2 className="text-lg font-heading font-semibold text-white mb-5 border-b border-gold-500/10 pb-4">Client Details</h2>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-300">Client Mobile Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input type="tel" value={formState.mobile} onChange={(e) => setFormState({ ...formState, mobile: e.target.value })} placeholder="+91 XXXXX XXXXX"
                            className="w-full bg-navy-950 border border-gold-500/20 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-gold-500/60 transition-colors" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-300">First Name</label>
                          <input type="text" value={formState.firstName} onChange={(e) => setFormState({ ...formState, firstName: e.target.value })}
                            className="w-full bg-navy-950 border border-gold-500/20 text-white rounded-xl py-3 px-4 outline-none focus:border-gold-500/60" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-300">Last Name</label>
                          <input type="text" value={formState.lastName} onChange={(e) => setFormState({ ...formState, lastName: e.target.value })}
                            className="w-full bg-navy-950 border border-gold-500/20 text-white rounded-xl py-3 px-4 outline-none focus:border-gold-500/60" />
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-3 border-t border-gold-500/10">
                        <label className="text-sm font-medium text-gray-300">Physical Cash Deposited (₹)</label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
                          <input type="number" value={formState.amount} onChange={(e) => setFormState({ ...formState, amount: e.target.value })} placeholder="Enter amount"
                            className="w-full bg-navy-950 border-2 border-gold-500/30 text-gold-400 font-bold text-lg rounded-xl py-4 pl-10 pr-4 outline-none focus:border-gold-500 transition-all" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-300">Assign Yield Plan</label>
                        <select value={formState.plan} onChange={(e) => setFormState({ ...formState, plan: e.target.value })}
                          className="w-full bg-navy-950 border border-gold-500/20 text-white rounded-xl py-3.5 px-4 outline-none focus:border-gold-500/60">
                          <option>Standard Daily Yield (2.5% Monthly)</option>
                          <option>Premium Weekly Yield (3.0% Monthly)</option>
                          <option>Locked Monthly Yield (4.5% Monthly)</option>
                        </select>
                      </div>
                      <button onClick={handleGenerateBill}
                        className="w-full py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-base shadow-gold-glow transition-all mt-2">
                        Verify & Generate Bill
                      </button>
                    </div>
                  </div>

                  {/* Bill Preview */}
                  <div className="bg-white/3 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    {!billGenerated ? (
                      <>
                        <div className="w-20 h-20 rounded-full bg-navy-900 border border-gold-500/20 flex items-center justify-center mb-5">
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
                          <p className="text-sm font-bold text-gray-800 mb-3">Investment Receipt</p>
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
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm font-bold transition-all">
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
                  {withdrawalRequests.map((req) => (
                    <div key={req.id} className="bg-navy-900/40 border border-gold-500/10 rounded-2xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium text-white">{req.client}</span>
                            <span className="text-xs text-gray-500">{req.clientId}</span>
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${req.status === "Processing" ? "bg-blue-500/10 text-blue-400" : "bg-orange-500/10 text-orange-400"}`}>
                              {req.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">Request #{req.id} · Requested {req.requested}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-heading font-bold text-white">{req.amount}</p>
                        </div>
                      </div>
                      {req.status === "Processing" && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                            <span>Processing Progress</span><span>Day {req.day} of 7</span>
                          </div>
                          <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(req.day / 7) * 100}%` }} />
                          </div>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <button onClick={() => showToast(`${req.id} approved & disbursement logged!`)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-sm font-medium transition-all">
                          <CheckCircle2 className="w-4 h-4" /> Mark Disbursed
                        </button>
                        <button onClick={() => showToast(`${req.id} marked as pending review.`)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 text-sm font-medium transition-all">
                          <AlertCircle className="w-4 h-4" /> Flag for Review
                        </button>
                        <button onClick={() => downloadInvoicePDF({ id: req.id, type: "Withdrawal Receipt", date: req.requested, amount: req.amount, investorName: req.client })}
                          className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-gold-400 text-sm transition-all">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
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
                  <button onClick={() => setActiveTab("new-investment")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm font-bold transition-all">
                    <UserPlus className="w-4 h-4" /> Add Client
                  </button>
                </div>
                {/* search */}
                <div className="relative mb-5">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, ID, or mobile..." className="w-full bg-navy-900 border border-gold-500/20 text-white rounded-xl py-3 pl-11 pr-4 outline-none focus:border-gold-500/50 transition-all" />
                </div>
                <div className="bg-navy-900/30 border border-gold-500/10 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-navy-900/50 border-b border-gold-500/10">
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
                        {filteredClients.map((c) => (
                          <tr key={c.id} className="hover:bg-navy-800/20 transition-colors">
                            <td className="p-4 pl-6">
                              <div>
                                <p className="font-medium text-white text-sm">{c.name}</p>
                                <p className="text-xs text-gray-500">{c.id} · {c.joined}</p>
                              </div>
                            </td>
                            <td className="p-4 text-gray-400 text-sm hidden sm:table-cell">{c.mobile}</td>
                            <td className="p-4 font-medium text-gold-400 text-sm">{c.invested}</td>
                            <td className="p-4 text-green-400 text-sm hidden md:table-cell">{c.yield}</td>
                            <td className="p-4 hidden md:table-cell">
                              <span className={`text-xs px-2 py-0.5 rounded font-medium ${c.status === "Active" ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400"}`}>
                                {c.status}
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
                    <div key={c.id} className="bg-navy-900/40 border border-gold-500/10 hover:border-gold-500/25 rounded-2xl p-5 transition-all">
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
                <div className="bg-navy-900/30 border border-gold-500/10 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-navy-900/50 border-b border-gold-500/10">
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
                        {txLog.map((t) => (
                          <tr key={t.id} className="hover:bg-navy-800/20 transition-colors">
                            <td className="p-4 pl-6 text-xs text-gray-500 font-mono">{t.id}</td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                t.type === "New Investment" ? "bg-gold-500/10 text-gold-400" :
                                t.type === "Yield Payout" ? "bg-green-500/10 text-green-400" :
                                "bg-blue-500/10 text-blue-400"
                              }`}>{t.type}</span>
                            </td>
                            <td className="p-4 text-gray-300 text-sm hidden sm:table-cell">{t.client}</td>
                            <td className="p-4 font-medium text-white">{t.amount}</td>
                            <td className="p-4 text-gray-400 text-sm hidden md:table-cell">{t.date}</td>
                            <td className="p-4 pr-6 text-gray-400 text-sm hidden md:table-cell">{t.by}</td>
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
