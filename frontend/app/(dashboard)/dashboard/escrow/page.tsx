"use client";
import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { useStore } from "@/lib/store";
import { 
  ShieldCheck, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { motion } from "framer-motion";

interface Transaction {
  _id: string;
  txnId: string;
  amount: number;
  currency: string;
  sender: {
    _id: string;
    name: string;
    imageUrl: string;
  };
  receiver: {
    _id: string;
    name: string;
    imageUrl: string;
  };
  status: "Success" | "Pending" | "Escrow" | "Failed";
  type: "Payout" | "Deposit" | "Commission" | "Milestone";
  description?: string;
  job?: {
    title: string;
  };
  createdAt: string;
}

interface Summary {
  escrowAsSender: { total: number; count: number };
  escrowAsReceiver: { total: number; count: number };
  totalSpent: number;
  totalEarned: number;
}

export default function EscrowDashboard() {
  const { user } = useStore();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

        const [txRes, summaryRes] = await Promise.all([
          fetch(`${API_URL}/transactions`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/transactions/summary`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (txRes.ok && summaryRes.ok) {
          const txData = await txRes.json();
          const summaryData = await summaryRes.json();
          setTransactions(txData);
          setSummary(summaryData);
        }
      } catch (error) {
        console.error("Error fetching escrow data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    if (filter === "all") return true;
    if (filter === "escrow") return tx.status === "Escrow";
    if (filter === "completed") return tx.status === "Success";
    return true;
  });

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium tracking-tight">Loading ledger...</p>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader 
        user={user} 
        title="Escrow & Payments" 
        subtitle="Manage your secure transactions and view payment history."
      />

      <main className="max-w-[1240px] mx-auto px-6 py-8 md:px-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total in Escrow (Paid as Client) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4">
              <div className="size-10 bg-amber-50 dark:bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">In Escrow</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              ${(summary?.escrowAsSender.total || 0).toLocaleString()}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-500/10 w-fit px-2.5 py-1 rounded-lg uppercase tracking-wider">
               {summary?.escrowAsSender.count || 0} Deposits
            </div>
          </motion.div>

          {/* Pending Income (For Freelancers) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4">
              <div className="size-10 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Pending Income</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              ${(summary?.escrowAsReceiver.total || 0).toLocaleString()}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-500/10 w-fit px-2.5 py-1 rounded-lg uppercase tracking-wider">
               {summary?.escrowAsReceiver.count || 0} Secured
            </div>
          </motion.div>

          {/* Total Spent */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 dark:bg-slate-800 p-6 rounded-[24px] shadow-xl relative overflow-hidden group border border-slate-800"
          >
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Spent</p>
            <h3 className="text-2xl font-black text-white mb-2">
              ${(summary?.totalSpent || 0).toLocaleString()}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">
               Lifetime Spend
            </div>
          </motion.div>

          {/* Total Earned */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-primary p-6 rounded-[24px] shadow-xl shadow-primary/20 relative overflow-hidden group text-white"
          >
            <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Total Earned</p>
            <h3 className="text-2xl font-black text-white mb-2">
              ${(summary?.totalEarned || 0).toLocaleString()}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-white/50 uppercase tracking-wider">
               Lifetime Income
            </div>
          </motion.div>
        </div>

        {/* Transactions Table Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          {/* List Header/Filters */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Ledger</h2>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search ledger..."
                  className="pl-11 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none transition-all w-60 font-medium"
                />
              </div>

              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {["all", "escrow", "completed"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      filter === tab 
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" 
                      : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Partner</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, idx) => (
                    <motion.tr 
                      key={tx._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                             tx.status === "Escrow" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600" :
                             tx.status === "Success" ? "bg-green-50 dark:bg-green-500/10 text-green-600" :
                             "bg-slate-100 dark:bg-slate-800 text-slate-400"
                           }`}>
                             {tx.sender._id === user?._id ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                           </div>
                           <div>
                              <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 truncate max-w-[200px]">
                                {tx.description || tx.job?.title || "Project Payment"}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.txnId}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           {(() => {
                             const partner = tx.sender._id === user?._id ? tx.receiver : tx.sender;
                             const partnerName = partner?.name || "User";
                             const partnerImage = partner?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerName)}&background=0b141a&color=fff`;
                             
                             return (
                               <>
                                 <img 
                                   src={partnerImage} 
                                   className="size-7 rounded-full border border-slate-100 dark:border-slate-800 object-cover shadow-sm bg-slate-100"
                                   alt={partnerName}
                                 />
                                 <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                   {partnerName}
                                 </span>
                               </>
                             );
                           })()}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-base font-black tracking-tight ${
                          tx.sender._id === user?._id ? "text-slate-900 dark:text-white" : "text-primary dark:text-primary-light"
                        }`}>
                          {tx.sender._id === user?._id ? "-" : "+"}${tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          tx.status === "Escrow" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600" :
                          tx.status === "Success" ? "bg-green-50 dark:bg-green-500/10 text-green-600" :
                          "bg-red-50 dark:bg-red-500/10 text-red-600"
                        }`}>
                           {tx.status}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-slate-500">
                          {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 max-w-xs mx-auto opacity-40">
                        <CreditCard className="size-12 text-slate-300" />
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">No Transactions</h3>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="mt-10 bg-indigo-600 rounded-[32px] p-8 md:p-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-indigo-200" />
              <h2 className="text-xl font-black uppercase tracking-tight">How Escrow works</h2>
            </div>
            <p className="text-indigo-100 text-sm max-w-2xl leading-relaxed mb-6">
              Funds are held securely by FreeCone. For clients, this means money is only released when work is approved. For freelancers, it guarantees that the payment is secured before you even start.
            </p>
            <button className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl">
              Learn More
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
