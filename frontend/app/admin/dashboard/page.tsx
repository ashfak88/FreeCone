"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import BottomNavbar from "@/components/BottomNavbar";
import AdminHeader from "@/components/AdminHeader";
import { API_URL, handleResponse } from "@/lib/api";

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
        const res = await fetch(`${API_URL}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await handleResponse(res);
        if (data) {
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

  const generatePath = (data: { revenue: number }[], height: number, width: number, isClosed = false) => {
    if (!data || data.length === 0) return "";
    const maxRevenue = Math.max(...data.map(d => d.revenue), 100); // Scale properly even for low values
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d.revenue / maxRevenue) * height;
      return `${x},${y}`;
    });

    let path = `M ${points[0]} `;
    // smoothing using quadratic bezier for a premium feel
    for (let i = 0; i < points.length - 1; i++) {
        const [x1, y1] = points[i].split(',').map(Number);
        const [x2, y2] = points[i+1].split(',').map(Number);
        const cx = (x1 + x2) / 2;
        path += `Q ${x1},${y1} ${cx},${(y1 + y2) / 2} T ${x2},${y2} `;
    }

    if (isClosed) {
      path += `V ${height} H 0 Z`;
    }
    return path;
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
              <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${((stats as any)?.todayRevGrowth || 0) >= 0 ? "text-green-300" : "text-red-300"}`}>
                <span className="material-symbols-outlined text-sm">{((stats as any)?.todayRevGrowth || 0) >= 0 ? "trending_up" : "trending_down"}</span>
                <span>{((stats as any)?.todayRevGrowth || 0) >= 0 ? "+" : ""}{(stats as any)?.todayRevGrowth || "0"}%</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <p className="text-xs uppercase tracking-wider font-semibold opacity-80">New Signups</p>
              <p className="text-xl font-bold mt-1">{stats?.todaySignups || "0"}</p>
              <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${((stats as any)?.todaySignupGrowth || 0) >= 0 ? "text-green-300" : "text-red-300"}`}>
                <span className="material-symbols-outlined text-sm">{((stats as any)?.todaySignupGrowth || 0) >= 0 ? "trending_up" : "trending_down"}</span>
                <span>{((stats as any)?.todaySignupGrowth || 0) >= 0 ? "+" : ""}{(stats as any)?.todaySignupGrowth || "0"}%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Key Metrics Section */}
        <section className="px-4 space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Key Metrics</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-full bg-blue-500/5 -skew-x-12 translate-x-12 group-hover:translate-x-8 transition-transform" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Gross Volume</p>
                  <p className="text-xl font-bold">${(stats as any)?.totalVolume?.toLocaleString() || "0"}</p>
                </div>
              </div>
              <span className="text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest relative z-10">All Payouts</span>
            </div>
            <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Platform Revenue</p>
                  <p className="text-xl font-bold">${stats?.totalRevenue?.toLocaleString() || "0"}</p>
                </div>
              </div>
              <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">Commission Total</span>
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
                  <span className="material-symbols-outlined">analytics</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Revenue Growth</p>
                  <p className="text-xl font-bold">{(stats as any)?.revenueGrowth || "0"}%</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${((stats as any)?.revenueGrowth || 0) >= 0 ? "text-green-600 bg-green-50 dark:bg-green-900/20" : "text-red-600 bg-red-50 dark:bg-red-900/20"}`}>
                {((stats as any)?.revenueGrowth || 0) >= 0 ? "+" : ""}{(stats as any)?.revenueGrowth || "0"}% MoM
              </span>
            </div>
          </div>
        </section>

        {/* Growth Chart Section */}
        <section className="mt-8 px-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold">Financial Performance</h3>
                <p className="text-xs text-slate-500">6 Month Platform Earnings (USD)</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{(stats as any)?.revenueGrowth || "0"}% MoM</p>
                <p className="text-[10px] uppercase font-bold text-slate-400">Trendline</p>
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
                <path d={generatePath(stats?.growthData || [], 150, 472, true)} fill="url(#chartGradient)"></path>
                <path d={generatePath(stats?.growthData || [], 150, 472, false)} fill="none" stroke="#6A6B4C" strokeWidth="3" strokeLinecap="round"></path>
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
            <h3 className="text-base font-bold">System Events</h3>
            <button className="text-primary text-sm font-semibold">Live Logs</button>
          </div>
          <div className="space-y-3">
            {stats?.activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 shadow-xs hover:border-primary/20 transition-all">
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
