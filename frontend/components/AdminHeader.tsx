"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function AdminHeader() {
  const router = useRouter();
  const { user, setUser } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
    } catch (_) { }
    setUser(null)
    setDropdownOpen(false);
    router.push("/")
  }

  if (!hasMounted || !user) return null;

  return (
    <header className="flex items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 sticky top-0 z-40 border-b border-primary/10 justify-between w-full h-16">
      <div
        className="flex items-center gap-2.5 cursor-pointer group"
        onClick={() => window.location.href = "/admin/dashboard"}
      >
        <span className="material-symbols-outlined text-primary text-4xl group-hover:rotate-12 transition-transform duration-300">hub</span>
        <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-slate-100 flex items-center">
          {"FreeCone".split("").map((letter, i) => (
            <span
              key={i}
              className={`animate-jump ${(i === 0 || i === 4) ? 'text-primary' : ''}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {letter}
            </span>
          ))}
        </span>
        <div className="bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Admin</div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button className="flex size-9 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex size-9 items-center justify-center rounded-full overflow-hidden border border-primary/20 hover:border-primary/50 transition-all cursor-pointer"
          >
            <img
              alt="Admin Profile"
              className="h-full w-full object-cover"
              src={user.imageUrl || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6A6B4C&color=fff`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { router.push("/admin/broadcast"); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">campaign</span>
                  Broadcast Center
                </button>
                <button
                  onClick={() => { router.push("/admin/dashboard"); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  Dashboard
                </button>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
