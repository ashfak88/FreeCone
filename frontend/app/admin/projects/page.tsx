"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AdminHeader from "@/components/AdminHeader";
import BottomNavbar from "@/components/BottomNavbar";

interface Project {
  _id: string;
  title: string;
  budget: number;
  category: string;
  status: "pending" | "active" | "completed" | "disputed";
  user: { name: string; email: string };
  freelancer?: { name: string; email: string; imageUrl?: string };
  createdAt: string;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
      
      const queryParams = new URLSearchParams();
      if (activeTab !== "All") queryParams.append("status", activeTab);
      if (search) queryParams.append("search", search);

      const res = await fetch(`${API_URL}/admin/projects?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch admin projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [activeTab, search]);

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "completed":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "disputed":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = category?.toLowerCase();
    if (cat?.includes("design")) return "palette";
    if (cat?.includes("develop") || cat?.includes("code")) return "terminal";
    if (cat?.includes("write") || cat?.includes("content")) return "description";
    return "shopping_cart";
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300">
      <AdminHeader />

      <main className="flex-1 p-4 max-w-5xl mx-auto w-full pb-32">
        {/* Header and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="text-primary p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined">account_tree</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Project Management</h1>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary/60">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              type="text"
              placeholder="Search projects by ID, title or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-primary/20 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold shadow-sm"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-primary/10 overflow-x-auto no-scrollbar gap-8 mb-8">
          {["All", "Active", "Completed", "Disputed", "Pending"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                activeTab === tab ? "text-primary" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Project List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 bg-white dark:bg-slate-800 rounded-3xl border border-primary/10 animate-pulse relative overflow-hidden p-6 flex flex-col md:flex-row gap-6">
                   <div className="md:w-56 h-40 md:h-full bg-slate-100 dark:bg-slate-700 rounded-2xl"></div>
                   <div className="flex-1 space-y-4">
                      <div className="flex justify-between">
                         <div className="h-3 w-16 bg-slate-100 dark:bg-slate-700 rounded"></div>
                         <div className="h-6 w-24 bg-slate-100 dark:bg-slate-700 rounded"></div>
                      </div>
                      <div className="h-8 w-3/4 bg-slate-100 dark:bg-slate-700 rounded-xl"></div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="h-10 bg-slate-50 dark:bg-slate-700/50 rounded-lg"></div>
                         <div className="h-10 bg-slate-50 dark:bg-slate-700/50 rounded-lg"></div>
                      </div>
                   </div>
                </div>
              ))
            ) : projects.length > 0 ? (
              projects.map((project, idx) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-white dark:bg-slate-800 rounded-3xl border border-primary/10 shadow-sm overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="md:w-56 h-40 md:h-auto relative bg-primary/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary/30 text-5xl group-hover:scale-110 transition-transform duration-500">
                        {getCategoryIcon(project.category)}
                      </span>
                      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyle(project.status)} shadow-sm`}>
                        {project.status || "Pending"}
                      </div>
                    </div>

                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-primary text-[10px] font-black tracking-widest uppercase opacity-70">#{project._id.slice(-8).toUpperCase()}</span>
                          <span className="text-slate-900 dark:text-white font-black text-2xl tracking-tighter">${project.budget.toLocaleString()}</span>
                        </div>
                        <h3 className="text-slate-900 dark:text-white text-xl font-black leading-tight mb-4 group-hover:text-primary transition-colors">{project.title}</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 group/info">
                            <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 group-hover/info:bg-primary/10 group-hover/info:text-primary transition-colors">
                              <span className="material-symbols-outlined text-base">person</span>
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400">Client</p>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{project.user?.name || "Unknown Client"}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 group/info">
                            <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 group-hover/info:bg-primary/10 group-hover/info:text-primary transition-colors">
                              <span className="material-symbols-outlined text-base">badge</span>
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400">Freelancer</p>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{project.freelancer?.name || "No Freelancer"}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button 
                          onClick={() => router.push(`/admin/projects/${project._id}`)}
                          className="px-6 py-3 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:brightness-110 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2"
                        >
                          Manage Project
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="size-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary/40">
                  <span className="material-symbols-outlined text-4xl">folder_off</span>
                </div>
                <div>
                  <h3 className="text-xl font-black">No projects found</h3>
                  <p className="text-slate-500 font-bold text-sm">Adjust your filters or try a different search</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <BottomNavbar />
    </div>
  );
}
