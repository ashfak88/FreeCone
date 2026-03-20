"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  user: any;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  children?: React.ReactNode;
}

export default function DashboardHeader({ user, title, subtitle, showSearch = false, children }: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/")} className="lg:hidden text-slate-500 hover:bg-slate-100 p-2 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-[20px]">hub</span>
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">{title || "Freecone Dashboard"}</h2>
          {subtitle && <p className="text-xs md:text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4 self-end md:self-auto">
        {showSearch && (
          <div className="relative group hidden md:block">
            <input
              className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all w-64"
              placeholder="Search..."
              type="text"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          </div>
        )}

        {children}

        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/profile')}>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none">{user?.name}</p>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide mt-1">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 bg-slate-200 shrink-0">
            <img
              src={user?.avatar || user?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=0ea5e9&color=fff`}
              alt="User profile avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
