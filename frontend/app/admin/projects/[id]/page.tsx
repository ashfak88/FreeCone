"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL, handleResponse } from "@/lib/api";
import AdminHeader from "@/components/AdminHeader";
import BottomNavbar from "@/components/BottomNavbar";
import Swal from "sweetalert2";

interface ProjectDetail {
  _id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  status: "pending" | "active" | "completed" | "disputed";
  timeline: string;
  skills: string[];
  user: { _id: string; name: string; email: string; imageUrl?: string; role: string };
  freelancer?: { _id: string; name: string; email: string; imageUrl?: string; role: string };
  createdAt: string;
}

interface Transaction {
  _id: string;
  txnId: string;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
}

export default function AdminProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useStore();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProjectDetail = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/admin/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await handleResponse(res);
      if (data) {
        setProject(data.project);
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Failed to fetch project detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role?.toLowerCase() === "admin") {
      fetchProjectDetail();
    }
  }, [id, currentUser]);

  const handleUpdateStatus = async (newStatus: string) => {
    const result = await Swal.fire({
      title: 'Update Project Status?',
      text: `Are you sure you want to change this project's status to ${newStatus}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6A6B4C',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, update it!',
      customClass: { popup: 'rounded-3xl' }
    });

    if (!result.isConfirmed) return;

    setIsUpdating(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/admin/projects/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await handleResponse(res);
      if (data) {
        setProject((prev) => prev ? { ...prev, status: newStatus as any } : null);
        Swal.fire({
          title: 'Success!',
          text: 'Project status updated successfully.',
          icon: 'success',
          confirmButtonColor: '#6A6B4C',
          customClass: { popup: 'rounded-3xl' }
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to update status',
        icon: 'error',
        confirmButtonColor: '#6A6B4C'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
        <AdminHeader />
        <div className="max-w-4xl mx-auto p-8 pt-12 space-y-8 animate-pulse">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-12 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            <div className="grid grid-cols-2 gap-8">
                <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-3xl"></div>
                <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-3xl"></div>
            </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-8 text-center gap-6">
          <span className="material-symbols-outlined text-6xl text-slate-300">error</span>
          <h1 className="text-2xl font-black">Project Not Found</h1>
          <button onClick={() => router.back()} className="px-8 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-display text-slate-900 dark:text-slate-100">
      <AdminHeader />

      <main className="max-w-5xl mx-auto px-4 py-12 pb-32">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Projects
            </button>
            <div className="flex items-center gap-4">
               <h1 className="text-4xl font-black tracking-tighter leading-none">{project.title}</h1>
               <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                 project.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                 project.status === 'completed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                 project.status === 'disputed' ? 'bg-red-50 text-red-600 border-red-100' :
                 'bg-slate-100 text-slate-600 border-slate-200'
               }`}>
                 {project.status}
               </span>
            </div>
            <p className="text-slate-500 font-bold font-mono text-sm">ID: {project._id}</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Payout</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">${project.budget.toLocaleString()}</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Card */}
            <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
               <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Project Description</h3>
               <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                 {project.description}
               </p>
               
               <div className="mt-8 flex flex-wrap gap-2">
                 {project.skills.map(skill => (
                   <span key={skill} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 rounded-lg">
                     #{skill}
                   </span>
                 ))}
               </div>
            </section>

            {/* Transactions Section */}
            <section className="space-y-6">
              <h3 className="text-xl font-black px-2 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">payments</span>
                Financial Trail
              </h3>
              
              <div className="space-y-3">
                {transactions.length > 0 ? transactions.map(txn => (
                  <div key={txn._id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-xl">receipt_long</span>
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{txn.txnId}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(txn.createdAt).toLocaleDateString()} • {txn.type}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-slate-900 dark:text-white">${txn.amount.toLocaleString()}</p>
                       <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">{txn.status}</span>
                    </div>
                  </div>
                )) : (
                  <div className="py-12 bg-slate-100/50 dark:bg-slate-900/50 rounded-3xl text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No transaction history recorded</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Participants Card */}
            <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Platform Participants</h3>
               
               {/* Client */}
               <div className="group cursor-pointer">
                 <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-3">Principal Client</p>
                 <div className="flex items-center gap-4">
                    <img 
                      src={project.user?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.user?.name)}&background=random`} 
                      className="size-12 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:scale-110 transition-transform" 
                      alt="" 
                    />
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 dark:text-white truncate">{project.user?.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 truncate">{project.user?.email}</p>
                    </div>
                 </div>
               </div>

               {/* Freelancer */}
               <div className="group cursor-pointer">
                 <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-3">Hired Talent</p>
                 {project.freelancer ? (
                   <div className="flex items-center gap-4">
                      <img 
                        src={project.freelancer.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.freelancer.name)}&background=random`} 
                        className="size-12 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:scale-110 transition-transform" 
                        alt="" 
                      />
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 dark:text-white truncate">{project.freelancer.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 truncate">{project.freelancer.email}</p>
                      </div>
                   </div>
                 ) : (
                   <div className="flex items-center gap-4 opacity-50">
                      <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400">person_off</span>
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Awaiting Talent</p>
                   </div>
                 )}
               </div>
            </section>

            {/* Management Actions */}
            <section className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6 shadow-2xl">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-white/50">Administrative Control</h3>
               
               <div className="space-y-4">
                 <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Manual Status Override</label>
                    <select 
                      value={project.status}
                      disabled={isUpdating}
                      onChange={(e) => handleUpdateStatus(e.target.value)}
                      className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                    >
                      <option className="text-black" value="pending">Pending</option>
                      <option className="text-black" value="active">Active</option>
                      <option className="text-black" value="completed">Completed</option>
                      <option className="text-black" value="disputed">Disputed</option>
                    </select>
                 </div>

                 <button className="w-full py-4 bg-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/30 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">flag</span>
                    Flag for Review
                 </button>
               </div>
            </section>
          </div>
        </div>
      </main>

      <BottomNavbar />
    </div>
  );
}
