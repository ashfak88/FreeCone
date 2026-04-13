"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useStore, User } from "@/lib/store";
import { useDashboard } from "@/context/DashboardContext";

type SidebarProps = {
  user: User;
  onLogout: () => Promise<void>;
  isMobileOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ user, onLogout, isMobileOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { offers, fetchOffers } = useStore();

  React.useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const activeProjectsCount = React.useMemo(() => {
    return offers.filter(o => o.status === 'accepted' && ['active', 'review'].includes(o.projectStatus || '')).length;
  }, [offers]);

  const navItems = [
    { name: "Dashboard", icon: "dashboard", path: "/dashboard" },
    { name: "Profile", icon: "person", path: "/profile" },
    { 
      name: "Projects", 
      icon: "work", 
      path: "/projects",
      badge: activeProjectsCount > 0 ? activeProjectsCount : null 
    },
    { name: "Messages", icon: "chat", path: "/messages" },
    { name: "Escrow & Payments", icon: "account_balance_wallet", path: "/dashboard/escrow" },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 flex items-center gap-2.5 group cursor-pointer" onClick={() => router.push("/")}>
        <span className="material-symbols-outlined text-primary text-4xl animate-roll transition-transform duration-300">hub</span>
        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-slate-100 flex items-center leading-none">
            {"FreeCone".split("").map((letter, i) => (
              <span 
                key={i} 
                className={`animate-jump ${(i === 0 || i === 4) ? 'text-primary' : ''}`}
                style={{ animationDelay: `${0.2 + i * 0.1}s` }}
              >
                {letter}
              </span>
            ))}
          </span>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1 mt-4">
        <div className="px-2 mb-4">
          <button
            onClick={() => {
              router.push("/");
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-primary hover:text-white text-slate-600 dark:text-slate-300 rounded-xl transition-all border border-slate-100 dark:border-slate-800 font-bold group shadow-sm hover:shadow-primary/20"
          >
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="text-xs uppercase tracking-widest">Back to Home</span>
          </button>
        </div>

        <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dashboard</div>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              onClick={onClose}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${isActive
                ? "bg-primary/10 text-primary border-l-4 border-primary font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${isActive ? "text-primary" : ""}`}>{item.icon}</span>
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full ring-2 ring-white dark:ring-slate-900">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Account Settings</div>
        <Link 
          href="/security"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/security'
            ? "bg-primary/10 text-primary border-l-4 border-primary font-semibold"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
          }`}
        >
          <span className={`material-symbols-outlined ${pathname === '/security' ? "text-primary" : ""}`}>shield_person</span>
          <span className="font-medium">Security</span>
        </Link>

      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button onClick={onLogout} className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-semibold">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
