"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck, Shield, Users, Building, Activity, Settings, LogOut,
  Download, AlertTriangle, CheckCircle2, X, Menu, Bell,
  TrendingUp, Eye, Lock, Unlock, Search, RefreshCw, Crown, Wallet, Loader2, UserPlus, History,
  Package, Plus, Edit3, Trash2, ToggleLeft, ToggleRight, Image as ImageIcon
} from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";
import { formatCurrency, cn } from "@/lib/utils";
import ProfileTab from "@/components/dashboard/ProfileTab";
import { User } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { downloadInvoicePDF } from "@/lib/downloadInvoice";
import UserRegistrationModal from "@/components/dashboard/UserRegistrationModal";
import UserDetailsModal from "@/components/dashboard/UserDetailsModal";
import UserProfileModal from "@/components/dashboard/UserProfileModal";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import UserTransactionHistoryModal from "@/components/dashboard/UserTransactionHistoryModal";
import AddGoldAdvanceModal from "@/components/dashboard/AddGoldAdvanceModal";
import ThemeToggle from "@/components/ui/ThemeToggle";
import GlobalSearch from "@/components/dashboard/GlobalSearch";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const AdminAUMChart = dynamic(() => import("@/components/ui/AdminAUMChart"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">Loading chart...</div>,
});

/* ─── Nav Items per Gold Mode ─── */
const digitalNavItems = [
  { id: "overview", name: "Global Command Center", icon: Activity },
  { id: "users", name: "User Management", icon: Users },
  { id: "transactions", name: "Global Transactions", icon: TrendingUp },
  { id: "withdrawals", name: "Withdrawals", icon: Wallet },
  { id: "settings", name: "System Settings", icon: Settings },
  { id: "profile", name: "My Profile", icon: User },
];

const physicalNavItems = [
  { id: "overview", name: "Dashboard Overview", icon: Activity },
  { id: "products", name: "Product Management", icon: Package },
  { id: "orders", name: "Gold Coin Orders", icon: Building },
  { id: "users", name: "User Management", icon: Users },
  { id: "settings", name: "System Settings", icon: Settings },
  { id: "profile", name: "My Profile", icon: User },
];

const roleColor = (role: string) =>
  role === "SUPERADMIN" ? "bg-red-500/10 text-red-500 font-bold" :
  role === "ADMIN" ? "bg-red-500/10 text-red-400" :
  "bg-green-500/10 text-green-400";

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

/* ─── Main ─── */
export default function AdminDashboardPage() {
  /* ─── State ─── */
  const [activeTab, setActiveTab] = useState("overview");
  const userJson = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userJson ? JSON.parse(userJson) : null;
  const [toast, setToast] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [panicMode, setPanicMode] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [userSubTab, setUserSubTab] = useState("CUSTOMER");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  /* ─── Real Data State ─── */
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [globalTransactions, setGlobalTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [historyUser, setHistoryUser] = useState<any>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [allStaff, setAllStaff] = useState<any[]>([]);
   const [isAddGoldModalOpen, setIsAddGoldModalOpen] = useState(false);
  const [goldModalUser, setGoldModalUser] = useState<any>(null);
  const [withdrawalActionLoadingId, setWithdrawalActionLoadingId] = useState<string | null>(null);
  const [orderActionLoadingId, setOrderActionLoadingId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  /* ─── System Settings State ─── */
  const [goldMode, setGoldMode] = useState<"DIGITAL" | "PHYSICAL">("DIGITAL");
  const [showGST, setShowGST] = useState(true);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [monthlyProfitPercentage, setMonthlyProfitPercentage] = useState(5.0);
  const [monthlyReferralPercentage, setMonthlyReferralPercentage] = useState(5.0);
  const [monthlyStaffPercentage, setMonthlyStaffPercentage] = useState(5.0);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  const [goldBuyPrice, setGoldBuyPrice] = useState(0);
  const [goldSellPrice, setGoldSellPrice] = useState(0);
  const [goldPriceUpdatedAt, setGoldPriceUpdatedAt] = useState<string | null>(null);
  const [isGoldPriceSaving, setIsGoldPriceSaving] = useState(false);
  
  /* ─── Search & Sort State ─── */
  const [userSearch, setUserSearch] = useState("");
  const [userSortBy, setUserSortBy] = useState("createdAt");
  const [userSortOrder, setUserSortOrder] = useState("desc");

  const [txSearch, setTxSearch] = useState("");
  const [txSortBy, setTxSortBy] = useState("createdAt");
  const [txSortOrder, setTxSortOrder] = useState("desc");

  const [wdSearch, setWdSearch] = useState("");
  const [wdSortBy, setWdSortBy] = useState("createdAt");
  const [wdSortOrder, setWdSortOrder] = useState("desc");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");

  const [txTypeFilter, setTxTypeFilter] = useState("ALL");
  const [txDatePreset, setTxDatePreset] = useState("ALL");
  const [txDateFrom, setTxDateFrom] = useState("");
  const [txDateTo, setTxDateTo] = useState("");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [ordersIndex, setOrdersIndex] = useState<Record<string, any>>({});

  /* ─── Products State ─── */
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ name: "", description: "", weight: "", purity: "24K", stock: "", imageUrl: "" });
  const [isProductSaving, setIsProductSaving] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const PRODUCTS_LIMIT = 10;

  /* ─── Pagination State ─── */
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [wdPage, setWdPage] = useState(1);
  const [wdTotalPages, setWdTotalPages] = useState(1);
  const [orderPage, setOrderPage] = useState(1);

  /* ─── Debounced Search ─── */
  const [debouncedUserSearch, setDebouncedUserSearch] = useState("");
  const [debouncedTxSearch, setDebouncedTxSearch] = useState("");
  const [debouncedWdSearch, setDebouncedWdSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedUserSearch(userSearch), 400);
    return () => clearTimeout(timer);
  }, [userSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTxSearch(txSearch), 400);
    return () => clearTimeout(timer);
  }, [txSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedWdSearch(wdSearch), 400);
    return () => clearTimeout(timer);
  }, [wdSearch]);

  const USERS_LIMIT = 10;
  const ORDERS_LIMIT = 10;
  const router = useRouter();

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const applyTxDatePreset = (preset: string) => {
    setTxDatePreset(preset);
    if (preset === "ALL") {
      setTxDateFrom("");
      setTxDateTo("");
      return;
    }

    const today = new Date();
    const from = new Date(today);
    if (preset === "TODAY") {
      // Keep today as both start and end.
    } else if (preset === "7D") {
      from.setDate(today.getDate() - 6);
    } else if (preset === "30D") {
      from.setDate(today.getDate() - 29);
    }

    const fromStr = from.toISOString().slice(0, 10);
    const toStr = today.toISOString().slice(0, 10);
    setTxDateFrom(fromStr);
    setTxDateTo(toStr);
  };


  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const sRes = await apiClient.get("/admin/stats", token || undefined);
      setStats(sRes);
    } catch (err) {
      console.error("Fetch stats failed:", err);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const query = new URLSearchParams({
        role: userSubTab,
        page: userPage.toString(),
        limit: USERS_LIMIT.toString(),
        search: debouncedUserSearch,
        sortBy: userSortBy,
        sortOrder: userSortOrder
      });
      const res = await apiClient.get(`/admin/users?${query.toString()}`, token || undefined);
      setUsers(res.data || []);
      setUserTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error("Fetch users failed:", err);
    }
  };

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const query = new URLSearchParams({
        page: txPage.toString(),
        limit: USERS_LIMIT.toString(),
        search: debouncedTxSearch,
        sortBy: txSortBy,
        sortOrder: txSortOrder
      });
      if (txTypeFilter === "COIN_INCENTIVE") {
        query.append("coinIncentiveOnly", "true");
      } else if (txTypeFilter !== "ALL") {
        query.append("type", txTypeFilter);
      }
      if (txDateFrom) query.append("createdFrom", txDateFrom);
      if (txDateTo) query.append("createdTo", txDateTo);
      const res = await apiClient.get(`/admin/transactions?${query.toString()}`, token || undefined);
      setGlobalTransactions(res.data || []);
      setTxTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error("Fetch transactions failed:", err);
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await apiClient.get("/orders/admin/all", token || undefined);
      const list = res?.data?.orders || [];
      setOrders(list);

      const indexMap: Record<string, any> = {};
      for (const order of list) {
        if (order?.id) indexMap[order.id] = order;
      }
      setOrdersIndex(indexMap);
    } catch (err) {
      console.error("Fetch orders failed:", err);
    }
  };

  /* ─── Product CRUD ─── */
  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await apiClient.get("/products/admin/all", token || undefined);
      setProducts(res.products || res.data?.products || []);
    } catch (err) {
      console.error("Fetch products failed:", err);
    }
  };

  const handleSaveProduct = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!productForm.name || !productForm.weight) {
      showToast("Name and Weight are required");
      return;
    }
    setIsProductSaving(true);
    try {
      const body = {
        name: productForm.name,
        description: productForm.description || null,
        weight: Number(productForm.weight),
        purity: productForm.purity || "24K",
        stock: Number(productForm.stock) || 0,
        imageUrl: productForm.imageUrl || null,
      };
      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct.id}`, body, token);
        showToast("Product updated!");
      } else {
        await apiClient.post("/products", body, token);
        showToast("Product created!");
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setProductForm({ name: "", description: "", weight: "", purity: "24K", stock: "", imageUrl: "" });
      await fetchProducts();
    } catch (err: any) {
      showToast(err.message || "Failed to save product");
    } finally {
      setIsProductSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await apiClient.delete(`/products/${id}`, token);
      showToast("Product deactivated");
      await fetchProducts();
    } catch (err: any) {
      showToast(err.message || "Failed to delete product");
    }
  };

  const handleToggleProductActive = async (product: any) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await apiClient.put(`/products/${product.id}`, { isActive: !product.isActive }, token);
      showToast(product.isActive ? "Product deactivated" : "Product activated");
      await fetchProducts();
    } catch (err: any) {
      showToast(err.message || "Failed to toggle product");
    }
  };

  const openEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      weight: String(product.weight),
      purity: product.purity || "24K",
      stock: String(product.stock),
      imageUrl: product.imageUrl || "",
    });
    setIsProductModalOpen(true);
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: "", description: "", weight: "", purity: "24K", stock: "", imageUrl: "" });
    setIsProductModalOpen(true);
  };

  /* ─── Gold Mode Toggle ─── */
  const handleGoldModeToggle = async () => {
    const newMode = goldMode === "DIGITAL" ? "PHYSICAL" : "DIGITAL";
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await apiClient.put("/settings", { goldMode: newMode }, token);
      setGoldMode(newMode);
      setActiveTab("overview");
      showToast(`Switched to ${newMode === "DIGITAL" ? "Digital Gold" : "Physical Gold"} mode`);
    } catch (err: any) {
      showToast(err.message || "Failed to switch mode");
    }
  };

   const fetchWithdrawals = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const query = new URLSearchParams({
        page: wdPage.toString(),
        limit: USERS_LIMIT.toString(),
        search: debouncedWdSearch,
        sortBy: wdSortBy,
        sortOrder: wdSortOrder
      });
      const res = await apiClient.get(`/withdrawals/admin/all?${query.toString()}`, token || undefined);
      setWithdrawals(res.data || []);
      setWdTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error("Fetch withdrawals failed:", err);
    }
  };

   const fetchSystemSettings = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await apiClient.get("/settings", token || undefined);
      setGoldMode(res.goldMode === "PHYSICAL" ? "PHYSICAL" : "DIGITAL");
      setShowGST(res.showGST);
      setGstPercentage(Number(res.gstPercentage));
      setMonthlyProfitPercentage(Number(res.monthlyProfitPercentage || 5.0));
      setMonthlyReferralPercentage(Number(res.monthlyReferralPercentage || 5.0));
      setMonthlyStaffPercentage(Number(res.monthlyStaffPercentage || 5.0));
      setShowAdvancedSettings(!!res.showAdvancedSettings);
    } catch (err) {
      console.error("Fetch settings failed:", err);
    }
  };

  const fetchGoldPrice = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await apiClient.get("/products/admin/gold-price/current", token || undefined);
      const gp = res?.data?.goldPrice || res?.goldPrice || null;
      if (gp) {
        setGoldBuyPrice(Number(gp.buyPrice || 0));
        setGoldSellPrice(Number(gp.sellPrice || 0));
        setGoldPriceUpdatedAt(gp.timestamp || null);
      }
    } catch (err) {
      console.error("Fetch gold price failed:", err);
    }
  };

  const handleUpdateGoldPrice = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!Number.isFinite(goldBuyPrice) || !Number.isFinite(goldSellPrice) || goldBuyPrice <= 0 || goldSellPrice <= 0) {
      showToast("Enter valid positive buy/sell prices");
      return;
    }

    setIsGoldPriceSaving(true);
    try {
      await apiClient.post(
        "/products/admin/gold-price",
        { buyPrice: Number(goldBuyPrice), sellPrice: Number(goldSellPrice) },
        token || undefined
      );
      showToast("Gold price updated successfully");
      await fetchGoldPrice();
    } catch (err: any) {
      showToast(err.message || "Failed to update gold price");
    } finally {
      setIsGoldPriceSaving(false);
    }
  };
  const fetchLeaderboard = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/staff/leaderboard`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const json = await res.json();
        setLeaderboard(json);
      }
    } catch (err) {
      console.error("Fetch leaderboard failed:", err);
    }
  };

   const fetchStaff = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await apiClient.get("/admin/staff/list", token || undefined);
      setAllStaff(res || []);
    } catch (err) {
      console.error("Fetch staff failed:", err);
    }
  };

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (!token || !userJson) return;
    const basicUser = JSON.parse(userJson);
    try {
      const res = await fetch(`${API_BASE}/users/${basicUser.id}`, { headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        const fullUser = await res.json();
        setCurrentUser(fullUser);
        localStorage.setItem("user", JSON.stringify(fullUser));
      }
    } catch (err) {
      console.error("Fetch current user failed:", err);
    }
  };

  const handleUpdateSettings = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setIsSettingsSaving(true);
    try {
      await apiClient.put("/settings", { 
        goldMode,
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

  const loadTabData = async (tab: string) => {
    // Only fetch for the specific tab
    switch (tab) {
      case "overview":
        await Promise.all([fetchStats(), fetchLeaderboard()]);
        break;
      case "users":
        await Promise.all([fetchUsers(), fetchStaff()]);
        break;
      case "products":
        await fetchProducts();
        break;
      case "orders":
        await fetchOrders();
        break;
      case "transactions":
        await fetchTransactions();
        break;
      case "withdrawals":
        await fetchWithdrawals();
        break;
      case "settings":
        await Promise.all([fetchSystemSettings(), fetchGoldPrice()]);
        break;
      case "profile":
        await fetchCurrentUser();
        break;
    }
  };

  // ── Initialization ──
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return router.push("/auth/login");
      
      // Fetch settings first to know the gold mode
      await Promise.all([fetchSystemSettings(), fetchGoldPrice()]);
      // Load both basic stats AND current tab data in parallel
      await Promise.all([fetchStats(), fetchLeaderboard(), fetchCurrentUser(), fetchOrders()]);
      if (activeTab !== "overview" && activeTab !== "profile") {
        await loadTabData(activeTab);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  // ── Tab or Filter Refresh ──
  useEffect(() => {
    if (isLoading) return; // Wait for initial mount/auth check
    
    loadTabData(activeTab);
  }, [isLoading, activeTab, userSubTab, userPage, txPage, wdPage, debouncedUserSearch, userSortBy, userSortOrder, debouncedTxSearch, txSortBy, txSortOrder, txTypeFilter, txDateFrom, txDateTo, debouncedWdSearch, wdSortBy, wdSortOrder]);

  // Reset page when switching or searching
  useEffect(() => { setUserPage(1); }, [userSubTab, debouncedUserSearch, userSortBy, userSortOrder]);
  useEffect(() => { setTxPage(1); }, [debouncedTxSearch, txSortBy, txSortOrder, txTypeFilter, txDateFrom, txDateTo]);
  useEffect(() => { setWdPage(1); }, [debouncedWdSearch, wdSortBy, wdSortOrder]);
  useEffect(() => { setOrderPage(1); }, [orderSearch, orderStatusFilter]);

  const handleWithdrawal = async (id: string, action: "approve" | "reject") => {
    if (withdrawalActionLoadingId === id) return;
    setWithdrawalActionLoadingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/withdrawals/admin/${action}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId: id }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        const msg = data?.error || data?.message || "Failed to process withdrawal request";
        if (String(msg).toLowerCase().includes("already processed")) {
          showToast("This withdrawal request was already processed. Refreshing list...");
          await Promise.all([fetchWithdrawals(), fetchStats()]);
          return;
        }
        throw new Error(msg);
      }

      showToast(`Withdrawal ${action}d successfully`);
      await Promise.all([fetchWithdrawals(), fetchStats()]);
    } catch (err: any) {
      showToast(err.message || "Failed to process withdrawal request");
    } finally {
      setWithdrawalActionLoadingId(null);
    }
  };

  const handleDownload = async (tx: any) => {
    const isWithdrawal = tx.type === "WITHDRAWAL";
    const typeLabel = isWithdrawal ? "voucher" : "invoice";
    showToast(`Generating ${typeLabel}...`);
    try {
      const token = localStorage.getItem("token");
      let url = "";
      if (isWithdrawal) {
        const withdrawalId = tx.entityId || tx.id;
        url = `${API_BASE}/withdrawals/${withdrawalId}/invoice`;
      } else {
        const match = tx.description?.match(/#([a-z0-9-]+)/i);
        const advanceId = tx.entityId || (match ? match[1] : (tx.type === "GOLD_ADVANCE" ? tx.id : null));
        if (!advanceId) throw new Error("Could not determine Gold Advance reference.");
        url = `${API_BASE}/gold-advances/${advanceId}/invoice`;
      }

      const res = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} generation failed.`);
      const html = await res.text();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); }, 500);
      }
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const csvEscape = (value: any) => {
    const str = String(value ?? "");
    return `"${str.replace(/"/g, '""')}"`;
  };

  const handleExportTransactionsCsv = () => {
    if (!globalTransactions.length) {
      showToast("No rows available to export");
      return;
    }

    const headers = ["Transaction ID", "User", "Email", "Type", "Amount", "Description", "Order ID", "Processed By", "Created At"];
    const rows = globalTransactions.map((tx) => [
      tx.id,
      tx.user?.name || "",
      tx.user?.email || "",
      tx.type,
      Number(tx.amount || 0),
      tx.description || "",
      tx.entityId || "",
      tx.performedBy?.name || tx.processedBy || "SYSTEM",
      new Date(tx.createdAt).toISOString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `admin-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    showToast("CSV exported successfully");
  };

  const getOrderIdFromTx = (tx: any) => {
    if (tx?.entityId) return tx.entityId;
    if (!tx?.description) return "";
    const match = tx.description.match(/order\s+([a-z0-9]+)/i);
    return match?.[1] || "";
  };

  const openOrderDetailsById = async (orderId: string) => {
    if (!orderId) {
      showToast("Order reference not available");
      return;
    }

    setIsOrderModalOpen(true);
    setIsOrderLoading(true);
    setSelectedOrder(null);

    try {
      if (ordersIndex[orderId]) {
        setSelectedOrder(ordersIndex[orderId]);
        return;
      }

      if (orders.length > 0) {
        const fromState = orders.find((o: any) => o.id === orderId);
        if (fromState) {
          setSelectedOrder(fromState);
          return;
        }
      }

      const token = localStorage.getItem("token");
      const res = await apiClient.get("/orders/admin/all", token || undefined);
      const list = res?.data?.orders || [];
      const nextIndex: Record<string, any> = {};
      for (const order of list) {
        if (order?.id) nextIndex[order.id] = order;
      }
      setOrders(list);
      setOrdersIndex(nextIndex);
      setSelectedOrder(nextIndex[orderId] || null);
      if (!nextIndex[orderId]) {
        showToast("Order details not found");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load order details");
    } finally {
      setIsOrderLoading(false);
    }
  };

  const openOrderDetails = async (tx: any) => {
    const orderId = getOrderIdFromTx(tx);
    if (!orderId) {
      showToast("Order reference not available for this row");
      return;
    }
    await openOrderDetailsById(orderId);
  };

  const handleOrderStatusAction = async (orderId: string, action: "mark-ready" | "mark-delivered") => {
    if (orderActionLoadingId === orderId) return;
    setOrderActionLoadingId(orderId);
    try {
      const token = localStorage.getItem("token");
      const res = await apiClient.post(`/orders/admin/${action}`, { orderId }, token || undefined);
      const updatedOrder = res?.data?.order;
      const label = action === "mark-ready" ? "READY" : "DELIVERED";

      if (updatedOrder?.id) {
        setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
        setOrdersIndex((prev) => ({ ...prev, [updatedOrder.id]: updatedOrder }));
        if (selectedOrder?.id === updatedOrder.id) {
          setSelectedOrder(updatedOrder);
        }
      } else {
        await fetchOrders();
      }

      await fetchStats();
      showToast(`Order marked ${label} successfully`);
    } catch (err: any) {
      showToast(err.message || "Failed to update order status");
    } finally {
      setOrderActionLoadingId(null);
    }
  };

  const getOrderStatusClass = (status?: string) => {
    if (status === "DELIVERED") return "bg-green-500/10 text-green-500 dark:text-green-400";
    if (status === "READY") return "bg-blue-500/10 text-blue-500 dark:text-blue-400";
    if (status === "PAID") return "bg-purple-500/10 text-purple-500 dark:text-purple-400";
    if (status === "CANCELLED") return "bg-red-500/10 text-red-500 dark:text-red-400";
    return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
  };

  const getOrderTimelineSteps = (order: any) => {
    const statusRank: Record<string, number> = {
      PENDING: 0,
      PAID: 1,
      READY: 2,
      DELIVERED: 3,
      CANCELLED: 0,
    };
    const rank = statusRank[order?.status || "PENDING"] ?? 0;

    const steps = [
      { key: "CREATED", label: "Created", time: order?.createdAt, reached: true },
      { key: "PAID", label: "Paid", time: order?.paidAt, reached: rank >= 1 || !!order?.paidAt },
      { key: "READY", label: "Ready", time: order?.readyAt, reached: rank >= 2 || !!order?.readyAt },
      { key: "DELIVERED", label: "Delivered", time: order?.deliveredAt, reached: rank >= 3 || !!order?.deliveredAt },
    ];

    return steps;
  };

  const copyOrderId = async () => {
    if (!selectedOrder?.id) return;
    try {
      await navigator.clipboard.writeText(selectedOrder.id);
      showToast("Order ID copied");
    } catch {
      showToast("Failed to copy Order ID");
    }
  };

  const jumpToOrderInTransactions = () => {
    if (selectedOrder?.id) {
      setTxSearch(selectedOrder.id);
      setTxTypeFilter("ALL");
    }
    setActiveTab("transactions");
    setIsOrderModalOpen(false);
  };

  const normalizedOrderSearch = orderSearch.trim().toLowerCase();
  const filteredOrders = orders.filter((order: any) => {
    const statusOk = orderStatusFilter === "ALL" ? true : order?.status === orderStatusFilter;
    if (!statusOk) return false;
    if (!normalizedOrderSearch) return true;

    const haystack = [
      order?.id,
      String(order?.invoiceNo || ""),
      order?.user?.name,
      order?.user?.email,
      order?.product?.name,
      order?.paymentId,
      order?.razorpayPaymentId,
      order?.status,
      order?.paymentStatus,
    ].join(" ").toLowerCase();

    return haystack.includes(normalizedOrderSearch);
  });

  const orderTotalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_LIMIT));
  const paginatedOrders = filteredOrders.slice((orderPage - 1) * ORDERS_LIMIT, orderPage * ORDERS_LIMIT);
  const awaitingPrepCount = orders.filter((o: any) => o.status === "PAID").length;
  const readyCount = orders.filter((o: any) => o.status === "READY").length;
  const deliveredCount = orders.filter((o: any) => o.status === "DELIVERED").length;
  const ordersPendingOpsCount = orders.filter((o: any) => o.status === "PAID" || o.status === "READY").length;

  /* ─── Products Filtering ─── */
  const filteredProducts = products.filter((p: any) => {
    if (!productSearch) return true;
    const hay = [p.name, p.description, p.purity, p.id].join(" ").toLowerCase();
    return hay.includes(productSearch.toLowerCase());
  });
  const productTotalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_LIMIT));
  const paginatedProducts = filteredProducts.slice((productPage - 1) * PRODUCTS_LIMIT, productPage * PRODUCTS_LIMIT);

  /* ─── Derived navItems based on Gold Mode ─── */
  const navItems = goldMode === "PHYSICAL" ? physicalNavItems : digitalNavItems;

  const sidebarItems = navItems.map(item => ({
    ...item,
    badge:
      item.id === "withdrawals"
        ? (stats?.pendingWithdrawalsCount || undefined)
        : item.id === "orders"
          ? (ordersPendingOpsCount || undefined)
          : undefined,
    badgeColor: item.id === "orders" ? "bg-blue-500/20 text-blue-300" : "bg-red-500/20 text-red-300"
  }));

  const adminUser = {
    name: currentUser?.name || user?.name || "Administrator",
    role: user?.role === "SUPERADMIN" ? "SUPER ADMIN" : "ADMIN",
    details: user?.role === "SUPERADMIN" ? "System Root" : "Administrator",
    icon: user?.role === "SUPERADMIN" ? Crown : ShieldCheck,
    iconBg: user?.role === "SUPERADMIN" ? "bg-red-950" : "bg-bg-surface",
    iconColor: user?.role === "SUPERADMIN" ? "text-red-400" : "text-gold-400",
    borderColor: user?.role === "SUPERADMIN" ? "border-red-500/30" : "border-gold-500/20",
    photo: currentUser?.photo
  };

  /* ─── Search Bar Component ─── */
  const SearchBar = ({ value, onChange, placeholder }: any) => (
    <div className="relative group mb-6">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-gray-500 group-focus-within:text-gold-400 transition-colors" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg-surface border border-gold-500/10 focus:border-gold-400/30 text-text-primary text-sm rounded-xl py-3 pl-11 pr-4 outline-none transition-all placeholder:text-text-secondary/60 shadow-lg"
      />
    </div>
  );

  /* ─── Sortable Header Helper ─── */
  const SortHeader = ({ label, field, currentSort, currentOrder, onSort, align = "left" }: any) => {
    const isActive = currentSort === field;
    return (
      <th 
        className={`p-4 cursor-pointer hover:bg-gold-500/5 transition-colors ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"}`}
        onClick={() => onSort(field)}
      >
        <div className={`flex items-center gap-2 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : ""}`}>
          <span className={isActive ? "text-gold-400 font-bold" : ""}>{label}</span>
          <div className="flex flex-col -space-y-1">
            <TrendingUp className={`w-2 h-2 ${isActive && currentOrder === "asc" ? "text-gold-400" : "text-gray-600"}`} />
            <TrendingUp className={`w-2 h-2 rotate-180 ${isActive && currentOrder === "desc" ? "text-gold-400" : "text-gray-600"}`} />
          </div>
        </div>
      </th>
    );
  };

  const handleSort = (field: string, currentSort: string, setSort: any, currentOrder: string, setOrder: any) => {
    if (currentSort === field) {
      setOrder(currentOrder === "asc" ? "desc" : "asc");
    } else {
      setSort(field);
      setOrder("desc");
    }
  };

  const txVisibleCount = globalTransactions.length;
  const txVisibleTotal = globalTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className={`min-h-screen flex items-stretch transition-colors ${panicMode ? "bg-red-950" : "bg-bg-app"}`}>
      <DashboardSidebar
        items={sidebarItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={adminUser}
        onLogout={() => { localStorage.clear(); router.push("/auth/login"); }}
        isMobileOpen={mobileSidebarOpen}
        setIsMobileOpen={setMobileSidebarOpen}
        roleLabel={user?.role === "SUPERADMIN" ? "Super Admin" : "Admin"}
        accentColor="gold"
      />

      {/* Main */}
      <main className="flex-1 overflow-y-auto h-screen relative custom-scrollbar">
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
        <header className="sticky top-0 z-30 bg-bg-app/90 backdrop-blur-md border-b border-gold-500/10 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-text-secondary hover:text-text-primary p-1" onClick={() => setMobileSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-sm text-text-secondary hidden sm:block">Royal Gold Traders — Global HQ</span>
          </div>

          <GlobalSearch 
            onSelectUser={(u) => {
              setSelectedUser(u);
              setIsDetailsModalOpen(true);
            }}
            placeholder="Search users, email, mobile or aadhar..."
            className="flex-1 max-w-lg hidden md:block"
          />

          <div className="flex items-center gap-3">
            {/* Gold Mode Toggle */}
            <button
              onClick={handleGoldModeToggle}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                goldMode === "DIGITAL"
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                  : "bg-gold-500/10 border-gold-500/30 text-gold-400 hover:bg-gold-500/20"
              }`}
              title={`Currently: ${goldMode === "DIGITAL" ? "Digital Gold" : "Physical Gold"} — Click to switch`}
            >
              {goldMode === "DIGITAL" ? (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Digital Gold</span>
                </>
              ) : (
                <>
                  <ToggleRight className="w-4 h-4" />
                  <span className="hidden sm:inline">Physical Gold</span>
                </>
              )}
            </button>
            <ThemeToggle />
            <button onClick={() => showToast("No new system alerts")} className="relative text-text-secondary hover:text-gold-500 dark:hover:text-gold-400 transition-colors">
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
                    <h1 className="text-2xl font-heading font-bold text-text-primary mb-1">
                      {goldMode === "DIGITAL" ? "Digital Gold Command Center" : "Physical Gold Command Center"}
                    </h1>
                    <p className="text-text-secondary text-sm">
                      {goldMode === "DIGITAL" ? "Investment & yield metrics across all branches" : "Order & product metrics across all branches"}
                    </p>
                  </div>
                  <button onClick={() => { 
                    const tgaText = stats ? formatCurrency(stats.totalGoldAdvance) : "N/A";
                    downloadInvoicePDF({ 
                      id: "SYS-RPT", 
                      type: "Global System Report", 
                      date: new Date().toLocaleDateString(), 
                      amount: `${tgaText} Total Gold Advance`, 
                      rawAmount: stats?.totalGoldAdvance || 0,
                      customerName: "Super Admin" 
                    }); 
                    showToast("Global report downloaded!"); 
                  }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gold-500/20 text-text-secondary hover:text-text-primary text-sm font-medium transition-all"
                  >
                    <Download className="w-4 h-4" /> Export
                  </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-7">
                  {[
                    { label: "Today's Gold Advance", value: stats ? formatCurrency(stats.todayGoldAdvance || 0) : "...", status: "Today's Gold Advance", color: "text-gold-400", glass: "bg-gold-glass" },
                    { label: "Today's Withdrawals", value: stats ? formatCurrency(stats.todayWithdrawals || 0) : "...", status: "Today's Payouts", color: "text-red-400", glass: "bg-red-glass" },
                    { label: "Monthly Net Flow", value: stats ? formatCurrency(stats.monthlyNetFlow || 0) : "...", status: stats?.monthlyNetFlow >= 0 ? "Positive Flow" : "Negative Flow", color: stats?.monthlyNetFlow >= 0 ? "text-green-400" : "text-red-400", glass: stats?.monthlyNetFlow >= 0 ? "bg-green-glass" : "bg-red-glass" },
                    { label: "Monthly Growth", value: stats ? `${stats.monthlyGrowth || 0}%` : "...", status: "AUM Growth", color: "text-blue-400", glass: "bg-blue-glass" },
                    { label: "Coin Incentives (Total)", value: stats ? formatCurrency(stats.coinOrderIncentiveTotal || 0) : "...", status: `${stats?.coinOrderIncentiveCount || 0} Orders`, color: "text-purple-400", glass: "bg-blue-glass" },
                    { label: "Coin Incentives (Today)", value: stats ? formatCurrency(stats.coinOrderIncentiveToday || 0) : "...", status: `${stats?.coinOrderIncentiveTodayCount || 0} Orders Today`, color: "text-purple-400", glass: "bg-blue-glass" },
                    { label: "Total Gold Advance", value: stats ? formatCurrency(stats.totalGoldAdvance) : "...", status: "↑ Healthy", color: "text-gold-400", glass: "bg-gold-glass" },
                    { label: "Total Withdrawals", value: stats ? formatCurrency(stats.totalWithdrawals) : "...", status: "Approved Payouts", color: "text-red-400", glass: "bg-red-glass" },
                    { label: "Total Pending amount", value: stats ? formatCurrency(stats.totalPendingAmount || 0) : "...", status: "Awaiting Pay", color: "text-orange-400", glass: "bg-gold-glass" },
                    { label: "Total Customer", value: stats ? String(stats.customersCount || 0) : "...", status: "Verified Accounts", color: "text-green-400", glass: "bg-green-glass" },
                    { label: "Total Staffs", value: stats ? String(stats.staffCount || 0) : "...", status: "Active Personnel", color: "text-purple-400", glass: "bg-blue-glass" },
                    { label: "Pending Req", value: stats ? String(stats.pendingWithdrawalsCount || 0) : "...", status: "Requires Approval", color: "text-blue-400", glass: "bg-blue-glass" },
                  ].map(({ label, value, status, color, glass }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className={`${glass} p-5 rounded-2xl transition-all hover:scale-[1.03] active:scale-95 cursor-default flex flex-col justify-between min-h-[140px] border border-white/5`}>
                      <div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-2">{label}</p>
                        <h3 className={`text-xl sm:text-2xl font-heading font-black text-text-primary truncate mb-3 tracking-tight ${color.includes('gold') || color.includes('orange') ? 'text-glow-gold' : color.includes('red') ? 'text-red-500' : 'text-glow-blue'}`} title={value}>
                          {value}
                        </h3>
                      </div>
                      <div className={`text-[10px] font-bold ${color} flex items-center gap-1.5 uppercase tracking-tighter mt-auto`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} /> {status}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* AUM Chart */}
                <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-heading font-semibold text-text-primary mb-5 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-gold-500" /> Global Gold Advance Growth
                  </h3>
                  <div className="h-[220px]">
                    {stats?.aumTrend && <AdminAUMChart data={stats.aumTrend} />}
                  </div>
                </div>

                {/* Analytical Leaderboards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">

                  {/* ── Column 1: Top Customers / Buyers ── */}
                  <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-heading font-semibold text-text-primary flex items-center gap-2">
                        <Crown className="w-5 h-5 text-gold-500" /> {goldMode === "DIGITAL" ? "Top Investors" : "Top Buyers"}
                      </h3>
                      <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">
                        {goldMode === "DIGITAL" ? "High Value" : "Most Purchased"}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {goldMode === "DIGITAL" ? (
                        <>
                          {stats?.topCustomers?.map((c: any, i: number) => (
                            <div key={c.id} className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-gold-500/20 hover:bg-white/[0.08] transition-all gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-400 text-[10px] font-black border border-gold-500/20 shrink-0">{i + 1}</div>
                                <div className="min-w-0">
                                  <p className="text-sm text-text-primary font-bold truncate leading-tight">{c.name}</p>
                                  <p className="text-[10px] text-text-secondary truncate font-mono">{c.email}</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-black text-gold-400 tracking-tight">{formatCurrency(c.goldAdvance)}</p>
                                <p className="text-[9px] text-text-secondary uppercase tracking-widest font-bold">Advance</p>
                              </div>
                            </div>
                          ))}
                          {(!stats?.topCustomers || stats.topCustomers.length === 0) && (
                            <p className="text-sm text-gray-500 text-center py-5 italic">No customer data available yet.</p>
                          )}
                        </>
                      ) : (
                        <>
                          {stats?.topBuyers?.map((c: any, i: number) => (
                            <div key={c.id} className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-gold-500/20 hover:bg-white/[0.08] transition-all gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-400 text-[10px] font-black border border-gold-500/20 shrink-0">{i + 1}</div>
                                <div className="min-w-0">
                                  <p className="text-sm text-text-primary font-bold truncate leading-tight">{c.name}</p>
                                  <p className="text-[10px] text-text-secondary truncate font-mono">{c.email}</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-black text-gold-400 tracking-tight">{formatCurrency(c.totalSpent)}</p>
                                <p className="text-[9px] text-text-secondary uppercase tracking-widest font-bold">{c.orderCount} Orders</p>
                              </div>
                            </div>
                          ))}
                          {(!stats?.topBuyers || stats.topBuyers.length === 0) && (
                            <p className="text-sm text-gray-500 text-center py-5 italic">No buyer data available yet.</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* ── Column 2: Referrers ── */}
                  <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-heading font-semibold text-text-primary flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" /> {goldMode === "DIGITAL" ? "Top Network Referrers" : "Top Referrers"}
                      </h3>
                      <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">
                        {goldMode === "DIGITAL" ? "By AUM" : "By Order Value"}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {goldMode === "DIGITAL" ? (
                        <>
                          {stats?.topReferrers?.map((r: any, i: number) => (
                            <div key={r.id} className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-gold-500/20 hover:bg-white/[0.08] transition-all gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-[10px] font-black border border-blue-500/20 shrink-0">{i + 1}</div>
                                <div className="min-w-0">
                                  <p className="text-sm text-text-primary font-bold truncate leading-tight">{r.name}</p>
                                  <p className="text-[10px] text-text-secondary truncate">{r.refereeCount} Network users</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-black text-blue-400 tracking-tight">{formatCurrency(r.totalNetworkAUM)}</p>
                                <p className="text-[9px] text-text-secondary uppercase tracking-widest font-bold">Net AUM</p>
                              </div>
                            </div>
                          ))}
                          {(!stats?.topReferrers || stats.topReferrers.length === 0) && (
                            <p className="text-sm text-gray-500 text-center py-5 italic">No referral data available yet.</p>
                          )}
                        </>
                      ) : (
                        <>
                          {stats?.topPhysicalReferrers?.map((r: any, i: number) => (
                            <div key={r.id} className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-gold-500/20 hover:bg-white/[0.08] transition-all gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-[10px] font-black border border-blue-500/20 shrink-0">{i + 1}</div>
                                <div className="min-w-0">
                                  <p className="text-sm text-text-primary font-bold truncate leading-tight">{r.name}</p>
                                  <p className="text-[10px] text-text-secondary truncate">{r.refereeCount} Referrals</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-black text-blue-400 tracking-tight">{formatCurrency(r.totalOrderValue)}</p>
                                <p className="text-[9px] text-text-secondary uppercase tracking-widest font-bold">Order Value</p>
                              </div>
                            </div>
                          ))}
                          {(!stats?.topPhysicalReferrers || stats.topPhysicalReferrers.length === 0) && (
                            <p className="text-sm text-gray-500 text-center py-5 italic">No referral data available yet.</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* ── Column 3: Staff Performance ── */}
                  <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6 text-purple-400">
                      <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
                        <Crown className="w-5 h-5" /> Staff Performance
                      </h3>
                      <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">
                        {goldMode === "DIGITAL" ? "Commission Based" : "Orders Processed"}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {goldMode === "DIGITAL" ? (
                        <>
                          {leaderboard.map((s: any, i: number) => (
                            <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-gold-500/20 hover:bg-white/[0.08] transition-all gap-4">
                              <div className="flex items-center gap-4 min-w-0">
                                <div className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 shrink-0",
                                  i === 0 ? "bg-gold-500/10 border-gold-500 text-gold-400 shadow-[0_0_15px_rgba(255,215,0,0.2)]" : 
                                  i === 1 ? "bg-gray-400/10 border-gray-400 text-gray-300" : 
                                  i === 2 ? "bg-orange-600/10 border-orange-600 text-orange-400" : 
                                  "bg-bg-surface border-white/10 text-text-secondary"
                                )}>
                                  {i + 1}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-black text-text-primary truncate">{s.name}</p>
                                  <p className="text-[10px] text-text-secondary uppercase tracking-widest">{s.customersCount} Customers</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-black text-green-400 tracking-tight">{formatCurrency(s.totalCommission)}</p>
                                <p className="text-[9px] text-text-secondary uppercase font-bold tracking-widest">Earnings</p>
                              </div>
                            </div>
                          ))}
                          {(!leaderboard || leaderboard.length === 0) && (
                            <p className="text-sm text-gray-500 text-center py-5 italic w-full">No staff performance data available yet.</p>
                          )}
                        </>
                      ) : (
                        <>
                          {stats?.staffOrderPerformance?.map((s: any, i: number) => (
                            <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-gold-500/20 hover:bg-white/[0.08] transition-all gap-4">
                              <div className="flex items-center gap-4 min-w-0">
                                <div className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 shrink-0",
                                  i === 0 ? "bg-gold-500/10 border-gold-500 text-gold-400 shadow-[0_0_15px_rgba(255,215,0,0.2)]" : 
                                  i === 1 ? "bg-gray-400/10 border-gray-400 text-gray-300" : 
                                  i === 2 ? "bg-orange-600/10 border-orange-600 text-orange-400" : 
                                  "bg-bg-surface border-white/10 text-text-secondary"
                                )}>
                                  {i + 1}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-black text-text-primary truncate">{s.name}</p>
                                  <p className="text-[10px] text-text-secondary uppercase tracking-widest">{s.managedCustomers} Customers · {s.ordersProcessed} Orders</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-black text-green-400 tracking-tight">{formatCurrency(s.totalOrderValue)}</p>
                                <p className="text-[9px] text-text-secondary uppercase font-bold tracking-widest">Order Value</p>
                              </div>
                            </div>
                          ))}
                          {(!stats?.staffOrderPerformance || stats.staffOrderPerformance.length === 0) && (
                            <p className="text-sm text-gray-500 text-center py-5 italic w-full">No staff order data available yet.</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}


            {/* ── WITHDRAWALS ── */}
            {activeTab === "withdrawals" && (
              <motion.div key="withdrawals" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h1 className="text-2xl font-heading font-bold text-text-primary mb-6">Withdrawal Requests</h1>
                
                <SearchBar 
                  value={wdSearch} 
                  onChange={setWdSearch} 
                  placeholder="Search by ID, Customer Name or Email..." 
                />

                <div className="bg-bg-surface/30 border border-gold-500/10 rounded-2xl shadow-2xl overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-bg-app text-[10px] text-text-secondary uppercase tracking-widest font-bold border-b border-gold-500/10">
                      <tr>
                        <SortHeader label="Customer" field="user.name" currentSort={wdSortBy} currentOrder={wdSortOrder} onSort={(f: any) => handleSort(f, wdSortBy, setWdSortBy, wdSortOrder, setWdSortOrder)} />
                        <SortHeader label="Amount" field="amount" currentSort={wdSortBy} currentOrder={wdSortOrder} onSort={(f: any) => handleSort(f, wdSortBy, setWdSortBy, wdSortOrder, setWdSortOrder)} />
                        <SortHeader label="Date" field="createdAt" currentSort={wdSortBy} currentOrder={wdSortOrder} onSort={(f: any) => handleSort(f, wdSortBy, setWdSortBy, wdSortOrder, setWdSortOrder)} />
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/5">
                      {withdrawals.map((w) => (
                        <tr key={w.id}>
                          <td className="p-4">
                            <p className="text-text-primary font-medium">{w.user?.name}</p>
                            <p className="text-xs text-text-secondary">{w.user?.email}</p>
                          </td>
                          <td className="p-4 text-gold-500 dark:text-gold-400 font-bold">{formatCurrency(w.amount)}</td>
                          <td className="p-4 text-text-secondary text-sm">{new Date(w.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${w.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500 dark:text-yellow-400" : w.status === "APPROVED" ? "bg-green-500/10 text-green-500 dark:text-green-400" : "bg-red-500/10 text-red-500 dark:text-red-400"}`}>
                              {w.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {w.status === "PENDING" && (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleWithdrawal(w.id, "approve")}
                                  disabled={withdrawalActionLoadingId === w.id}
                                  className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {withdrawalActionLoadingId === w.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleWithdrawal(w.id, "reject")}
                                  disabled={withdrawalActionLoadingId === w.id}
                                  className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {withdrawalActionLoadingId === w.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {withdrawals.length === 0 && (
                        <tr><td colSpan={5} className="p-10 text-center text-gray-500">No withdrawal requests found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="mt-4 bg-bg-app border border-gold-500/10 p-4 rounded-xl flex items-center justify-between">
                  <p className="text-xs text-text-secondary">
                    Page <span className="text-text-primary font-bold">{wdPage}</span> of <span className="text-text-primary font-bold">{wdTotalPages}</span>
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setWdPage(prev => Math.max(1, prev - 1))}
                      disabled={wdPage === 1}
                      className="px-4 py-2 rounded-lg border border-gold-500/10 text-xs font-bold text-text-secondary hover:text-gold-500 hover:bg-gold-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <button 
                      onClick={() => setWdPage(prev => Math.min(wdTotalPages, prev + 1))}
                      disabled={wdPage >= wdTotalPages}
                      className="px-4 py-2 rounded-lg border border-gold-500/10 text-xs font-bold text-text-secondary hover:text-gold-500 hover:bg-gold-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── PRODUCT MANAGEMENT (Physical Gold Mode) ── */}
            {activeTab === "products" && (
              <motion.div key="products" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-text-primary">Product Management</h1>
                    <p className="text-text-secondary text-sm">Manage your physical gold products — coins, bars, and more</p>
                  </div>
                  <button onClick={openNewProduct}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-bg-app text-sm font-bold transition-all">
                    <Plus className="w-4 h-4" /> Add New Product
                  </button>
                </div>

                {/* Gold Price Info Card */}
                <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-5 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-text-primary text-sm mb-1">Current Gold Price</h3>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-text-secondary">Buy: <span className="text-gold-400 font-bold">{formatCurrency(goldBuyPrice)}/g</span></span>
                        <span className="text-text-secondary">Sell: <span className="text-gold-400 font-bold">{formatCurrency(goldSellPrice)}/g</span></span>
                        {goldPriceUpdatedAt && <span className="text-[10px] text-text-secondary">Last updated: {new Date(goldPriceUpdatedAt).toLocaleString("en-IN")}</span>}
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-lg bg-gold-500/10 text-gold-500">
                      {products.filter(p => p.isActive).length} Active Products
                    </span>
                  </div>
                </div>

                {/* Search */}
                <SearchBar value={productSearch} onChange={setProductSearch} placeholder="Search products by name, purity, or ID..." />

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
                  {paginatedProducts.map((product: any) => (
                    <div key={product.id} className={`bg-bg-surface border rounded-2xl overflow-hidden transition-all ${product.isActive ? "border-gold-500/10" : "border-red-500/20 opacity-60"}`}>
                      {/* Product Image */}
                      <div className="h-40 bg-bg-app flex items-center justify-center relative">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-text-secondary">
                            <ImageIcon className="w-10 h-10 opacity-30" />
                            <span className="text-[10px]">No Image</span>
                          </div>
                        )}
                        {/* Active/Inactive Badge */}
                        <span className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full ${product.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {product.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h4 className="font-bold text-text-primary text-sm mb-1">{product.name}</h4>
                        {product.description && <p className="text-[11px] text-text-secondary mb-2 line-clamp-2">{product.description}</p>}
                        
                        <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                          <div className="bg-bg-app rounded-lg px-2 py-1.5">
                            <span className="text-text-secondary">Weight</span>
                            <p className="font-bold text-text-primary">{Number(product.weight).toFixed(3)}g</p>
                          </div>
                          <div className="bg-bg-app rounded-lg px-2 py-1.5">
                            <span className="text-text-secondary">Purity</span>
                            <p className="font-bold text-gold-400">{product.purity}</p>
                          </div>
                          <div className="bg-bg-app rounded-lg px-2 py-1.5">
                            <span className="text-text-secondary">Stock</span>
                            <p className={`font-bold ${product.stock > 0 ? "text-green-400" : "text-red-400"}`}>{product.stock} pcs</p>
                          </div>
                          <div className="bg-bg-app rounded-lg px-2 py-1.5">
                            <span className="text-text-secondary">Price</span>
                            <p className="font-bold text-gold-400">{product.pricing ? formatCurrency(product.pricing.total) : "—"}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditProduct(product)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-gold-500/20 text-gold-400 text-[11px] font-bold hover:bg-gold-500/10 transition-all">
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button onClick={() => handleToggleProductActive(product)}
                            className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                              product.isActive 
                                ? "border-red-500/20 text-red-400 hover:bg-red-500/10" 
                                : "border-green-500/20 text-green-400 hover:bg-green-500/10"
                            }`}>
                            {product.isActive ? <><Eye className="w-3 h-3" /> Deactivate</> : <><Eye className="w-3 h-3" /> Activate</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-16 text-text-secondary">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No products found</p>
                    <button onClick={openNewProduct} className="mt-3 text-gold-400 text-sm font-bold hover:underline">
                      + Add your first product
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {productTotalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      Page {productPage} of {productTotalPages} · {filteredProducts.length} products
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => setProductPage(p => Math.max(1, p - 1))} disabled={productPage <= 1}
                        className="px-4 py-2 rounded-lg border border-gold-500/10 text-xs font-bold text-text-secondary hover:text-gold-500 hover:bg-gold-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                        Prev
                      </button>
                      <button onClick={() => setProductPage(p => Math.min(productTotalPages, p + 1))} disabled={productPage >= productTotalPages}
                        className="px-4 py-2 rounded-lg border border-gold-500/10 text-xs font-bold text-text-secondary hover:text-gold-500 hover:bg-gold-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── GOLD COIN ORDERS ── */}
            {activeTab === "orders" && (
              <motion.div key="orders" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-text-primary">Gold Coin Orders Management</h1>
                    <p className="text-text-secondary text-sm">Manage purchased coin orders from payment to delivery</p>
                  </div>
                  <button
                    onClick={fetchOrders}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gold-500/20 text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-gold-500/10 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" /> Refresh Orders
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                  <div className="bg-bg-surface border border-gold-500/10 rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-bold mb-1">Total Orders</p>
                    <p className="text-lg font-black text-text-primary">{orders.length}</p>
                  </div>
                  <div className="bg-bg-surface border border-gold-500/10 rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-bold mb-1">Paid Awaiting Ready</p>
                    <p className="text-lg font-black text-purple-500 dark:text-purple-400">{awaitingPrepCount}</p>
                  </div>
                  <div className="bg-bg-surface border border-gold-500/10 rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-bold mb-1">Ready for Delivery</p>
                    <p className="text-lg font-black text-blue-500 dark:text-blue-400">{readyCount}</p>
                  </div>
                  <div className="bg-bg-surface border border-gold-500/10 rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-bold mb-1">Delivered</p>
                    <p className="text-lg font-black text-green-500 dark:text-green-400">{deliveredCount}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-5 p-1 bg-bg-app rounded-xl w-fit border border-gold-500/10">
                  {[
                    { id: "ALL", label: "All" },
                    { id: "PENDING", label: "Pending" },
                    { id: "PAID", label: "Paid" },
                    { id: "READY", label: "Ready" },
                    { id: "DELIVERED", label: "Delivered" },
                    { id: "CANCELLED", label: "Cancelled" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setOrderStatusFilter(s.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${orderStatusFilter === s.id ? "bg-blue-500 text-white shadow-lg" : "text-text-secondary hover:text-text-primary"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <SearchBar
                  value={orderSearch}
                  onChange={setOrderSearch}
                  placeholder="Search by Order ID, Invoice, Customer, Email, Product or Payment reference..."
                />

                <div className="bg-bg-surface/30 border border-gold-500/10 rounded-2xl shadow-2xl overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-bg-app text-[10px] text-text-secondary uppercase tracking-widest font-bold border-b border-gold-500/10">
                      <tr>
                        <th className="p-4">Order</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Product</th>
                        <th className="p-4">Qty</th>
                        <th className="p-4">Total</th>
                        <th className="p-4">Payment</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Expected Delivery</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/5">
                      {paginatedOrders.map((order: any) => (
                        <tr key={order.id} className="hover:bg-bg-app/40 transition-colors">
                          <td className="p-4">
                            <p className="text-text-primary text-xs font-mono">{order.id}</p>
                            <p className="text-[10px] text-text-secondary">INV #{order.invoiceNo || "-"}</p>
                            <p className="text-[10px] text-text-secondary">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-text-primary text-sm font-medium">{order.user?.name || "-"}</p>
                            <p className="text-[10px] text-text-secondary">{order.user?.email || "-"}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-text-primary text-sm">{order.product?.name || "-"}</p>
                          </td>
                          <td className="p-4 text-text-primary text-sm font-bold">{order.quantity || 0}</td>
                          <td className="p-4 text-gold-500 dark:text-gold-400 font-bold">{formatCurrency(order.total || 0)}</td>
                          <td className="p-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${order.paymentStatus === "SUCCESS" ? "bg-green-500/10 text-green-500 dark:text-green-400" : order.paymentStatus === "FAILED" ? "bg-red-500/10 text-red-500 dark:text-red-400" : "bg-yellow-500/10 text-yellow-500 dark:text-yellow-400"}`}>
                              {order.paymentStatus || "PENDING"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${getOrderStatusClass(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4 text-[11px] text-text-secondary">
                            {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleString() : "-"}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openOrderDetailsById(order.id)}
                                className="p-2 rounded-lg border border-blue-500/20 text-blue-500 hover:bg-blue-500/10 transition-all"
                                title="View full order details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {order.status === "PAID" && (
                                <button
                                  onClick={() => handleOrderStatusAction(order.id, "mark-ready")}
                                  disabled={orderActionLoadingId === order.id}
                                  className="p-2 rounded-lg border border-purple-500/20 text-purple-500 hover:bg-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                  title="Mark order ready"
                                >
                                  {orderActionLoadingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                </button>
                              )}
                              {order.status === "READY" && (
                                <button
                                  onClick={() => handleOrderStatusAction(order.id, "mark-delivered")}
                                  disabled={orderActionLoadingId === order.id}
                                  className="p-2 rounded-lg border border-green-500/20 text-green-500 hover:bg-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                  title="Mark order delivered"
                                >
                                  {orderActionLoadingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedOrders.length === 0 && (
                        <tr><td colSpan={9} className="p-10 text-center text-gray-500 italic">No gold coin orders found for this filter.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 bg-bg-surface border border-gold-500/10 p-4 rounded-xl flex items-center justify-between">
                  <p className="text-xs text-text-secondary">
                    Page <span className="text-text-primary font-bold">{orderPage}</span> of <span className="text-text-primary font-bold">{orderTotalPages}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOrderPage((prev) => Math.max(1, prev - 1))}
                      disabled={orderPage === 1}
                      className="px-4 py-2 rounded-lg border border-gold-500/10 text-xs font-bold text-text-secondary hover:text-gold-500 hover:bg-gold-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setOrderPage((prev) => Math.min(orderTotalPages, prev + 1))}
                      disabled={orderPage >= orderTotalPages}
                      className="px-4 py-2 rounded-lg border border-gold-500/10 text-xs font-bold text-text-secondary hover:text-gold-500 hover:bg-gold-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TRANSACTIONS ── */}
            {activeTab === "transactions" && (
              <motion.div key="transactions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h1 className="text-2xl font-heading font-bold text-text-primary mb-6">Global Transaction History</h1>
                
                {/* Transaction Type Sub-Tabs */}
                <div className="flex gap-2 mb-6 p-1 bg-bg-app rounded-xl w-fit border border-gold-500/10">
                  {[
                    { id: "ALL", label: "All Transactions" },
                    { id: "DEPOSIT", label: "Deposits" },
                    { id: "WITHDRAWAL", label: "Withdrawals" },
                    { id: "STAFF_COMMISSION", label: "Staff Commission" },
                    { id: "COIN_INCENTIVE", label: "Coin Incentives" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setTxTypeFilter(tab.id)}
                      className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${txTypeFilter === tab.id ? "bg-gold-500 text-bg-app shadow-lg" : "text-text-secondary hover:text-gold-500"}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-4 mb-5">
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "ALL", label: "All Time" },
                        { id: "TODAY", label: "Today" },
                        { id: "7D", label: "Last 7 Days" },
                        { id: "30D", label: "Last 30 Days" }
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => applyTxDatePreset(preset.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${txDatePreset === preset.id ? "bg-blue-500 text-white" : "bg-bg-app text-text-secondary border border-gold-500/10 hover:text-text-primary"}`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <input
                        type="date"
                        value={txDateFrom}
                        onChange={(e) => {
                          setTxDatePreset("CUSTOM");
                          setTxDateFrom(e.target.value);
                        }}
                        className="bg-bg-app border border-gold-500/10 rounded-lg px-3 py-1.5 text-xs text-text-primary"
                      />
                      <span className="text-[10px] text-text-secondary text-center">to</span>
                      <input
                        type="date"
                        value={txDateTo}
                        onChange={(e) => {
                          setTxDatePreset("CUSTOM");
                          setTxDateTo(e.target.value);
                        }}
                        className="bg-bg-app border border-gold-500/10 rounded-lg px-3 py-1.5 text-xs text-text-primary"
                      />
                      <button
                        onClick={() => applyTxDatePreset("ALL")}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-bg-app border border-gold-500/10 text-text-secondary hover:text-text-primary transition-all"
                      >
                        Clear Range
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  <div className="bg-bg-surface border border-gold-500/10 rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-bold mb-1">Visible Rows</p>
                    <p className="text-lg font-black text-text-primary">{txVisibleCount}</p>
                  </div>
                  <div className="bg-bg-surface border border-gold-500/10 rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-bold mb-1">Visible Amount Total</p>
                    <p className="text-lg font-black text-blue-500 dark:text-blue-400">{formatCurrency(txVisibleTotal)}</p>
                  </div>
                </div>

                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleExportTransactionsCsv}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gold-500/20 text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-gold-500/10 transition-all"
                  >
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>

                <SearchBar 
                  value={txSearch} 
                  onChange={setTxSearch} 
                  placeholder="Search by ID, User Name or Description..." 
                />

                <div className="bg-bg-surface/30 border border-gold-500/10 rounded-2xl shadow-2xl overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-bg-app text-[10px] text-text-secondary uppercase tracking-widest font-bold border-b border-gold-500/10">
                      <tr>
                        <SortHeader label="User" field="user.name" currentSort={txSortBy} currentOrder={txSortOrder} onSort={(f: any) => handleSort(f, txSortBy, setTxSortBy, txSortOrder, setTxSortOrder)} />
                        <SortHeader label="Type" field="type" currentSort={txSortBy} currentOrder={txSortOrder} onSort={(f: any) => handleSort(f, txSortBy, setTxSortBy, txSortOrder, setTxSortOrder)} />
                        <SortHeader label="Amount" field="amount" currentSort={txSortBy} currentOrder={txSortOrder} onSort={(f: any) => handleSort(f, txSortBy, setTxSortBy, txSortOrder, setTxSortOrder)} />
                        <th className="p-4">Description</th>
                        <th className="p-4">Processed By</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Order</th>
                        <th className="p-4 text-right text-text-secondary">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/5">
                      {globalTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-bg-app/50 transition-colors">
                          <td className="p-4">
                            <p className="text-text-primary font-medium text-sm">{tx.user?.name}</p>
                            <p className="text-[10px] text-text-secondary">{tx.user?.email}</p>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              tx.type === "WITHDRAWAL"
                                ? "bg-red-500/10 text-red-500 dark:text-red-400"
                                : tx.type === "STAFF_COMMISSION"
                                  ? "bg-purple-500/10 text-purple-500 dark:text-purple-400"
                                  : "bg-green-500/10 text-green-500 dark:text-green-400"
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className={`p-4 font-bold text-sm ${tx.type === "WITHDRAWAL" ? "text-red-500" : "text-green-500 dark:text-green-400"}`}>
                            {tx.type === "WITHDRAWAL" ? "-" : "+"}{formatCurrency(tx.amount)}
                          </td>
                          <td className="p-4 text-text-secondary text-xs italic">{tx.description || "-"}</td>
                          <td className="p-4 text-text-secondary text-xs">{tx.performedBy?.name || "SYSTEM"}</td>
                          <td className="p-4 text-text-secondary text-xs">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-text-secondary text-xs">
                            <button
                              onClick={() => openOrderDetails(tx)}
                              className="px-2 py-1 rounded-md border border-blue-500/20 text-blue-500 hover:bg-blue-500/10 transition-all"
                            >
                              View Order
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            {["GOLD_ADVANCE", "WITHDRAWAL", "DEPOSIT"].includes(tx.type) && (
                              <button onClick={() => handleDownload(tx)} title="Download Receipt" className="p-2 text-gold-500 dark:text-gold-400 hover:text-gold-400 hover:scale-110 transition-all inline-flex">
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {globalTransactions.length === 0 && (
                        <tr><td colSpan={8} className="p-10 text-center text-gray-500 italic">No transactions found in system.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="mt-4 bg-bg-surface border border-gold-500/10 p-4 rounded-xl flex items-center justify-between">
                  <p className="text-xs text-text-secondary">
                    Page <span className="text-text-primary font-bold">{txPage}</span> of <span className="text-text-primary font-bold">{txTotalPages}</span>
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setTxPage(prev => Math.max(1, prev - 1))}
                      disabled={txPage === 1}
                      className="px-4 py-2 rounded-lg border border-gold-500/10 text-xs font-bold text-text-secondary hover:text-gold-500 hover:bg-gold-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <button 
                      onClick={() => setTxPage(prev => Math.min(txTotalPages, prev + 1))}
                      disabled={txPage >= txTotalPages}
                      className="px-4 py-2 rounded-lg border border-gold-500/10 text-xs font-bold text-text-secondary hover:text-gold-500 hover:bg-gold-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── USER MANAGEMENT ── */}
            {activeTab === "users" && (
              <motion.div key="users" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-text-primary mb-1">User Management</h1>
                    <p className="text-text-secondary text-sm">Manage system access and relationships</p>
                  </div>
                  <button onClick={() => setIsRegModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-bg-app text-sm font-bold transition-all transform active:scale-95 shadow-lg shadow-gold-500/20">
                    <UserPlus className="w-4 h-4" /> Add New User
                  </button>
                </div>

                {/* Sub Tabs */}
                <div className="flex gap-2 mb-6 p-1 bg-bg-app rounded-xl w-fit border border-gold-500/10">
                  {["CUSTOMER", "STAFF", "ADMIN", "SUPERADMIN"].map((role) => (
                    <button
                      key={role}
                      onClick={() => setUserSubTab(role)}
                      className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${userSubTab === role ? "bg-gold-500 text-bg-app shadow-lg" : "text-text-secondary hover:text-gold-500"}`}
                    >
                      {role === "SUPERADMIN" ? "SUPERADMINS" : `${role}S`}
                    </button>
                  ))}
                </div>

                <SearchBar 
                  value={userSearch} 
                  onChange={setUserSearch} 
                  placeholder={`Search ${userSubTab.toLowerCase()}s by ID, Name, Email or Phone...`} 
                />

                <div className="bg-bg-surface border border-gold-500/10 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-bg-app border-b border-gold-500/10">
                        <tr className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">
                          <th className="p-4 pl-6 text-center w-16">#</th>
                          <SortHeader label="Identity" field="name" currentSort={userSortBy} currentOrder={userSortOrder} onSort={(f: any) => handleSort(f, userSortBy, setUserSortBy, userSortOrder, setUserSortOrder)} />
                          {userSubTab === "CUSTOMER" && <th className="p-4">Referrer</th>}
                          {userSubTab === "CUSTOMER" && <th className="p-4">Assigned Staff</th>}
                          {userSubTab === "STAFF" && <th className="p-4">Managed Clients</th>}
                          <SortHeader label="Total Gold Advance" field="goldAdvancesSum" currentSort={userSortBy} currentOrder={userSortOrder} onSort={(f: any) => handleSort(f, userSortBy, setUserSortBy, userSortOrder, setUserSortOrder)} />
                          <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold-500/5">
                        {users.map((u, i) => (
                          <tr key={u.id} className="hover:bg-emerald-900/10 dark:hover:bg-emerald-900/20 transition-colors group">
                            <td className="p-4 pl-6 text-center">
                              <span className="text-xs text-text-secondary font-mono">
                                {((userPage - 1) * USERS_LIMIT + (i + 1)).toString().padStart(2, '0')}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${roleColor(u.role)}`}>
                                  {u.name[0]}
                                </div>
                                <div>
                                  <p className="font-semibold text-text-primary text-sm group-hover:text-gold-500 transition-colors">{u.name}</p>
                                  <p className="text-[10px] text-text-secondary font-mono uppercase">{u.id} · {u.email}</p>
                                </div>
                              </div>
                            </td>
                            {userSubTab === "CUSTOMER" && (
                              <td className="p-4">
                                {u.referrer ? (
                                  <div>
                                    <p className="text-xs text-text-primary">{u.referrer.name}</p>
                                    <p className="text-[9px] text-text-secondary">{u.referrer.email}</p>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-text-secondary italic">None</span>
                                )}
                              </td>
                            )}
                            {userSubTab === "CUSTOMER" && (
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                                  <span className="text-xs text-text-secondary">{u.assignedStaff?.name || "Unassigned"}</span>
                                </div>
                              </td>
                            )}
                            {userSubTab === "STAFF" && (
                              <td className="p-4">
                                <span className="bg-bg-app px-2 py-1 rounded text-xs text-text-secondary font-bold border border-gold-500/10">
                                  {u.customers?.length || 0} Clients
                                </span>
                              </td>
                            )}
                            <td className="p-4">
                              <p className="text-sm font-bold text-gold-400">
                                {formatCurrency(u.totalGoldAdvanceAmount || 0)}
                              </p>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => { setSelectedUser(u); setIsDetailsModalOpen(true); }} 
                                  className="p-2 rounded-lg border border-gold-500/10 text-gold-600 dark:text-gold-500 hover:bg-gold-500/10 transition-all">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button onClick={() => { setHistoryUser(u); setIsHistoryModalOpen(true); }} 
                                  className="p-2 rounded-lg border border-blue-500/10 text-blue-600 dark:text-blue-500 hover:bg-blue-500/10 transition-all">
                                  <History className="w-4 h-4" />
                                </button>
                                  <button onClick={() => { setProfileUser(u); setIsProfileModalOpen(true); }} 
                                    className="p-2 rounded-lg border border-gold-500/10 text-text-secondary hover:text-gold-500 hover:bg-gold-500/10 transition-all">
                                    <Settings className="w-4 h-4" />
                                  </button>
                                  {u.role === "CUSTOMER" && (
                                    <button onClick={() => { setGoldModalUser(u); setIsAddGoldModalOpen(true); }} 
                                      className="p-2 rounded-lg border border-green-500/10 text-green-500 hover:text-white hover:bg-green-500/20 hover:border-green-500/40 transition-all"
                                      title="Add Gold Advance">
                                      <Wallet className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                            </td>
                          </tr>
                        ))}
                        {users.filter(u => u.role === userSubTab).length === 0 && (
                          <tr><td colSpan={7} className="p-20 text-center text-gray-500 italic text-sm">No {userSubTab.toLowerCase()} accounts found in system.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="bg-bg-app border-t border-gold-500/10 p-4 flex items-center justify-between">
                    <p className="text-xs text-text-secondary">
                      Page <span className="text-text-primary font-bold">{userPage}</span> of <span className="text-text-primary font-bold">{userTotalPages}</span>
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setUserPage(prev => Math.max(1, prev - 1))}
                        disabled={userPage === 1}
                        className="px-4 py-2 rounded-lg border border-gold-500/10 text-xs font-bold text-text-secondary hover:text-gold-500 hover:bg-gold-500/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        Previous
                      </button>
                      <button 
                        onClick={() => setUserPage(prev => Math.min(userTotalPages, prev + 1))}
                        disabled={userPage >= userTotalPages}
                        className="px-4 py-2 rounded-lg border border-gold-500/10 text-xs font-bold text-text-secondary hover:text-gold-500 hover:bg-gold-500/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}


            {/* ── SYSTEM SETTINGS ── */}
            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="mb-7">
                  <h1 className="text-2xl font-heading font-bold text-text-primary mb-1">System Settings</h1>
                  <p className="text-text-secondary text-sm">Global configuration — Admin access only</p>
                </div>
                <div className="space-y-5 max-w-2xl">
                  {/* Gold Mode Switch */}
                  <div className={`border rounded-2xl p-6 ${goldMode === "DIGITAL" ? "bg-blue-500/5 border-blue-500/20" : "bg-gold-500/5 border-gold-500/20"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-text-primary flex items-center gap-2">
                          {goldMode === "DIGITAL" ? <ToggleLeft className="w-5 h-5 text-blue-400" /> : <ToggleRight className="w-5 h-5 text-gold-400" />}
                          Gold Business Mode
                        </h3>
                        <p className="text-[11px] text-text-secondary mt-1">
                          {goldMode === "DIGITAL" 
                            ? "Digital Gold — Users invest in gold advances with 5% monthly profit, staff commission & referral rewards" 
                            : "Physical Gold — Users purchase physical gold coins & products with order tracking & delivery management"
                          }
                        </p>
                      </div>
                      <button
                        onClick={handleGoldModeToggle}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          goldMode === "DIGITAL"
                            ? "bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                            : "bg-gold-500/10 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20"
                        }`}
                      >
                        Switch to {goldMode === "DIGITAL" ? "Physical Gold" : "Digital Gold"}
                      </button>
                    </div>
                  </div>

                  {/* Gold Price Control */}
                  <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-text-primary">Gold Coin Price Control</h3>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-gold-500">Admin Controlled</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="text-xs font-medium text-text-secondary mb-1 block">Buy Price (INR / gram)</label>
                        <input
                          type="number"
                          value={goldBuyPrice}
                          onChange={(e) => setGoldBuyPrice(Number(e.target.value))}
                          className="w-full bg-bg-app border border-gold-500/20 rounded-lg py-2 px-3 text-sm text-text-primary outline-none focus:border-gold-500/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-secondary mb-1 block">Sell Price (INR / gram)</label>
                        <input
                          type="number"
                          value={goldSellPrice}
                          onChange={(e) => setGoldSellPrice(Number(e.target.value))}
                          className="w-full bg-bg-app border border-gold-500/20 rounded-lg py-2 px-3 text-sm text-text-primary outline-none focus:border-gold-500/50 transition-all"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-text-secondary mb-4">
                      This price is used for all customer-facing coin prices and new purchase calculations.
                      {goldPriceUpdatedAt ? ` Last updated: ${new Date(goldPriceUpdatedAt).toLocaleString("en-IN")}` : ""}
                    </p>

                    <button
                      onClick={handleUpdateGoldPrice}
                      disabled={isGoldPriceSaving}
                      className={`px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-bg-app text-sm font-bold transition-all flex items-center gap-2 ${isGoldPriceSaving ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                      {isGoldPriceSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isGoldPriceSaving ? "Updating Price..." : "Update Gold Price"}
                    </button>
                  </div>

                  {/* System Info */}
                  <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6">
                    <h3 className="font-semibold text-text-primary mb-4">Platform Identity</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Platform Name", value: "Royal Gold Traders" },
                        { label: "Version", value: "v2.0.0-production" },
                        { label: "Headquarters", value: "Patna, Bihar, India" },
                        { label: "Database", value: "Hostinger MySQL · Connected ✓" },
                        { label: "Active Since", value: "January 2024" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between py-2 border-b border-gold-500/5 last:border-0 text-sm">
                          <span className="text-text-secondary">{label}</span>
                          <span className="font-medium text-text-primary">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                   {/* Global Controls */}
                  <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6">
                    <h3 className="font-semibold text-text-primary mb-4">Global Controls</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b border-gold-500/5">
                        <div className="flex flex-col">
                          <span className="text-sm text-text-primary font-medium tracking-wide">Show GST in Invoice</span>
                          <span className="text-[10px] text-text-secondary">Enable or disable GST calculations on customer receipts</span>
                        </div>
                        <button onClick={() => setShowGST(!showGST)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${showGST ? "bg-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.3)]" : "bg-bg-app border border-gold-500/20"}`}>
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${showGST ? "left-[22px]" : "left-0.5"}`} />
                        </button>
                      </div>

                      {showGST && (
                        <div className="flex items-center justify-between pb-4 border-b border-gold-500/5">
                          <div className="flex flex-col">
                            <span className="text-sm text-text-primary font-medium tracking-wide">GST Percentage (%)</span>
                            <span className="text-[10px] text-text-secondary">The current GST rate applied to taxable gold advances</span>
                          </div>
                          <div className="relative w-20">
                            <input 
                              type="number" 
                              value={gstPercentage}
                              onChange={(e) => setGstPercentage(Number(e.target.value))}
                              className="w-full bg-bg-app border border-gold-500/20 rounded-lg py-1.5 px-3 text-sm text-text-primary text-right outline-none focus:border-gold-500/50 transition-all"
                            />
                            <span className="absolute right-[-14px] top-1/2 -translate-y-1/2 text-text-secondary text-xs">%</span>
                          </div>
                        </div>
                      )}

                      {[
                        { label: "Nightly yield distribution (cron job)", on: true },
                        { label: "New customer self-registration", on: false },
                        { label: "SMS notifications to all customers", on: true },
                      ].map(({ label, on }, i) => (
                        <div key={i} className="flex items-center justify-between opacity-50 cursor-not-allowed">
                          <span className="text-sm text-text-secondary">{label}</span>
                          <button disabled
                            className={`w-10 h-5 rounded-full transition-colors relative ${on ? "bg-gold-500/40" : "bg-bg-app border border-gold-500/10"}`}>
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Profit Configuration - Only shown if showAdvancedSettings is true in DB */}
                  {showAdvancedSettings && (
                    <div className="bg-bg-surface border border-gold-500/10 rounded-2xl p-6">
                      <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-gold-500" /> Profit & Commission Rates
                      </h3>
                      <div className="space-y-4">
                        {[
                          { label: "Monthly Profit (%)", value: monthlyProfitPercentage, setter: setMonthlyProfitPercentage, desc: "Customer's monthly return on advance" },
                          { label: "Monthly Referral (%)", value: monthlyReferralPercentage, setter: setMonthlyReferralPercentage, desc: "Referrer's reward per unique advance" },
                          { label: "Monthly Staff (%)", value: monthlyStaffPercentage, setter: setMonthlyStaffPercentage, desc: "Staff commission per managed client" }
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between pb-4 border-b border-gold-500/5 last:border-0 last:pb-0">
                            <div className="flex flex-col">
                              <span className="text-sm text-text-primary font-medium tracking-wide">{item.label}</span>
                              <span className="text-[10px] text-text-secondary">{item.desc}</span>
                            </div>
                            <div className="relative w-24">
                              <input 
                                type="number" 
                                step="0.1"
                                value={item.value}
                                onChange={(e) => item.setter(Number(e.target.value))}
                                className="w-full bg-bg-app border border-gold-500/20 rounded-lg py-1.5 px-3 text-sm text-text-primary text-right outline-none focus:border-gold-500/50 transition-all"
                              />
                              <span className="absolute right-[-14px] top-1/2 -translate-y-1/2 text-text-secondary text-xs">%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Danger Zone */}
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                    <h3 className="font-semibold text-red-500 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Danger Zone
                    </h3>
                    <div className="space-y-3">
                      {["Force logout all sessions", "Reset all branch monthly lead counts", "Trigger full system backup now"].map((action) => (
                        <button key={action} onClick={() => showToast(`"${action}" — requires backend confirmation.`)}
                          className="w-full py-2.5 rounded-xl border border-red-500/20 text-red-500 text-sm hover:bg-red-500/10 transition-all text-left px-4 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 shrink-0" /> {action}
                        </button>
                      ))}
                    </div>
                  </div>
                   <button 
                    onClick={handleUpdateSettings}
                    disabled={isSettingsSaving}
                    className={`w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-bg-app font-bold transition-all flex items-center justify-center gap-2 ${isSettingsSaving ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {isSettingsSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSettingsSaving ? "Updating System..." : "Save Global Settings"}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <ProfileTab 
                  user={currentUser || user} 
                  onUpdateSuccess={(updated) => {
                    setCurrentUser(updated);
                    localStorage.setItem("user", JSON.stringify({ ...user, ...updated }));
                    showToast("Profile updated successfully!");
                  }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <UserRegistrationModal 
        isOpen={isRegModalOpen} 
        onClose={() => setIsRegModalOpen(false)} 
        onSuccess={(msg) => { showToast(msg); fetchUsers(); }}
        callerRole="ADMIN"
      />

      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        user={selectedUser}
        allStaff={allStaff}
        onUpdate={() => { fetchUsers(); setIsDetailsModalOpen(false); }}
      />

      <UserTransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        user={historyUser}
        callerRole="ADMIN"
      />

      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        user={profileUser} 
        onUpdate={() => { showToast("Profile updated successfully"); fetchUsers(); }} 
        callerRole="ADMIN"
      />

      <AddGoldAdvanceModal 
        isOpen={isAddGoldModalOpen} 
        onClose={() => { setIsAddGoldModalOpen(false); setGoldModalUser(null); }} 
        user={goldModalUser} 
        onSuccess={(m) => { showToast(m); fetchUsers(); fetchStats(); }} 
      />

      {/* Product Add/Edit Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-5"
            onClick={() => setIsProductModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              className="w-full max-w-lg bg-bg-surface border border-gold-500/20 rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-text-primary">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                <button onClick={() => setIsProductModalOpen(false)} className="text-text-secondary hover:text-text-primary"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1 block">Product Name *</label>
                  <input type="text" value={productForm.name} onChange={(e) => setProductForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. 1 Gram Gold Coin"
                    className="w-full bg-bg-app border border-gold-500/20 rounded-lg py-2 px-3 text-sm text-text-primary outline-none focus:border-gold-500/50 transition-all" />
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1 block">Description</label>
                  <textarea value={productForm.description} onChange={(e) => setProductForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Short description of the product..."
                    rows={2}
                    className="w-full bg-bg-app border border-gold-500/20 rounded-lg py-2 px-3 text-sm text-text-primary outline-none focus:border-gold-500/50 transition-all resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1 block">Weight (grams) *</label>
                    <input type="number" step="0.001" value={productForm.weight} onChange={(e) => setProductForm(f => ({ ...f, weight: e.target.value }))}
                      placeholder="1.000"
                      className="w-full bg-bg-app border border-gold-500/20 rounded-lg py-2 px-3 text-sm text-text-primary outline-none focus:border-gold-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1 block">Purity</label>
                    <select value={productForm.purity} onChange={(e) => setProductForm(f => ({ ...f, purity: e.target.value }))}
                      className="w-full bg-bg-app border border-gold-500/20 rounded-lg py-2 px-3 text-sm text-text-primary outline-none focus:border-gold-500/50 transition-all">
                      <option value="24K">24K (999)</option>
                      <option value="22K">22K (916)</option>
                      <option value="18K">18K (750)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1 block">Stock (quantity)</label>
                    <input type="number" value={productForm.stock} onChange={(e) => setProductForm(f => ({ ...f, stock: e.target.value }))}
                      placeholder="0"
                      className="w-full bg-bg-app border border-gold-500/20 rounded-lg py-2 px-3 text-sm text-text-primary outline-none focus:border-gold-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1 block">Image URL</label>
                    <input type="text" value={productForm.imageUrl} onChange={(e) => setProductForm(f => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-bg-app border border-gold-500/20 rounded-lg py-2 px-3 text-sm text-text-primary outline-none focus:border-gold-500/50 transition-all" />
                  </div>
                </div>

                {/* Price Preview */}
                {productForm.weight && goldSellPrice > 0 && (
                  <div className="bg-bg-app rounded-lg p-3 border border-gold-500/10">
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-2">Price Preview (at current sell price)</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">{Number(productForm.weight).toFixed(3)}g × {formatCurrency(goldSellPrice)}/g</span>
                      <span className="font-bold text-gold-400">
                        {formatCurrency(Number(productForm.weight) * goldSellPrice * 1.03)} <span className="text-[10px] text-text-secondary">(incl. 3% GST)</span>
                      </span>
                    </div>
                  </div>
                )}

                <button onClick={handleSaveProduct} disabled={isProductSaving}
                  className={`w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-bg-app font-bold transition-all flex items-center justify-center gap-2 ${isProductSaving ? "opacity-70 cursor-not-allowed" : ""}`}>
                  {isProductSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isProductSaving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOrderModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-5"
            onClick={() => setIsOrderModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              className="w-full max-w-xl bg-bg-surface border border-gold-500/20 rounded-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary">Order Details</h3>
                <button onClick={() => setIsOrderModalOpen(false)} className="text-text-secondary hover:text-text-primary"><X className="w-4 h-4" /></button>
              </div>
              {isOrderLoading ? (
                <div className="py-10 flex items-center justify-center text-text-secondary">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading order...
                </div>
              ) : selectedOrder ? (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="bg-bg-app rounded-lg p-3 border border-gold-500/10">
                      <p className="text-text-secondary text-xs mb-1">Order ID</p>
                      <p className="text-text-primary font-mono break-all mb-2">{selectedOrder.id}</p>
                      <button onClick={copyOrderId} className="px-2 py-1 rounded-md border border-gold-500/20 text-xs text-text-secondary hover:text-text-primary hover:bg-gold-500/10 transition-all">
                        Copy Order ID
                      </button>
                    </div>
                    <div className="bg-bg-app rounded-lg p-3 border border-gold-500/10">
                      <p className="text-text-secondary text-xs mb-1">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs rounded font-bold uppercase tracking-wider ${getOrderStatusClass(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="bg-bg-app rounded-lg p-3 border border-gold-500/10"><p className="text-text-secondary text-xs mb-1">Customer</p><p className="text-text-primary">{selectedOrder.user?.name || "-"}</p></div>
                    <div className="bg-bg-app rounded-lg p-3 border border-gold-500/10"><p className="text-text-secondary text-xs mb-1">Quantity</p><p className="text-text-primary">{selectedOrder.quantity || 0}</p></div>
                    <div className="bg-bg-app rounded-lg p-3 border border-gold-500/10"><p className="text-text-secondary text-xs mb-1">Total</p><p className="text-text-primary font-semibold">{formatCurrency(selectedOrder.total || 0)}</p></div>
                    <div className="bg-bg-app rounded-lg p-3 border border-gold-500/10"><p className="text-text-secondary text-xs mb-1">Created</p><p className="text-text-primary">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "-"}</p></div>
                    <div className="bg-bg-app rounded-lg p-3 border border-gold-500/10"><p className="text-text-secondary text-xs mb-1">Expected Delivery</p><p className="text-text-primary">{selectedOrder.expectedDeliveryDate ? new Date(selectedOrder.expectedDeliveryDate).toLocaleString() : "-"}</p></div>
                  </div>

                  <div className="mt-4 bg-bg-app rounded-lg p-4 border border-gold-500/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">Order Timeline</p>
                    <div className="sm:hidden grid grid-cols-1 gap-2">
                      {getOrderTimelineSteps(selectedOrder).map((step, idx) => (
                        <motion.div
                          key={step.key}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.05 }}
                          className={`rounded-lg p-2 border ${step.reached ? "border-green-500/30 bg-green-500/5" : "border-gold-500/10 bg-bg-surface/40"}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${step.reached ? "bg-green-500/20 text-green-500" : "bg-bg-surface text-text-secondary border border-gold-500/10"}`}>
                              {idx + 1}
                            </span>
                            <p className={`text-[10px] uppercase tracking-wider font-bold ${step.reached ? "text-green-500" : "text-text-secondary"}`}>{step.label}</p>
                          </div>
                          <p className="text-[11px] text-text-primary mt-1 ml-7">
                            {step.time ? new Date(step.time).toLocaleString() : "Pending"}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    <div className="hidden sm:flex items-start">
                      {getOrderTimelineSteps(selectedOrder).map((step, idx, arr) => (
                        <div key={step.key} className="flex items-start flex-1">
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, delay: idx * 0.06 }}
                            className={`rounded-lg p-2 border w-full min-h-[72px] ${step.reached ? "border-green-500/30 bg-green-500/5" : "border-gold-500/10 bg-bg-surface/40"}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${step.reached ? "bg-green-500/20 text-green-500" : "bg-bg-surface text-text-secondary border border-gold-500/10"}`}>
                                {idx + 1}
                              </span>
                              <p className={`text-[10px] uppercase tracking-wider font-bold ${step.reached ? "text-green-500" : "text-text-secondary"}`}>{step.label}</p>
                            </div>
                            <p className="text-[11px] text-text-primary mt-1 ml-7">
                              {step.time ? new Date(step.time).toLocaleString() : "Pending"}
                            </p>
                          </motion.div>
                          {idx < arr.length - 1 && (
                            <motion.div
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: 0.2, delay: idx * 0.06 + 0.1 }}
                              className={`h-[2px] mt-5 mx-2 flex-1 origin-left ${step.reached ? "bg-green-500/40" : "bg-gold-500/10"}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-secondary py-6 text-center">Order information unavailable.</p>
              )}
              {!isOrderLoading && (
                <div className="mt-5 pt-4 border-t border-gold-500/10 flex justify-end gap-2">
                  <button
                    onClick={() => setIsOrderModalOpen(false)}
                    className="px-3 py-2 rounded-lg border border-gold-500/20 text-xs font-bold text-text-secondary hover:text-text-primary transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={jumpToOrderInTransactions}
                    className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold transition-all"
                  >
                    Open Full Transaction List
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  </RoleGuard>
);
}


