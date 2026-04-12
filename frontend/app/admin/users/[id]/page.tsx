"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";

interface UserDetail {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: "active" | "pending" | "blocked";
    imageUrl?: string;
    avatar?: string;
    createdAt: string;
    isProfileComplete: boolean;
    title?: string;
    bio?: string;
    skills?: string[];
  };
  stats: {
    jobsCount: number;
    totalVolume: number;
  };
  recentTransactions: any[];
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [id, setId] = useState<string>("");

  useEffect(() => {
    if (params) {
      // Handle params being a Promise or an Object
      if (params instanceof Promise) {
        params.then((p: any) => p.id && setId(p.id));
      } else if (params.id) {
        setId(params.id as string);
      }
    }
  }, [params]);

  const { user: currentUser } = useStore();
  
  const [data, setData] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        console.error("Fetch failed with status:", res.status);
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && currentUser?.role?.toLowerCase() === "admin") {
      fetchDetail();
    }
  }, [id, currentUser]);

  const toggleStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("accessToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
      const res = await fetch(`${API_URL}/admin/users/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await fetchDetail();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleRole = async (newRole: string) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("accessToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
      const res = await fetch(`${API_URL}/admin/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        await fetchDetail();
      }
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center">User not found</div>;

  const { user, stats, recentTransactions } = data;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 pb-32">
      
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 transition-opacity mb-8"
        >
          <span className="material-symbols-outlined text-sm">arrow_back_ios</span>
          BACK TO DIRECTORY
        </button>

        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Identity Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  user.status === 'active' ? 'bg-green-100 text-green-700' : 
                  user.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {user.status}
                </span>
            </div>

            <div className="size-32 rounded-3xl overflow-hidden border-4 border-slate-100 dark:border-slate-800 p-1 group-hover:scale-105 transition-transform duration-500 shadow-xl">
              <img 
                src={user.imageUrl || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6A6B4C&color=fff`} 
                alt={user.name} 
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-3">
              <div>
                <h1 className="text-3xl font-black tracking-tight">{user.name}</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-1">{user.role}</p>
              </div>
              <p className="text-sm font-medium opacity-70 max-w-md">{user.bio || "No biography provided for this record."}</p>
              <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                <div className="flex items-center gap-1 text-slate-500">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  <span className="text-xs font-bold">{user.email}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  <span className="text-xs font-bold">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Platform Power</p>
              <p className="text-2xl font-black">${stats.totalVolume.toLocaleString()}</p>
              <p className="text-[10px] text-primary font-bold mt-1 uppercase">Gross Volume</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Project History</p>
              <p className="text-2xl font-black">{stats.jobsCount}</p>
              <p className="text-[10px] text-blue-500 font-bold mt-1 uppercase">Total Activities</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 md:col-span-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Accreditation</p>
              <p className="text-2xl font-black">{stats.jobsCount > 5 ? 'High Value' : 'Standard'}</p>
              <p className="text-[10px] text-purple-500 font-bold mt-1 uppercase">Trust Level</p>
            </div>
          </div>

          {/* User Controls & Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Recent Activity */}
            <div className="md:col-span-3 space-y-6">
               <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-6 px-2 text-slate-400">Ledger History</h3>
                  <div className="space-y-4">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((tx: any) => (
                        <div key={tx._id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                          <div className={`size-10 rounded-full flex items-center justify-center ${tx.status === 'Success' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                            <span className="material-symbols-outlined text-sm">{tx.type === 'Commission' ? 'percent' : 'payments'}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-black uppercase tracking-wider">{tx.type}</p>
                            <p className="text-[10px] text-slate-500 font-bold">{new Date(tx.createdAt).toLocaleDateString()}</p>
                          </div>
                          <p className={`text-sm font-black ${tx.status === 'Success' ? 'text-green-600' : 'text-amber-600'}`}>
                            ${tx.amount}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        Zero transaction records found
                      </div>
                    )}
                  </div>
               </div>
            </div>

            {/* Moderation Controls */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] p-8 shadow-xl shadow-slate-900/10">
                <h3 className="text-xs font-black uppercase tracking-tight mb-8">Administrative Actions</h3>
                <div className="space-y-4">
                  {user.status === 'blocked' ? (
                    <button 
                      disabled={isUpdating}
                      onClick={() => toggleStatus('active')}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-500/20"
                    >
                      Restore Account Access
                    </button>
                  ) : (
                    <button 
                      disabled={isUpdating}
                      onClick={() => toggleStatus('blocked')}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20"
                    >
                      Suspend Account
                    </button>
                  )}

                  {user.role === 'admin' ? (
                    <button 
                      disabled={isUpdating}
                      onClick={() => toggleRole('talent')} // Reverting to a default role
                      className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 dark:border-slate-700"
                    >
                      Revoke Admin Privileges
                    </button>
                  ) : (
                    <button 
                      disabled={isUpdating}
                      onClick={() => toggleRole('admin')}
                      className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
                    >
                      Promote to Admin
                    </button>
                  )}
                  <button className="w-full bg-white/10 dark:bg-slate-900/10 border border-white/20 dark:border-slate-900/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Reset Security Keys
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Security Fingerprint</h3>
                 <div className="space-y-4">
                   <div className="flex justify-between items-center text-[10px] font-bold">
                     <span className="text-slate-400 uppercase">Verification</span>
                     <span className={user.isProfileComplete ? 'text-green-500' : 'text-amber-500'}>
                       {user.isProfileComplete ? 'VERIFIED PROFILE' : 'PENDING PROFILE'}
                     </span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-bold">
                     <span className="text-slate-400 uppercase">Database ID</span>
                     <span className="font-mono text-[9px] opacity-60">#{user._id.slice(-8)}</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
