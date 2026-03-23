"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Camera, Save, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface ProfileTabProps {
  user: any;
  onUpdateSuccess: (updatedUser: any) => void;
}

export default function ProfileTab({ user, onUpdateSuccess }: ProfileTabProps) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    contactNo: user?.contactNo || "",
    aadharNo: user?.aadharNo || "",
    pan: user?.pan || "",
    photo: user?.photo || "",
    address: user?.address || "",
    gender: user?.gender || "",
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : ""
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("photo", file);

    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users/profile/photo`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formDataUpload
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload photo");

      setFormData(prev => ({ ...prev, photo: data.photo }));
      onUpdateSuccess(data.user);
      setMessage("Photo updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const { photo: _, ...rest } = formData; // Photo is handled separately now
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(rest)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setMessage("Profile updated successfully!");
      onUpdateSuccess(data.user);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">Profile Settings</h2>
          <p className="text-text-secondary text-sm">Update your personal and professional profile details.</p>
        </div>
        {message && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-xl border border-green-400/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">{message}</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6 text-center">
            <div className="relative inline-block mb-4 group cursor-pointer" onClick={() => document.getElementById('photo-upload')?.click()}>
              <div className="w-32 h-32 rounded-full border-4 border-gold-500/20 overflow-hidden bg-bg-app flex items-center justify-center">
                {formData.photo ? (
                  <img src={formData.photo} alt={formData.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gold-500/40" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 p-2 bg-gold-500 rounded-full text-bg-app shadow-lg border-2 border-bg-surface group-hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
              </div>
              <input 
                id="photo-upload" 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
              />
            </div>
            <h3 className="text-lg font-bold text-text-primary">{formData.name}</h3>
            <p className="text-xs text-text-secondary uppercase tracking-widest font-bold mt-1">{user?.role}</p>
            
            <div className="mt-6 pt-6 border-t border-gold-500/5 space-y-3 text-left">
              <div className="flex items-center gap-3 text-text-secondary">
                <Mail className="w-4 h-4 text-gold-500/60" />
                <span className="text-xs truncate">{formData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary">
                <Phone className="w-4 h-4 text-gold-500/60" />
                <span className="text-xs">{formData.contactNo || "Not provided"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-bg-surface border border-gold-500/10 rounded-2xl p-8 space-y-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-bg-app border border-gold-500/10 rounded-xl py-3 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:border-gold-500/40 transition-all"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full bg-bg-app/40 border border-gold-500/5 rounded-xl py-3 pl-11 pr-4 text-text-secondary text-sm cursor-not-allowed"
                    placeholder="Email cannot be changed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="tel"
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactNo: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    className="w-full bg-bg-app border border-gold-500/10 rounded-xl py-3 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:border-gold-500/40 transition-all font-medium"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                </div>
                <p className="text-[9px] text-text-secondary mt-1 ml-1 uppercase tracking-tighter">Exactly 10 digits required</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Aadhar Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    name="aadharNo"
                    value={formData.aadharNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, aadharNo: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
                    className="w-full bg-bg-app border border-gold-500/10 rounded-xl py-3 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:border-gold-500/40 transition-all"
                    placeholder="12-digit number"
                    maxLength={12}
                  />
                </div>
                <p className="text-[9px] text-text-secondary mt-1 ml-1 uppercase tracking-tighter">Exactly 12 digits required</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">PAN Number <span className="text-text-secondary font-normal font-sans">(Optional)</span></label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    name="pan"
                    value={formData.pan}
                    onChange={(e) => setFormData(prev => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                    className="w-full bg-bg-app border border-gold-500/10 rounded-xl py-3 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:border-gold-500/40 transition-all uppercase"
                    placeholder="ABCDE1234F"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Profile Photo</label>
                <div className="relative">
                  <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <button
                    type="button"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    className="w-full bg-bg-app border border-gold-500/10 rounded-xl py-3 pl-11 pr-4 text-text-primary text-sm text-left focus:outline-none focus:border-gold-500/40 transition-all flex items-center justify-between"
                  >
                    <span className="truncate">{formData.photo ? "Change Photo" : "Upload Photo"}</span>
                    {formData.photo && <span className="text-[10px] text-gold-500 font-bold">IMAGE SAVED</span>}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-bg-app border border-gold-500/10 rounded-xl py-3 px-4 text-text-primary text-sm focus:outline-none focus:border-gold-500/40 transition-all"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-bg-app border border-gold-500/10 rounded-xl py-3 px-4 text-text-primary text-sm focus:outline-none focus:border-gold-500/40 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Full Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-4 h-4 text-text-secondary" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-bg-app border border-gold-500/10 rounded-xl py-3 pl-11 pr-4 text-text-primary text-sm focus:outline-none focus:border-gold-500/40 transition-all resize-none"
                  placeholder="Enter your permanent address"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-gold-500 hover:bg-gold-400 text-bg-app font-bold rounded-xl transition-all shadow-lg shadow-gold-500/20 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Variations
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
