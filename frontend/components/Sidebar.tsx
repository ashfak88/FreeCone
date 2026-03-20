"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

interface SidebarProps {
  user: any;
  onLogout: () => void;
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", icon: "dashboard", path: "/dashboard" },
    { name: "Profile", icon: "person", path: "/profile" },
    { name: "Projects", icon: "work", path: "/projects" },
    { name: "Messages", icon: "chat", path: "/messages" },
    { name: "Earnings", icon: "payments", path: "/earnings" },
  ];

  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full hidden lg:flex">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white cursor-pointer" onClick={() => router.push("/")}>
          <span className="material-symbols-outlined">hexagon</span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-primary">Freecone</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{user?.role || 'User'}</p>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1 mt-4">
        <div className="px-2 mb-4">
          <button
            onClick={() => router.push("/")}
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
            <a
              key={item.name}
              onClick={() => router.push(item.path)}
              className={`cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? "bg-primary/10 text-primary border-l-4 border-primary font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                }`}
            >
              <span className={`material-symbols-outlined ${isActive ? "text-primary" : ""}`}>{item.icon}</span>
              <span>{item.name}</span>
            </a>
          );
        })}

        <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Account Settings</div>
        <a className="cursor-pointer flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <span className="material-symbols-outlined">shield_person</span>
          <span className="font-medium">Security</span>
        </a>
        <a className="cursor-pointer flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="font-medium">Notifications</span>
        </a>
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
