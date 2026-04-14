"use client";

import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import BottomNavbar from "@/components/BottomNavbar";
import { useStore } from "@/lib/store";
import { API_URL, handleResponse } from "@/lib/api";
import { format } from "date-fns";
import Swal from "sweetalert2";

interface Complaint {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    imageUrl?: string;
  };
  reportedUser?: {
    _id: string;
    name: string;
    email: string;
    imageUrl?: string;
  };
  subject: string;
  message: string;
  category: string;
  status: "pending" | "investigating" | "resolved" | "dismissed";
  createdAt: string;
}

export default function AdminAuditPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const { user } = useStore();

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/admin/complaints?status=${filterStatus}&category=${filterCategory}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await handleResponse(res);
      if (data) {
        setComplaints(data);
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role?.toLowerCase() === "admin") {
      fetchComplaints();
    }
  }, [user, filterStatus, filterCategory]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/admin/complaints/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await handleResponse(res);
      if (data) {
        Swal.fire({
          title: "Status Updated",
          icon: "success",
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false
        });
        fetchComplaints();
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-100 text-orange-600 border-orange-200";
      case "investigating": return "bg-blue-100 text-blue-600 border-blue-200";
      case "resolved": return "bg-emerald-100 text-emerald-600 border-emerald-200";
      case "dismissed": return "bg-slate-100 text-slate-500 border-slate-200";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-display">
      <AdminHeader />

      <main className="flex-1 pb-32 max-w-6xl mx-auto w-full p-4 md:p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Security Audit & Complaints</h1>
            <p className="text-slate-500 font-medium italic">// Real-time monitoring of platform integrity and user disputes</p>
          </div>
          
          <div className="flex gap-3">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Categories</option>
              <option value="security">Security</option>
              <option value="user_report">User Reports</option>
              <option value="message">Messages</option>
              <option value="bug">Bugs</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-20 text-center border border-dashed border-slate-300 dark:border-slate-800">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">verified_user</span>
            <p className="text-slate-500 font-medium">No active complaints found matching the filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {complaints.map((item) => (
              <div key={item._id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                <div className="p-6 flex flex-col md:flex-row gap-8">
                  
                  {/* Reporters Info */}
                  <div className="md:w-64 border-r border-slate-100 dark:border-slate-800 pr-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Reporter</p>
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.user?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user?.name || 'U')}&background=random`} 
                        className="size-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                        alt=""
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{item.user?.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{item.user?.email}</p>
                      </div>
                    </div>

                    {item.reportedUser && (
                      <div className="mt-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-4">Accused User</p>
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.reportedUser?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.reportedUser?.name || 'U')}&background=fecaca&color=991b1b`} 
                            className="size-10 rounded-full object-cover ring-2 ring-red-50"
                            alt=""
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate text-red-600">{item.reportedUser?.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{item.reportedUser?.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Complaint Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">{item.subject}</h3>
                      </div>
                      <p className="text-xs text-slate-400 font-bold">{format(new Date(item.createdAt), "MMM d, yyyy • HH:mm")}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl relative">
                      <span className="material-symbols-outlined absolute top-4 right-4 text-slate-200 dark:text-slate-700 pointer-events-none">format_quote</span>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                        {item.message}
                      </p>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateStatus(item._id, "investigating")}
                          className="px-4 py-2 text-[11px] font-black uppercase tracking-wider text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          Investigate
                        </button>
                        <button 
                          onClick={() => updateStatus(item._id, "resolved")}
                          className="px-4 py-2 text-[11px] font-black uppercase tracking-wider text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                        >
                          Resolve
                        </button>
                        <button 
                          onClick={() => updateStatus(item._id, "dismissed")}
                          className="px-4 py-2 text-[11px] font-black uppercase tracking-wider text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                      
                      <button className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all">
                        View Evidence
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNavbar />
    </div>
  );
}
