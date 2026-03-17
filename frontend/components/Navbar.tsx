"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }

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
    } catch (_) {}
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#f6f7f8] backdrop-blur-md border-b border-[#6A6B4C]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6A6B4C] text-3xl">hub</span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">FreeCone</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-sm font-semibold text-slate-700 hover:text-[#6A6B4C] transition-colors" href="/find-talent">Browse Talent</a>
            <a className="text-sm font-semibold text-slate-700 hover:text-[#6A6B4C] transition-colors" href="#">Find Projects</a>
            <a className="text-sm font-semibold text-slate-700 hover:text-[#6A6B4C] transition-colors" href="#">Enterprise</a>
            <div className="h-4 w-px bg-slate-300"></div>

            {user ? (
              /* ── Logged-in: 3 icon buttons ── */
              <div className="flex items-center gap-3">

                {/* Notification Bell */}
                <button
                  title="Notifications"
                  className="flex items-center justify-center rounded-full w-9 h-9 bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[22px]">notifications</span>
                </button>

                <button
                  title="Messages"
                  className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-800">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    <line x1="9" y1="10" x2="15" y2="10"/>
                    <line x1="9" y1="14" x2="13" y2="14"/>
                  </svg>
                </button>

                {/* Profile Avatar with dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <div
                    title="Profile"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="h-9 w-9 rounded-full bg-primary/20 border-2 border-[#6A6B4C] flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img
                      alt="Profile"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDUdEwSpJ-Qd9w9WowJEy7aEbrUbZoEbWXPtXVTvd7GFRQ-iim5WNclRj3XsYWIgSoNi5U7cSDugAON-CsZ2_Ab5pThKPoaIWbeR8XeinfrqxMBWb4ZhiGf0WDPOlRpDcOzR2e-zWSAG5JZ35K3fJf8KoIDEqfYEHLniiY5nZMDcOu1ay1mPsh4dqI-8rIznfIe4WtfLQGHpbcP3pNHTwGtWYwcxZxhLdmjNJMaGtBAS7Ad_lyfJDHVfIDjAha-aGQanAf4k2TLUBb"
                    />
                  </div>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => router.push("/profile")}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        My Profile
                      </button>
                      <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Dashboard
                      </button>
                      <div className="border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── Logged-out: Login & Sign Up ── */
              <>
                <a className="text-sm font-semibold text-slate-700 hover:text-[#6A6B4C] transition-colors" href="/login">Log In</a>
                <a href="/register" className="bg-[#6A6B4C] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#5a5b3f] transition-all">
                  Sign Up
                </a>
              </>
            )}
          </div>

          {/* Mobile menu icon */}
          <div className="md:hidden">
            <span className="material-symbols-outlined text-slate-900">menu</span>
          </div>

        </div>
      </div>
    </nav>
  );
}