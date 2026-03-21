"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User, Mail, Phone, Shield, Loader2, Save, 
  CreditCard, Fingerprint, Users, UserCheck 
} from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate: () => void;
  callerRole: "ADMIN" | "STAFF";
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function UserProfileModal({ isOpen, onClose, user: initialUser, onUpdate, callerRole }: UserProfileModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    aadhar: "",
    pan: "",
    role: "",
    staffId: "",
    referredBy: "",
    address: "",
    photo: "",
    gender: "",
    dob: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initialUser) {
      setFormData({
        name: initialUser.name || "",
        email: initialUser.email || "",
        mobile: initialUser.mobile || "",
        aadhar: initialUser.aadhar || "",
        pan: initialUser.pan || "",
        role: initialUser.role || "CUSTOMER",
        staffId: initialUser.staffId || "",
        referredBy: initialUser.referredBy || "",
        address: initialUser.address || "",
        photo: initialUser.photo || "",
        gender: initialUser.gender || "MALE",
        dob: initialUser.dob ? new Date(initialUser.dob).toISOString().split('T')[0] : "",
      });
      setError(null);
      setSuccess(null);
    }
  }, [initialUser, isOpen]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("photo", file);

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/upload/profile`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formDataUpload
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload photo");

      setFormData(prev => ({ ...prev, photo: data.url }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const endpoint = callerRole === "ADMIN" 
        ? `${API_BASE}/admin/users/${initialUser.id}` 
        : `${API_BASE}/staff/customers/${initialUser.id}`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setSuccess("Profile updated successfully!");
      onUpdate();
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !initialUser) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-bg-surface border border-gold-500/20 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gold-500/10 flex items-center justify-between bg-bg-app/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl">
                <User className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-text-primary tracking-wide">
                  Customer <span className="text-blue-500">Profile</span>
                </h2>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Edit Personal Details & Security</p>
              </div>
            </div>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors p-2 hover:bg-bg-app rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                <Shield className="w-5 h-5 shrink-0" /> {error}
              </motion.div>
            )}

            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-3">
                <UserCheck className="w-5 h-5 shrink-0" /> {success}
              </motion.div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest border-b border-gold-500/5 pb-2">Basic Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-bg-app border border-gold-500/10 rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:border-blue-500/40 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-emerald-1000 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/40 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Mobile Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className="w-full bg-bg-app border border-gold-500/10 rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:border-blue-500/40 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Identity & Legal */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Identity & Legal</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Aadhar Number</label>
                    <div className="relative group">
                      <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type="text"
                        value={formData.aadhar}
                        onChange={(e) => setFormData({ ...formData, aadhar: e.target.value })}
                        className="w-full bg-emerald-1000 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/40 transition-all"
                        placeholder="XXXX-XXXX-XXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1.5 block">PAN Number</label>
                    <div className="relative group">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type="text"
                        value={formData.pan}
                        onInput={(e) => (e.currentTarget.value = e.currentTarget.value.toUpperCase())}
                        onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                        className="w-full bg-bg-app border border-gold-500/10 rounded-xl py-2.5 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:border-blue-500/40 transition-all uppercase"
                        placeholder="ABCDE1234F"
                      />
                    </div>
                  </div>

                  {callerRole === "ADMIN" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-400 mb-1.5 block">User Role</label>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full bg-emerald-1000 border border-white/5 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-blue-500/40 transition-all"
                        >
                          <option value="CUSTOMER">Customer</option>
                          <option value="STAFF">Staff</option>
                          <option value="ADMIN">Admin</option>
                          <option value="SUPERADMIN">SuperAdmin</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Staff ID</label>
                        <input
                          type="text"
                          value={formData.staffId}
                          onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                          className="w-full bg-emerald-1000 border border-white/5 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-blue-500/40 transition-all"
                          placeholder="Staff UID"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio & Identity Cont. */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Bio & Identity</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full bg-bg-app border border-gold-500/10 rounded-xl py-2.5 px-3 text-text-primary text-sm focus:outline-none focus:border-blue-500/40 transition-all"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full bg-emerald-1000 border border-white/5 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-blue-500/40 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      {formData.photo && (
                        <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden bg-bg-app">
                          <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 relative group">
                        <input
                          type="file"
                          id="edit-photo-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('edit-photo-upload')?.click()}
                          className="w-full bg-emerald-1000 border border-white/5 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-blue-500/40 transition-all text-left flex items-center justify-between"
                        >
                          <span className="truncate">{formData.photo ? "Change Photo" : "Upload Photo"}</span>
                          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Residence Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-bg-app border border-gold-500/10 rounded-xl py-2.5 px-3 text-text-primary text-sm focus:outline-none focus:border-blue-500/40 transition-all min-h-[100px]"
                      placeholder="Full residential address"
                    />
                  </div>
                </div>
              </div>
            </div>

            {callerRole === "ADMIN" && (
              <div className="pt-8 border-t border-white/5">
                <label className="text-xs font-semibold text-gray-400 mb-1.5 block italic">Referrer User ID (Manual Override)</label>
                <div className="relative group">
                   <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-400 transition-colors" />
                   <input
                     type="text"
                     value={formData.referredBy}
                     onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                     className="w-full bg-emerald-1000 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-white text-xs focus:outline-none focus:border-blue-500/40 transition-all"
                     placeholder="Enter original referrer ID"
                   />
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-between items-center bg-bg-app/30 p-6 -mx-8 -mb-8 mt-auto border-t border-gold-500/10">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm font-bold hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-emerald-1000 font-bold transition-all flex items-center gap-2 active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


