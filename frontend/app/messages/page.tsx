"use client";

import React from "react";
import Navbar from "@/components/Navbar";

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-24">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8">
          <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto ring-8 ring-primary/5">
            <span className="material-symbols-outlined text-5xl text-primary">chat</span>
          </div>
          <div className="space-y-3">
            <h2 className="text-slate-900 dark:text-slate-100 font-extrabold text-3xl">Messages</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
              Your conversations will appear here. Start a project to begin messaging!
            </p>
          </div>
          <button 
            onClick={() => window.history.back()}
            className="px-10 py-4 bg-primary text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95"
          >
            Go Back
          </button>
        </div>
      </main>
    </div>
  );
}
