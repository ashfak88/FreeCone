"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import BottomNavbar from "@/components/BottomNavbar";
import AdminHeader from "@/components/AdminHeader";

interface AdminStats {
  todayRevenue: number;
  todaySignups: number;
  totalRevenue: number;
  activeUsers: number;
  totalProjects: number;
  userGrowth: number;
  projectGrowth: number;
  growthData: { month: string; revenue: number }[];
  activities: {
    id: string;
    type: string;
    title: string;
    description: string;
    time: string;
  }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useStore();
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    const role = user?.role?.toLowerCase();
    if (user && role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
        const res = await fetch(`${API_URL}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role?.toLowerCase() === "admin") {
      fetchStats();
    }
  }, [user]);

  const role = user?.role?.toLowerCase();
  if (!isMounted || !user || role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading Platform Data...</p>
        </div>
      </div>
    );
  }

  // Format relative time for activities
  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <AdminHeader />

      <main className="flex-1 pb-32">
        {/* Hero Section */}
        <section className="p-4 bg-primary text-white mb-6">
          <div className="flex flex-col gap-1">
            <p className="text-primary-100 opacity-90 text-sm">Welcome back, Administrator</p>
            <h2 className="text-2xl font-bold">Platform Overview</h2>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <p className="text-xs uppercase tracking-wider font-semibold opacity-80">Today's Revenue</p>
              <p className="text-xl font-bold mt-1">${stats?.todayRevenue?.toLocaleString() || "0"}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-300">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+12%</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <p className="text-xs uppercase tracking-wider font-semibold opacity-80">New Signups</p>
              <p className="text-xl font-bold mt-1">{stats?.todaySignups || "0"}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-300">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+5.4%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Key Metrics Section */}
        <section className="px-4 space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Key Metrics</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
                  <p className="text-xl font-bold">${stats?.totalRevenue?.toLocaleString() || "0"}</p>
                </div>
              </div>
              <span className="text-primary bg-primary/10 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">Platform Total</span>
            </div>
            <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Users</p>
                  <p className="text-xl font-bold">{stats?.activeUsers?.toLocaleString() || "0"}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${(stats?.userGrowth || 0) >= 0 ? "text-green-600 bg-green-50 dark:bg-green-900/20" : "text-red-600 bg-red-50 dark:bg-red-900/20"}`}>
                {stats?.userGrowth !== undefined ? `${stats.userGrowth >= 0 ? "+" : ""}${stats.userGrowth}%` : "0%"}
              </span>
            </div>
            <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                  <span className="material-symbols-outlined">assignment</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Projects</p>
                  <p className="text-xl font-bold">{stats?.totalProjects?.toLocaleString() || "0"}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${(stats?.projectGrowth || 0) >= 0 ? "text-green-600 bg-green-50 dark:bg-green-900/20" : "text-red-600 bg-red-50 dark:bg-red-900/20"}`}>
                {stats?.projectGrowth !== undefined ? `${stats.projectGrowth >= 0 ? "+" : ""}${stats.projectGrowth}%` : "0%"}
              </span>
            </div>
          </div>
        </section>

        {/* Growth Chart Section */}
        <section className="mt-8 px-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold">Platform Growth</h3>
                <p className="text-xs text-slate-500">Monthly User & Revenue data</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{stats?.userGrowth || "0"}% MoM</p>
                <p className="text-[10px] uppercase font-bold text-slate-400">Monthly Avg</p>
              </div>
            </div>
            <div className="relative h-48 w-full mt-4">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 472 150">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#6A6B4C" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#6A6B4C" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V150H0V109Z" fill="url(#chartGradient)"></path>
                <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" fill="none" stroke="#6A6B4C" strokeWidth="3" strokeLinecap="round"></path>
              </svg>
            </div>
            <div className="flex justify-between mt-4 px-1">
              {stats?.growthData?.map((item, index) => (
                <span key={`${item.month}-${index}`} className="text-[11px] font-bold text-slate-400">{item.month}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Activities Section */}
        <section className="mt-8 px-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold">Recent Activities</h3>
            <button className="text-primary text-sm font-semibold">View All</button>
          </div>
          <div className="space-y-3">
            {stats?.activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-xl">{activity.type}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{activity.title}</p>
                  <p className="text-xs text-slate-500">{activity.description}</p>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{getRelativeTime(activity.time)}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNavbar />
    </div>
  );
}
