"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import Sidebar from "@/components/Sidebar";
import ProfileCompletionBanner from "@/components/ProfileCompletionBanner";

import { DashboardProvider, useDashboard } from "@/context/DashboardContext";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser, updateUser } = useStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const { isMobileSidebarOpen, closeMobileSidebar } = useDashboard();

  const handleLogout = async () => {
    const Swal = (await import('sweetalert2')).default;
    
    const result = await Swal.fire({
      title: 'Sign Out?',
      text: "Are you sure you want to log out of your dashboard?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Sign out',
      cancelButtonText: 'Stay here',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      customClass: {
        popup: 'rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl',
        confirmButton: 'rounded-xl px-6 py-3 font-bold uppercase tracking-wider text-[11px] ml-2',
        cancelButton: 'rounded-xl px-6 py-3 font-bold uppercase tracking-wider text-[11px]'
      }
    });

    if (result.isConfirmed) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch (_) { }
      setUser(null);
      if (isMobileSidebarOpen) closeMobileSidebar();
      router.push("/login");
    }
  };

  useEffect(() => {
    setIsHydrated(true);

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
        const res = await fetch(`${API_URL}/users/profile`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.ok) {
          const freshUser = await res.json();
          updateUser({
            ...freshUser,
            id: freshUser._id
          });
        }
      } catch (err) {
        console.error("Failed to sync profile:", err);
      }
    };

    fetchProfile();
  }, [user?.id, router, updateUser]);

  const pathname = usePathname();
  const isProjectDetails = pathname.startsWith('/projects/') && pathname !== '/projects';

  if (!isHydrated || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-display">
      {/* Sidebar Overlay for Mobile */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
          onClick={closeMobileSidebar}
        />
      )}

      {!isProjectDetails && (
        <Sidebar
          user={user}
          onLogout={handleLogout}
          isMobileOpen={isMobileSidebarOpen}
          onClose={closeMobileSidebar}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {user.role === "user" && !user.isProfileComplete && <ProfileCompletionBanner />}
        <main className="flex-1 overflow-y-auto pt-24 md:pt-28 lg:pt-24 px-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}
