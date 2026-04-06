"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
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
import Link from "next/link";

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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading ledger...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-2">
              <ShieldCheck className="w-4 h-4" />
              Secure Escrow System
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Escrow & Payments</h1>
            <p className="text-slate-500 mt-2 text-lg">Manage your funds, track payments, and view transaction history.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
               <ExternalLink className="w-4 h-4" />
               Download Report
             </button>
             <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
               <Wallet className="w-4 h-4" />
               Add Funds
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total in Escrow (Paid as Client) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className="absolute top-0 right-0 p-4">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Funds in Escrow</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mb-2">
              ${(summary?.escrowAsSender.total || 0).toLocaleString()}
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 w-fit px-2.5 py-1 rounded-full">
               {summary?.escrowAsSender.count || 0} ACTIVE DEPOSITS
            </div>
          </motion.div>

          {/* Pending Income (For Freelancers) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className="absolute top-0 right-0 p-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Expected Income</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mb-2">
              ${(summary?.escrowAsReceiver.total || 0).toLocaleString()}
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 w-fit px-2.5 py-1 rounded-full">
               {summary?.escrowAsReceiver.count || 0} SECURED IN ESCROW
            </div>
          </motion.div>

          {/* Total Spent */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 p-6 rounded-[32px] shadow-xl relative overflow-hidden group border border-slate-800"
          >
             <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Total Spent</p>
            <h3 className="text-3xl font-extrabold text-white mb-2">
              ${(summary?.totalSpent || 0).toLocaleString()}
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
               LIFETIME EXPENDITURE
            </div>
          </motion.div>

          {/* Total Earned */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-primary p-6 rounded-[32px] shadow-xl shadow-primary/20 relative overflow-hidden group text-white"
          >
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <p className="text-white/70 text-sm font-bold uppercase tracking-wider mb-1">Total Earned</p>
            <h3 className="text-3xl font-extrabold text-white mb-2">
              ${(summary?.totalEarned || 0).toLocaleString()}
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white/80">
               NET PLATFORM EARNINGS
            </div>
          </motion.div>
        </div>

        {/* Transactions Section */}
        <div className="bg-white rounded-[40px] border border-slate-200/60 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
          {/* List Header/Filters */}
          <div className="p-8 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <h2 className="text-2xl font-extrabold text-slate-900">Transaction History</h2>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search transactions..."
                  className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all w-64 font-medium"
                />
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                {["all", "escrow", "completed"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                      filter === tab 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                <Filter className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Participants</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, idx) => (
                    <motion.tr 
                      key={tx._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                             tx.status === "Escrow" ? "bg-amber-50 text-amber-600" :
                             tx.status === "Success" ? "bg-green-50 text-green-600" :
                             "bg-slate-100 text-slate-400"
                           }`}>
                             {tx.sender._id === user?._id ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                           </div>
                           <div>
                              <p className="font-bold text-slate-900 line-clamp-1">{tx.description || tx.job?.title || "Project Payment"}</p>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">{tx.txnId}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <img 
                             src={tx.sender._id === user?._id ? tx.receiver.imageUrl : tx.sender.imageUrl} 
                             className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                             alt=""
                           />
                           <span className="text-sm font-semibold text-slate-700">
                             {tx.sender._id === user?._id ? tx.receiver.name : tx.sender.name}
                           </span>
                           <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">
                             {tx.sender._id === user?._id ? "FL" : "CL"}
                           </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-lg font-extrabold font-mono ${
                          tx.sender._id === user?._id ? "text-slate-900" : "text-primary"
                        }`}>
                          {tx.sender._id === user?._id ? "-" : "+"}${tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest ${
                          tx.status === "Escrow" ? "bg-amber-50 text-amber-600 ring-1 ring-amber-100" :
                          tx.status === "Success" ? "bg-green-50 text-green-600 ring-1 ring-green-100" :
                          "bg-red-50 text-red-600 ring-1 ring-red-100"
                        }`}>
                           {tx.status === "Escrow" ? <Clock className="w-3.5 h-3.5" /> : 
                            tx.status === "Success" ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                            <AlertCircle className="w-3.5 h-3.5" />}
                           {tx.status}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-medium text-slate-500">
                          {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 hover:bg-slate-200/50 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-5 h-5 text-slate-400" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                          <CreditCard className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No Transactions Yet</h3>
                        <p className="text-sm text-slate-500">Your financial history will appear here once you start or pay for a project.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className="p-8 border-t border-slate-50 mt-auto flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing {filteredTransactions.length} of {transactions.length} entries
            </p>
            <div className="flex items-center gap-2">
               <button className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 cursor-not-allowed">Previous</button>
               <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg shadow-slate-900/20">Next</button>
            </div>
          </div>
        </div>

        {/* Help Banner */}
        <div className="mt-12 bg-indigo-600 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 items-center gap-10">
            <div>
              <h2 className="text-3xl font-extrabold mb-4">How does our Escrow work?</h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-lg leading-relaxed">
                FreeCone holds the project funds securely in escrow. The freelancer starts work with confidence, and the funds are only released to them once you approve the delivered work.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
                  Learn about Escrow <ChevronRight className="w-4 h-4" />
                </button>
                <button className="px-8 py-4 border border-white/30 rounded-2xl font-bold hover:bg-white/10 transition-all">
                  Contact Support
                </button>
              </div>
            </div>
            <div className="hidden md:flex justify-end pr-8">
               <div className="w-48 h-48 bg-white/20 backdrop-blur-xl border border-white/30 rounded-[32px] rotate-12 flex items-center justify-center p-8 group-hover:rotate-0 transition-transform duration-700">
                  <ShieldCheck className="w-24 h-24 text-white" />
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
