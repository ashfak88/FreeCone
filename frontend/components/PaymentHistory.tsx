"use client";

import React, { useEffect, useState } from "react";
import { useStore, Transaction } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

export default function PaymentHistory() {
  const { transactions, fetchTransactions, user } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchTransactions();
      setIsLoading(false);
    };
    loadData();
  }, [fetchTransactions]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading financial records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial History</h2>
          <p className="text-sm text-slate-500 font-medium">Tracking your earnings, spending, and payout sources.</p>
        </div>
        
        {/* User Payout Account Summary */}
        {(user?.paymentAccount?.upiId || user?.paymentAccount?.cardDetails?.last4) && (
          <div className="flex flex-col sm:flex-row gap-2">
            {user?.paymentAccount?.upiId && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl shadow-sm">
                <span className="material-symbols-outlined text-primary text-sm font-bold">account_balance_wallet</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">UPI: {user.paymentAccount.upiId}</span>
              </div>
            )}
            {user?.paymentAccount?.cardDetails?.last4 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                <span className="material-symbols-outlined text-slate-500 text-sm font-bold">credit_card</span>
                <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none">
                  DEBIT: **** {user.paymentAccount.cardDetails.last4}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-fit shadow-sm">
          <span className="material-symbols-outlined text-primary text-sm font-bold">receipt_long</span>
          <span className="text-xs font-black text-slate-600 dark:text-slate-400">{transactions.length} Records</span>
        </div>
      </div>

      {transactions.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {transactions.map((txn, idx) => {
              return (
                <motion.div
                  key={txn._id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-5 md:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-4 group cursor-default"
                >
                  {/* Icon Column */}
                  <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                    txn.status === 'Success' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100/50 dark:border-emerald-500/20 text-emerald-600' :
                    txn.status === 'Escrow' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-100/50 dark:border-amber-500/20 text-amber-600' :
                    txn.status === 'Failed' ? 'bg-red-50 dark:bg-red-500/10 border-red-100/50 dark:border-red-500/20 text-red-600' :
                    'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}>
                    <span className="material-symbols-outlined font-bold text-2xl">
                      {txn.status === 'Success' ? 'check_circle' : txn.status === 'Escrow' ? 'lock' : txn.status === 'Failed' ? 'error' : 'schedule'}
                    </span>
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h4 className="text-sm md:text-base font-black text-slate-900 dark:text-white truncate uppercase tracking-tight group-hover:text-primary transition-colors">
                        {txn.job?.title || txn.description || "General Payment"}
                      </h4>
                      <span className={`text-lg md:text-xl font-black whitespace-nowrap ${
                        txn.status === 'Success' ? 'text-emerald-500' : 
                        txn.status === 'Escrow' ? 'text-amber-500' :
                        'text-slate-900 dark:text-white'
                      }`}>
                        ${txn.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {new Date(txn.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <div className="size-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                      <span className="text-[10px] md:text-xs font-bold text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm font-bold">person</span>
                        {txn.sender?.name || "Member"}
                      </span>
                      <div className="hidden sm:block size-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                      <span className={`hidden sm:inline-block text-[10px] md:text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                        txn.status === 'Success' ? 'bg-emerald-500/10 text-emerald-500' :
                        txn.status === 'Escrow' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-slate-500/10 text-slate-500'
                      }`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>

                  {/* Chevron (Desktop) */}
                  <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 py-24 flex flex-col items-center justify-center text-center px-6">
          <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-slate-300">receipt_long</span>
          </div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Transactions Found</h4>
          <p className="text-slate-500 text-sm max-w-sm font-medium">
            Your payment history will appear here once you start completing projects and receiving payments.
          </p>
        </div>
      )}
    </div>
  );
}
