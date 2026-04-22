"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL, handleResponse } from "@/lib/api";

import BottomNavbar from "@/components/BottomNavbar";
import AdminHeader from "@/components/AdminHeader";
import Swal from "sweetalert2";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "pending" | "blocked";
  imageUrl?: string;
  avatar?: string;
  title?: string;
}

export default function UserManagementPage() {
  const router = useRouter();
  const { user: currentUser } = useStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");

  const fetchUsers = async () => {
    setIsLoading(true);
    const queryParams = new URLSearchParams();
    if (activeStatusFilter !== "all") queryParams.append("status", activeStatusFilter);
    if (search) queryParams.append("search", search);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/admin/users?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await handleResponse(res);
      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch admin users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role?.toLowerCase() === "admin") {
      const timeoutId = setTimeout(fetchUsers, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [currentUser, activeStatusFilter, search]);


  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await handleResponse(res);
      if (data) {
        setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus as any } : u));
        Swal.fire({
          title: "Status Updated",
          text: `User is now ${newStatus}.`,
          icon: "success",
          confirmButtonColor: "#6A6B4C",
          customClass: { popup: 'rounded-3xl' }
        });
      }
    } catch (error: any) {
      console.error("Failed to update user status:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to update user status.",
        icon: "error",
        confirmButtonColor: "#6A6B4C",
        customClass: { popup: 'rounded-3xl' }
      });
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <AdminHeader />

      <main className="flex-1 p-4 md:p-8 pb-32 max-w-7xl mx-auto w-full">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Search Strip */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-10 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1 w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 font-bold">search</span>
              <input
                type="text"
                placeholder="Search by name, email or status..."
                className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold placeholder:text-slate-500 focus:ring-2 focus:ring-primary/20 transition-all uppercase tracking-wider"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Quick Status Filters */}
          <div className="flex items-center gap-3 mb-8 px-2 overflow-x-auto pb-4 scrollbar-hide">
            {["all", "active", "pending", "blocked"].map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatusFilter(status)}
                className={`flex items-center gap-2 px-5 py-2 white-nowrap rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeStatusFilter === status
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl"
                    : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:border-primary/50"
                  }`}
              >
                {status}
                {status === 'active' && <span className="material-symbols-outlined text-sm">verified</span>}
                {status === 'pending' && <span className="material-symbols-outlined text-sm">pending</span>}
                {status === 'blocked' && <span className="material-symbols-outlined text-sm">block</span>}
              </button>
            ))}
          </div>

          {/* Users Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 animate-pulse flex flex-col p-8 items-center text-center">
                  <div className="size-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-4"></div>
                  <div className="h-5 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg mb-2"></div>
                  <div className="h-3 w-40 bg-slate-50 dark:bg-slate-800/50 rounded-md mb-6"></div>
                  <div className="mt-auto flex gap-2 w-full">
                     <div className="h-10 flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl"></div>
                     <div className="h-10 flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {users.map((u, idx) => (
                  <motion.div
                    key={u._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 ${u.status === 'blocked' ? 'grayscale opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="size-16 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 p-0.5 group-hover:border-primary/30 transition-colors shadow-lg">
                        <img
                          className="w-full h-full object-cover rounded-xl"
                          src={u.imageUrl || u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6A6B4C&color=fff`}
                          alt={u.name}
                        />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${u.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          u.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {u.status}
                      </div>
                    </div>

                    <div className="space-y-1 mb-6">
                      <h3 className="text-lg font-black tracking-tight">{u.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{u.role === 'talent' ? 'Freelance Powerhouse' : 'Enterprise Partner'}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                      <button
                        onClick={() => router.push(`/admin/users/${u._id}`)}
                        className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] py-3 rounded-xl hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all shadow-lg shadow-black/10 active:scale-95"
                      >
                        Details
                      </button>

                      {u.status === 'blocked' ? (
                        <button
                          onClick={() => handleUpdateStatus(u._id, 'active')}
                          className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all active:scale-95 shadow-md shadow-green-500/10"
                        >
                          <span className="material-symbols-outlined text-lg">check_circle</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(u._id, 'blocked')}
                          className="p-3 bg-red-50 dark:bg-red-900/20 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-md shadow-red-500/10"
                        >
                          <span className="material-symbols-outlined text-lg">block</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {users.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-6 animate-bounce">
                <span className="material-symbols-outlined text-4xl">search_off</span>
              </div>
              <h3 className="text-xl font-black mb-2 tracking-tight">Zero Matches Found</h3>
              <p className="text-slate-500 text-sm max-w-sm font-bold uppercase tracking-widest text-[10px]">Adjust your search parameters or clear filters</p>
            </div>
          )}
        </div>
        <BottomNavbar />
      </main>
    </div>
  );
}
