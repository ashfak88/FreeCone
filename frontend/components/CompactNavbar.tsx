"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

interface CompactNavbarProps {
  title: string;
}

export default function CompactNavbar({ title }: CompactNavbarProps) {
  const router = useRouter();
  const { user, setUser, notifications, fetchNotifications } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && user) {
      fetchNotifications('received');
    }
  }, [isMounted, user, fetchNotifications]);

  const unreadCount = (Array.isArray(notifications) ? notifications : []).filter((n: any) => !n.isRead).length;

  useEffect(() => {
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
      });
    } catch (_) { }
    setUser(null);
    setDropdownOpen(false);
    router.push("/");
  };

  if (!isMounted) return null;

  return (
    <nav className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Back Button */}
          <div className="flex-1 flex justify-start -ml-2">
            <button 
              onClick={() => router.back()} 
              className="flex items-center justify-center rounded-full w-10 h-10 text-slate-500 hover:text-primary hover:bg-primary/10 transition-all duration-300"
              title="Go Back"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          </div>

          {/* Center: Title */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
              {title}
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex-1 flex justify-end items-center gap-2 sm:gap-3">
            {user ? (
              <>
                {/* Notifications */}
                <button
                  title="Notifications"
                  onClick={() => router.push("/notifications")}
                  className="relative flex items-center justify-center rounded-full w-8 h-8 sm:w-9 sm:h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px]">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-800">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <div
                    title="Profile"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img
                      alt="Profile"
                      className="w-full h-full object-cover"
                      src={user.avatar || user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0ea5e9&color=fff`}
                    />
                  </div>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { router.push("/profile"); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        My Profile
                      </button>
                      <button
                        onClick={() => { router.push("/dashboard"); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => { router.push("/dashboard/escrow"); setDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        Escrow & Payments
                      </button>
                      <div className="border-t border-slate-100 dark:border-slate-700">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.push("/login")}
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors"
                >
                  Log In
                </button>
                <button 
                  onClick={() => router.push("/register")}
                  className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-sm"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
