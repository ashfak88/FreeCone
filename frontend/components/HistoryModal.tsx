"use client";
import React from "react";
import { Transaction } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  title: string;
  type: "earnings" | "spending" | "escrow";
}

export default function HistoryModal({ isOpen, onClose, transactions, title, type }: HistoryModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Found {transactions.length} record{transactions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="size-10 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Transaction List */}
          <div className="flex-1 overflow-y-auto p-2">
            {transactions.length > 0 ? (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {transactions.map((txn, idx) => (
                  <motion.div
                    key={txn._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-4 cursor-default group"
                  >
                    {/* Icon Column */}
                    <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      txn.status === 'Success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' :
                      txn.status === 'Escrow' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <span className="material-symbols-outlined font-bold">
                        {txn.status === 'Success' ? 'paid' : txn.status === 'Escrow' ? 'lock' : 'error'}
                      </span>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">
                          {txn.job?.title || txn.description || "General Payment"}
                        </h4>
                        <span className="text-lg font-black text-slate-900 dark:text-white whitespace-nowrap">
                          ${txn.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-slate-400">
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </span>
                        <div className="size-1 rounded-full bg-slate-200" />
                        <span className="text-xs font-bold text-primary dark:text-primary-light">
                           {txn.sender?.name || "Someone"} 
                        </span>
                      </div>
                    </div>

                    {/* Partner Avatar Column */}
                    <div className="hidden sm:block size-8 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
                       <img 
                          src={txn.sender?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(txn.sender?.name || 'User')}&background=0ea5e9&color=fff`} 
                          alt={txn.sender?.name}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                       />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                <span className="material-symbols-outlined text-6xl mb-4">history</span>
                <p className="font-bold">No history available yet.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
             <button
                onClick={onClose}
                className="w-full h-14 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
             >
                Got it
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
