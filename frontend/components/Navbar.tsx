"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { motion } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const { user, setUser, notifications, fetchNotifications, conversations, fetchConversations } = useStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [showProfilePrompt, setShowProfilePrompt] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted && user) {
      fetchNotifications('received')
      fetchConversations()
    }
  }, [isMounted, user, fetchNotifications, fetchConversations])

  const unreadCount = (Array.isArray(notifications) ? notifications : []).filter((n: any) => !n.isRead).length;
  const unreadMessagesCount = (Array.isArray(conversations) ? conversations : []).filter((c: any) => {
    if (!c.lastMessage || !user) return false;
    const myId = user._id || user.id;
    let senderId = c.lastMessage.sender;
    if (typeof senderId === 'object' && senderId !== null) {
      senderId = senderId._id || senderId.id;
    }
    if (senderId === myId) return false;

    const readArray = Array.isArray(c.lastMessage.readBy) ? c.lastMessage.readBy : [];
    const isRead = readArray.some((r: any) => {
      if (typeof r === 'object' && r !== null) return r._id === myId || r.id === myId;
      return r === myId;
    });
    return !isRead;
  }).length;

  const dismissPrompt = () => {
    setIsExiting(true)
    setTimeout(() => {
      setShowProfilePrompt(false)
      if (user) {
        localStorage.setItem(`first_login_prompt_seen_${user.id}`, "true");
      }
    }, 500)
  }

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

  return (
    <nav className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => router.push("/")}>
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
          </div>

          {/* Right: Nav Links + Icons */}
          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center space-x-8 mr-4 border-r border-slate-200 dark:border-slate-700 pr-8">
              <a className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors" href="/find-talent">Browse Talent</a>
              <Link className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors" href="/find-work">Find Work</Link>
              <Link className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors" href="/enterprise">Enterprise</Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {isMounted && user ? (
                <div className="flex items-center gap-2 sm:gap-3">
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

                  <button
                    title="Messages"
                    onClick={() => router.push("/messages")}
                    className="relative flex items-center justify-center rounded-full w-8 h-8 sm:w-9 sm:h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">chat</span>
                    {unreadMessagesCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-800">
                        {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                      </span>
                    )}
                  </button>

                  <div className="relative" ref={dropdownRef}>
                    <div
                      title="Profile"
                      onClick={() => {
                        setDropdownOpen(!dropdownOpen);
                        if (showProfilePrompt) dismissPrompt();
                      }}
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <img
                        alt="Profile"
                        className="w-full h-full object-cover"
                        src={user.avatar || user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0ea5e9&color=fff`}
                      />
                    </div>

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
                </div>
              ) : isMounted && (
                <div className="hidden md:flex items-center gap-4">
                  <a className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors" href="/login">Log In</a>
                  <a href="/register" className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">
                    Sign Up
                  </a>
                </div>
              )}

              {/* Mobile menu icon (hamburger) */}
              <div className="md:hidden flex items-center ml-1">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1 focus:outline-none"
                >
                  <span className="material-symbols-outlined text-slate-900 dark:text-slate-100 text-3xl">
                    {mobileMenuOpen ? "close" : "menu"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-background-light dark:bg-background-dark border-b border-primary/20 overflow-hidden"
        >
          <div className="px-4 pt-2 pb-6 space-y-2">
            <a
              href="/find-talent"
              className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Talent
            </a>
            <Link
              href="/find-work"
              className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Work
            </Link>
            <Link
              href="/enterprise"
              className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Enterprise
            </Link>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              {user ? (
                <div className="space-y-2">
                  <button
                    onClick={() => { router.push("/profile"); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => { router.push("/dashboard"); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => { router.push("/dashboard/escrow"); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Escrow & Payments
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 text-base font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 px-3 py-2">
                  <Link
                    href="/login"
                    className="text-center py-3 text-base font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="text-center py-3 text-base font-bold bg-primary text-white rounded-xl shadow-lg shadow-primary/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}