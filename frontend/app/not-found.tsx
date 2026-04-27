"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

export default function NotFound() {
  const [logs, setLogs] = useState<string[]>([]);
  
  const mockLogs = [
    "> INITIALIZING SYSTEM_KERNEL...",
    "> LOADING SECURE_ENCRYPTION_MODULES...",
    "> CONNECTING TO CLUSTER_NODE_NYC_04...",
    "> VERIFYING DATABASE_INTEGRITY...",
    "> SYNCING REPLICATED_STORAGE...",
    "> OPTIMIZING QUERY_CACHE_ENGINE...",
    "> ESTABLISHING PEER_CONNECTION...",
    "> SYSTEM_STATUS: READY_FOR_DEPLOYMENT",
    "> AWAITING_ADMIN_SYNC_CONFIRMATION...",
    "> MODULE_08_EXPANSION: IN_PROGRESS"
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < mockLogs.length) {
        setLogs(prev => [...prev.slice(-4), mockLogs[i]])
        i++
      } else {
        i = 0
        setLogs([]);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-mono text-slate-800 dark:text-slate-300 overflow-hidden relative">
      
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="max-w-2xl w-full space-y-12 z-10">
        
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Module Active
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-slate-100 tracking-tighter leading-none flex flex-col sm:flex-row items-center justify-center gap-4">
            <span>503</span>
            <span className="text-slate-200 dark:text-slate-800 hidden sm:block">/</span>
            <span className="text-primary text-3xl md:text-4xl tracking-tight uppercase">Service Link</span>
          </h1>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium max-w-md mx-auto lowercase leading-relaxed italic">
            // This endpoint is currently undergoing synchronization with the core ledger. Access is restricted during module expansion.
          </p>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border-4 border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-8 bg-slate-800 flex items-center px-4 gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
            <span className="ml-4 text-[10px] text-slate-500 font-black uppercase tracking-widest">Freecone_Terminal_v2.0</span>
          </div>
          
          <div className="mt-6 space-y-2 min-h-[140px] text-[11px] md:text-xs">
            {logs.map((log, index) => (
              <div key={index} className="flex gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
                <span className="text-emerald-500/40 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                <span className={log.includes('SUCCESS') || log.includes('DEPLOYMENT') ? 'text-emerald-400' : 'text-slate-400'}>
                  {log}
                </span>
              </div>
            ))}
            <div className="animate-pulse text-emerald-500">_</div>
          </div>
          
          <div className="absolute bottom-4 right-4 text-[80px] opacity-10 rotate-12 pointer-events-none">
            <span className="material-symbols-outlined">settings_suggest</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center font-sans tracking-tight">
          <Link 
            href="/"
            className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
          >
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Return to Core
          </Link>
          <Link 
            href="/dashboard"
            className="w-full sm:w-auto px-10 py-4 bg-white dark:bg-slate-900 text-on-surface border-2 border-slate-200 dark:border-slate-800 rounded-2xl font-black hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center"
          >
            Dashboard
          </Link>
        </div>

        <div className="pt-8 text-center">
          <div className="flex items-center justify-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <span className="w-12 h-px bg-slate-200 dark:bg-slate-800"></span>
            <span>FC_PROTOCOL_EXPANSION_NODE</span>
            <span className="w-12 h-px bg-slate-200 dark:bg-slate-800"></span>
          </div>
        </div>
      </div>
      
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]"></div>
    </div>
  )
}
