"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNavbar from "@/components/BottomNavbar";
import AdminHeader from "@/components/AdminHeader";

interface TransactionType {
  _id: string;
  txnId: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  createdAt: string;
  sender: { name: string };
  receiver: { name: string };
  description?: string;
}

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, pendingEscrow: 0, completedPayouts: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
      
      const queryParams = new URLSearchParams();
      if (activeTab !== "All") queryParams.append("status", activeTab === "Escrow" ? "Escrow" : "Success");
      if (searchQuery) queryParams.append("search", searchQuery);

      const res = await fetch(`${API_URL}/admin/transactions?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTransactions();
  }, [activeTab, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Success": return "text-primary";
      case "Escrow": return "text-amber-500";
      case "Pending": return "text-slate-500";
      default: return "text-slate-400";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "Payout": return "account_balance_wallet";
      case "Deposit": return "lock_clock";
      case "Commission": return "percent";
      default: return "payments";
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <AdminHeader />

      <main className="flex-1 max-w-5xl mx-auto w-full pb-32">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-sm border border-primary/5 hover:border-primary/20 transition-all"
          >
            <div className="flex justify-between items-start">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Revenue</p>
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">+12.5%</span>
            </div>
            <p className="text-2xl font-extrabold tracking-tight">${stats.totalRevenue.toLocaleString()}</p>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ duration: 1 }}
                className="bg-primary h-full rounded-full"
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-sm border border-primary/5 hover:border-primary/20 transition-all"
          >
            <div className="flex justify-between items-start">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Escrow</p>
            </div>
            <p className="text-2xl font-extrabold tracking-tight">${stats.pendingEscrow.toLocaleString()}</p>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "40%" }}
                transition={{ duration: 1 }}
                className="bg-amber-500 h-full rounded-full"
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-sm border border-primary/5 hover:border-primary/20 transition-all"
          >
            <div className="flex justify-between items-start">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Completed Payouts</p>
            </div>
            <p className="text-2xl font-extrabold tracking-tight">${stats.completedPayouts.toLocaleString()}</p>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "60%" }}
                transition={{ duration: 1, delay: 0.9 }}
                className="bg-primary/60 h-full rounded-full"
              />
            </div>
          </motion.div>
        </div>

        {/* Search & Filter Section */}
        <div className="px-4 py-2 flex flex-col gap-4">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            <input 
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium" 
              placeholder="Search transactions by ID, name or project..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar scrollbar-hide">
            {["All", "Deposits", "Payouts", "Escrow", "Commission"].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-black uppercase tracking-widest transition-all relative ${
                  activeTab === tab ? "text-primary" : "text-slate-500 dark:text-slate-400 hover:text-primary"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activePaymentTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="px-4 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200">Recent Transactions</h3>
            <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">View All Report</button>
          </div>
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
                ))
              ) : (
                transactions.map((txn, idx) => (
                  <motion.div 
                    layout
                    key={txn._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-primary/5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center ${getStatusColor(txn.status)} group-hover:scale-110 transition-transform`}>
                          <span className="material-symbols-outlined text-[24px]">{getIcon(txn.type)}</span>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 dark:text-slate-100">{txn.sender?.name || "System"}</h4>
                          <p className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest">{txn.txnId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 dark:text-slate-100 tracking-tight text-lg">${txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter mt-1 ${
                          txn.status === "Success" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" :
                          txn.status === "Escrow" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" :
                          "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                        }`}>
                          {txn.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-800/50">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Type: <span className="text-slate-900 dark:text-slate-200">{txn.type}</span>
                      </span>
                      <span className="text-[10px] font-black text-slate-400 italic">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            
            {!isLoading && transactions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
                  <span className="material-symbols-outlined text-3xl">search_off</span>
                </div>
                <h4 className="font-extrabold text-slate-800 dark:text-slate-200">No transactions found</h4>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNavbar />
    </div>
  );
}
