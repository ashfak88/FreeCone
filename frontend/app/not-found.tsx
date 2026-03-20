"use client";

import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center p-6 font-display">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Visual Element */}
        <div className="relative mx-auto w-32 h-32 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/5 mb-10 rotate-3">
          <span className="material-symbols-outlined text-primary text-6xl animate-pulse">construction</span>
          {/* Decorative Sparkles */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full blur-md opacity-20"></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary rounded-full blur-sm opacity-30"></div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Work in Progress
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
            This page is currently under development. Our team is building something extraordinary for you!
          </p>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group"
          >
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Home
          </Link>
          <Link 
            href="/dashboard"
            className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center"
          >
            Dashboard
          </Link>
        </div>

        {/* Footer Meta */}
        <div className="pt-12">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <span className="w-8 h-px bg-slate-200 dark:bg-slate-800"></span>
            <span>Freecone Beta v1.0</span>
            <span className="w-8 h-px bg-slate-200 dark:bg-slate-800"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
