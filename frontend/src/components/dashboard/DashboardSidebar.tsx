"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Menu, X, LucideIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  name: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeColor?: string;
}

interface DashboardSidebarProps {
  items: NavItem[];
  activeTab: string;
  setActiveTab: (id: string) => void;
  user: {
    name: string;
    role: string;
    details?: string;
    photo?: string;
    icon?: LucideIcon;
    iconBg?: string;
    iconColor?: string;
    borderColor?: string;
  };
  onLogout: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  roleLabel: string;
  accentColor?: "gold" | "blue" | "green" | "purple";
}

export default function DashboardSidebar({
  items,
  activeTab,
  setActiveTab,
  user,
  onLogout,
  isMobileOpen,
  setIsMobileOpen,
  roleLabel,
  accentColor = "gold"
}: DashboardSidebarProps) {
  
  const accentClasses = {
    gold: {
      text: "text-gold-400",
      bgSubtle: "bg-gold-500/10",
      borderSubtle: "border-gold-500/30",
      hover: "hover:text-gold-300 hover:bg-white/5 dark:hover:text-gold-300 dark:hover:bg-white/5",
      sidebarBorder: "border-gold-500/10"
    },
    blue: {
      text: "text-blue-500",
      bgSubtle: "bg-blue-500/10",
      borderSubtle: "border-blue-500/20",
      hover: "hover:text-blue-600 hover:bg-blue-500/5 dark:hover:text-white dark:hover:bg-white/5",
      sidebarBorder: "border-blue-500/10"
    },
    green: {
      text: "text-emerald-500",
      bgSubtle: "bg-emerald-500/10",
      borderSubtle: "border-emerald-500/20",
      hover: "hover:text-emerald-600 hover:bg-emerald-500/5 dark:hover:text-white dark:hover:bg-white/5",
      sidebarBorder: "border-emerald-500/10"
    },
    purple: {
      text: "text-purple-500",
      bgSubtle: "bg-purple-500/10",
      borderSubtle: "border-purple-500/20",
      hover: "hover:text-purple-600 hover:bg-purple-500/5 dark:hover:text-white dark:hover:bg-white/5",
      sidebarBorder: "border-purple-500/10"
    }
  }[accentColor];

  const SidebarContent = () => (
    <div className="flex flex-col h-full max-h-screen">
      {/* Header - Fixed Height */}
      <div className={cn("p-6 sm:p-8 border-b shrink-0", accentClasses.sidebarBorder)}>
        <Link href="/" className="text-xl sm:text-2xl font-heading font-bold tracking-wider text-text-primary">
          <span className={accentClasses.text}>RGT</span> {roleLabel}
        </Link>
        <div className="mt-8 flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full border-2 overflow-hidden flex items-center justify-center shrink-0",
            user.iconBg || "bg-bg-surface",
            user.borderColor || "border-gold-500/20",
            user.iconColor || "text-white"
          )}>
            {user.photo ? (
              <Image 
                src={user.photo} 
                alt={user.name} 
                width={40} 
                height={40} 
                className="w-full h-full object-cover" 
              />
            ) : user.icon ? (
              <user.icon className="w-5 h-5" />
            ) : (
              user.name?.[0] || "U"
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
            <div className={cn("flex items-center text-[10px] sm:text-xs mt-0.5", user.iconColor || "text-gray-400")}>
              <span className="truncate">{user.details || user.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable Area */}
      <nav className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1 custom-scrollbar">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsMobileOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group relative overflow-hidden",
              activeTab === item.id
                ? "bg-gold-gradient text-bg-app shadow-[0_0_20px_rgba(255,191,0,0.2)]"
                : "text-text-secondary hover:text-gold-400 hover:bg-white/5"
            )}
          >
            {activeTab === item.id && (
              <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-gold-gradient" />
            )}
            <item.icon className={cn("w-4 h-4 shrink-0 transition-colors z-10", activeTab === item.id ? "text-bg-app" : "group-hover:text-gold-400")} />
            <span className="truncate z-10">{item.name}</span>
            {item.badge !== undefined && (
              <span className={cn(
                "ml-auto text-[10px] font-black px-1.5 py-0.5 rounded shrink-0 z-10",
                item.badgeColor || "bg-red-500 text-white shadow-lg"
              )}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer - Fixed Height */}
      <div className={cn("p-4 sm:p-6 border-t shrink-0", accentClasses.sidebarBorder)}>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all group"
        >
          <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-1" />
          <span>Secure Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "w-72 bg-bg-app/40 backdrop-blur-3xl border-r hidden lg:flex flex-col sticky top-0 h-screen z-20 shadow-2xl shadow-black/50",
        accentClasses.sidebarBorder
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-72 h-full bg-bg-surface border-r border-gold-500/5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent />
              {/* Close button for mobile accessibility */}
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-[-48px] p-2 bg-emerald-950 text-white rounded-r-lg border-y border-r border-white/5"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


