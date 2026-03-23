"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, Mail, Phone, Fingerprint, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  roleFilter?: string;
  onSelectUser?: (user: any) => void;
  placeholder?: string;
  className?: string;
}

export default function GlobalSearch({ roleFilter, onSelectUser, placeholder = "Search for users...", className }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const searchParams = new URLSearchParams({
        search: query,
        limit: "5",
      });
      if (roleFilter) searchParams.append("role", roleFilter);

      const res = await apiClient.get(`/admin/users?${searchParams.toString()}`, token);
      setResults(res.data || []);
      setIsOpen(true);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-md", className)}>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-gold-500 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-text-secondary group-focus-within:text-gold-500 transition-colors" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-bg-surface/40 backdrop-blur-md border border-gold-500/10 rounded-2xl py-2.5 pl-11 pr-10 text-sm text-text-primary focus:outline-none focus:border-gold-500/40 focus:bg-bg-surface/60 transition-all placeholder:text-text-secondary/50 shadow-inner group-hover:border-gold-500/20"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1 rounded-full hover:bg-white/5 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-3 bg-bg-surface/90 backdrop-blur-xl border border-gold-500/20 rounded-2xl shadow-2xl overflow-hidden z-[110]"
          >
            <div className="p-2 space-y-1">
              {results.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    onSelectUser?.(u);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gold-500/10 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-full border border-gold-500/20 overflow-hidden bg-bg-app shrink-0">
                    {u.photo ? (
                      <img src={u.photo} alt={u.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gold-500/40">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary group-hover:text-gold-400 transition-colors truncate">
                      {u.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider",
                        u.role === 'SUPERADMIN' ? 'bg-red-500/10 text-red-500' :
                        u.role === 'ADMIN' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-gold-500/10 text-gold-500'
                      )}>
                        {u.role}
                      </span>
                      <span className="text-[10px] text-text-secondary truncate flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {u.email}
                      </span>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                     <p className="text-[10px] text-text-secondary flex items-center justify-end gap-1">
                       <Phone className="w-3 h-3" /> {u.contactNo || u.mobile}
                     </p>
                     {u.aadharNo && (
                       <p className="text-[9px] text-text-secondary mt-1 flex items-center justify-end gap-1 font-mono">
                         <Fingerprint className="w-3 h-3" /> {u.aadharNo}
                       </p>
                     )}
                  </div>
                </button>
              ))}
            </div>
            <div className="p-2.5 bg-gold-500/5 border-t border-gold-500/10 text-center">
               <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Showing top {results.length} matches</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
