"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function Navbar() {
  const router = useRouter();
  const { user, setUser } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dismissPrompt = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowProfilePrompt(false);
      if (user) {
        localStorage.setItem(`first_login_prompt_seen_${user.id}`, "true");
      }
    }, 500); // Wait for fade-out animation
  };

  useEffect(() => {
    if (isMounted && user && !user.isProfileComplete && !localStorage.getItem(`first_login_prompt_seen_${user.id}`)) {
      setShowProfilePrompt(true);
      const timer = setTimeout(() => {
        dismissPrompt();
      }, 5000); // 7 seconds of visibility
      return () => clearTimeout(timer);
    }
  }, [isMounted, user]);

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
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (_) { }
    setUser(null);
    setDropdownOpen(false);
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <span className="material-symbols-outlined text-primary text-3xl">hub</span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">FreeCone</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors" href="/find-talent">Browse Talent</a>
            <Link className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors" href="/find-work">Find Work</Link>
            <Link className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors" href="/enterprise">Enterprise</Link>
            <div className="h-4 w-px bg-primary/20"></div>

            {!isMounted ? (
              <div className="flex items-center gap-3">
                <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg"></div>
                <div className="h-8 w-20 bg-slate-200 animate-pulse rounded-lg"></div>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <button
                  title="Notifications"
                  onClick={() => router.push("/notifications")}
                  className="flex items-center justify-center rounded-full w-9 h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  <span className="material-symbols-outlined text-[22px]">notifications</span>
                </button>

                <button
                  title="Messages"
                  onClick={() => router.push("/messages")}
                  className="flex items-center justify-center rounded-full w-9 h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                </button>

                <div className="relative" ref={dropdownRef}>
                  <div
                    title="Profile"
                    onClick={() => {
                      setDropdownOpen(!dropdownOpen);
                      if (showProfilePrompt) dismissPrompt();
                    }}
                    className="h-9 w-9 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img
                      alt="Profile"
                      className="w-full h-full object-cover"
                      src={user.avatar || user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0ea5e9&color=fff`}
                    />
                  </div>

                  {/* Auto-dismissing Profile Prompt */}
                  {showProfilePrompt && (
                    <div className={`absolute right-0 top-full mt-3 whitespace-nowrap bg-green-700 text-white text-[13px] font-black px-5 py-2 rounded-full shadow-2xl shadow-green-500/30 transition-all duration-500 ${isExiting ? "opacity-0 scale-90 -translate-y-2" : "opacity-100 scale-100 translate-y-0 animate-in fade-in slide-in-from-top-2 duration-300"} pointer-events-none z-[60]`}>
                      Complete your profile 🚀
                      <div className="absolute bottom-full right-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-green-500"></div>
                    </div>
                  )}

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
              </div>
            ) : (
              <>
                <a className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors" href="/login">Log In</a>
                <a href="/register" className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">
                  Sign Up
                </a>
              </>
            )}
          </div>

          {/* Mobile menu icon */}
          <div className="md:hidden">
            <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">menu</span>
          </div>
        </div>
      </div>
    </nav>
  );
}