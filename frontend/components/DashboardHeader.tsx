"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";

interface DashboardHeaderProps {
  user: any;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  showBack?: boolean;
  isStandalone?: boolean;
  children?: React.ReactNode;
}

export default function DashboardHeader({ user, title, subtitle, showSearch = false, showBack = false, isStandalone = false, children }: DashboardHeaderProps) {
  const router = useRouter();
  const { toggleMobileSidebar } = useDashboard();

  return (
    <header className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-md fixed top-0 right-0 left-0 ${!isStandalone ? 'lg:left-72' : ''} z-30 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 transition-all duration-300`}>
      <div className="flex items-center gap-4">
        {showBack ? (
          <button 
            onClick={() => router.back()} 
            className="flex items-center justify-center rounded-full w-10 h-10 -ml-2 text-slate-500 hover:text-primary hover:bg-primary/10 transition-all duration-300"
            title="Go Back"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
        ) : (
          <button onClick={toggleMobileSidebar} className="lg:hidden flex items-center justify-center size-10 -ml-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
            <span className="material-symbols-outlined text-[28px]">menu</span>
          </button>
        )}
        <div className="flex flex-col min-w-0">
          <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-1 truncate">
            {title ? (
              title
            ) : (
              <span className="flex items-center tracking-tighter">
                {"FreeCone".split("").map((letter, i) => (
                  <span 
                    key={i} 
                    className={`animate-jump ${(i === 0 || i === 4) ? 'text-primary' : ''}`}
                    style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                  >
                    {letter}
                  </span>
                ))}
                <span className="ml-2 font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em] text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Dashboard</span>
              </span>
            )}
          </h2>
          {subtitle && <p className="text-xs md:text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 ml-auto md:ml-0 overflow-x-auto no-scrollbar pb-1 md:pb-0">
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
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-primary/20 bg-slate-200 shrink-0">
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
