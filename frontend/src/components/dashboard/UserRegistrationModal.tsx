"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Mail, Lock, Shield, Loader2, CheckCircle2 } from "lucide-react";

interface UserRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  callerRole: "ADMIN" | "STAFF";
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function UserRegistrationModal({ isOpen, onClose, onSuccess, callerRole }: UserRegistrationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: callerRole === "STAFF" ? "CUSTOMER" : "STAFF",
    contactNo: "",
    aadharNo: "",
    pan: "",
    referredBy: "",
    address: "",
    photo: "",
    gender: "MALE",
    dob: "",
    initialGoldAdvanceAmount: 0,
    staffId: "",
  });
  const [staffList, setStaffList] = useState<any[]>([]);
  const [availableReferrers, setAvailableReferrers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referrerMobile, setReferrerMobile] = useState("");
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  useEffect(() => {
    if (isOpen && callerRole === "ADMIN") {
      fetchStaffList();
    }
  }, [isOpen, callerRole]);

  const fetchStaffList = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/staff/list`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch (err) {
      console.error("Fetch staff list failed:", err);
    }
  };

  const handleReferrerLookup = async (mobile: string) => {
    setReferrerMobile(mobile);
    if (mobile.length === 10) {
      setIsLookingUp(true);
      setReferrerName(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/auth/lookup-referrer?mobile=${encodeURIComponent(mobile)}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setReferrerName(data.name);
          setFormData(prev => ({ ...prev, referredBy: data.id }));
        } else {
          setReferrerName(`Not Found: ${data.error || "User not found"}`);
          setFormData(prev => ({ ...prev, referredBy: "" }));
        }
      } catch (err: any) {
        setReferrerName(`Error: ${err.message || "Connection failed"}`);
        setFormData(prev => ({ ...prev, referredBy: "" }));
      } finally {
        setIsLookingUp(false);
      }
    } else {
      setReferrerName(null);
      if (mobile.length < 10) {
        setFormData(prev => ({ ...prev, referredBy: "" }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          initialGoldAdvanceAmount: Number(formData.initialGoldAdvanceAmount)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      onSuccess(`Successfully registered ${formData.name} as ${formData.role}`);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: callerRole === "STAFF" ? "CUSTOMER" : "STAFF",
        contactNo: "",
        aadharNo: "",
        pan: "",
        referredBy: "",
        address: "",
        photo: "",
        gender: "MALE",
        dob: "",
        initialGoldAdvanceAmount: 0,
        staffId: "",
      });
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-emerald-950 border border-gold-500/20 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gold-500/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold-500/10 rounded-lg">
                <UserPlus className="w-5 h-5 text-gold-400" />
              </div>
              <h2 className="text-xl font-heading font-bold text-white tracking-wide">
                Register New <span className="text-gold-400">User</span>
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Full Name</label>
                  <div className="relative group">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-gold-400 transition-colors" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-emerald-1000 border border-gold-500/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-gold-500/40 transition-all placeholder:text-gray-600"
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-gold-400 transition-colors" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-emerald-1000 border border-gold-500/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-gold-500/40 transition-all placeholder:text-gray-600"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-gold-400 transition-colors" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-emerald-1000 border border-gold-500/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-gold-500/40 transition-all placeholder:text-gray-600"
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                </div>

                {callerRole === "ADMIN" && (
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">User Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-emerald-1000 border border-gold-500/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-gold-500/40 transition-all"
                    >
                      <option value="STAFF">Staff Member</option>
                      <option value="CUSTOMER">Customer / Investor</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Advanced Details for Customer */}
              {formData.role === "CUSTOMER" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 pt-4 border-t border-gold-500/5"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-2 block">Mobile No</label>
                      <input
                        type="tel"
                        value={formData.contactNo}
                        onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                        className="w-full bg-emerald-1000 border border-gold-500/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-gold-500/40 transition-all"
                        placeholder="10-digit mobile"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-2 block">PAN No</label>
                      <input
                        type="text"
                        value={formData.pan}
                        onInput={(e) => (e.currentTarget.value = e.currentTarget.value.toUpperCase())}
                        onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                        className="w-full bg-emerald-1000 border border-gold-500/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-gold-500/40 transition-all uppercase"
                        placeholder="ABCDE1234F"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-2 block">Aadhar No</label>
                    <input
                      type="text"
                      value={formData.aadharNo}
                      onChange={(e) => setFormData({ ...formData, aadharNo: e.target.value })}
                      className="w-full bg-emerald-1000 border border-gold-500/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-gold-500/40 transition-all"
                      placeholder="XXXX-XXXX-XXXX"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-2 block">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full bg-emerald-1000 border border-gold-500/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-gold-500/40 transition-all"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-2 block">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full bg-emerald-1000 border border-gold-500/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-gold-500/40 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-2 block">Photo URL</label>
                    <input
                      type="url"
                      value={formData.photo}
                      onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                      className="w-full bg-emerald-1000 border border-gold-500/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-gold-500/40 transition-all"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-2 block">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-emerald-1000 border border-gold-500/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-gold-500/40 transition-all min-h-[80px]"
                      placeholder="Enter residence address"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 block">Referrer (Mobile Number)</label>
                    <div className="relative group">
                      <input
                        type="tel"
                        value={referrerMobile}
                        onChange={(e) => handleReferrerLookup(e.target.value)}
                        className="w-full bg-emerald-1000 border border-blue-500/20 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-blue-500/40 transition-all"
                        placeholder="Enter referrer's mobile"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isLookingUp && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />}
                        {!isLookingUp && referrerName && referrerName !== "Not Found" && referrerName !== "Error" && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        )}
                      </div>
                    </div>
                    {referrerName && (
                      <p className={`text-[10px] mt-1 font-bold ${referrerName.startsWith("Not Found") || referrerName.startsWith("Error") ? "text-red-400" : "text-green-400"}`}>
                        {referrerName.startsWith("Not Found") || referrerName.startsWith("Error") ? referrerName : `Referee Name: ${referrerName}`}
                      </p>
                    )}
                    <input type="hidden" name="referredBy" value={formData.referredBy} />
                  </div>

                  {callerRole === "ADMIN" && (
                    <div>
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 block">Assign Staff (Admin Only)</label>
                      <select
                        value={formData.staffId}
                        onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                        className="w-full bg-emerald-1000 border border-blue-500/20 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-blue-500/40 transition-all font-medium"
                      >
                        <option value="">No Staff Assigned</option>
                        {staffList.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gold-500/10">
                    <label className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-2 block italic">Initial Gold Advance Deposite (Optional)</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 font-bold text-sm">₹</div>
                      <input
                        type="number"
                        value={formData.initialGoldAdvanceAmount || ""}
                        onChange={(e) => setFormData({ ...formData, initialGoldAdvanceAmount: Number(e.target.value) })}
                        className="w-full bg-emerald-1000/50 border border-green-500/20 focus:border-green-500/40 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none transition-all placeholder:text-gray-600 font-bold"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">Entering an amount here will automatically create an active Gold Advance and a Deposit transaction for the customer.</p>
                  </div>
                </motion.div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gold-500 hover:bg-gold-400 disabled:bg-gold-500/40 text-emerald-1000 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Confirm Registration</>}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


