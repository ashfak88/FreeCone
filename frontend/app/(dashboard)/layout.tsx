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

  const handleLogout = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (_) { }
    setUser(null);
    router.push("/login");
  };

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
