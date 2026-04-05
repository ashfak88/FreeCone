"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore, Offer } from "@/lib/store";
import DashboardHeader from "@/components/DashboardHeader";
import Link from "next/link";

export default function ProjectsPage() {
  const router = useRouter();
  const { user, offers, fetchOffers, isLoadingOffers } = useStore();
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "saved">("active");

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const projects = useMemo(() => {
    if (!offers) return { active: [], completed: [], saved: [] };

    // active = accepted AND paid
    const active = offers.filter(o => o.status === 'accepted' && o.isPaid === true);
    
    // completed = currently no 'completed' status, so using empty for now or logic if we have it
    // In many systems, status: 'completed' would be used.
    const completed = offers.filter(o => o.status === 'accepted' && (o as any).isCompleted === true);
    
    const saved: any[] = []; // Currently no 'saved' logic for offers

    return { active, completed, saved };
  }, [offers]);

  if (!user) return null;

  const currentList = projects[activeTab];

  return (
    <div className="flex-1 overflow-y-auto min-h-full">
      <DashboardHeader
        user={user}
        title="My Projects"
        subtitle="Manage your ongoing work, keep track of completion, and review past projects."
        showSearch={true}
      >
        <button
          type="button"
          onClick={() => router.push(user.role === "client" ? "/post-job" : "/find-work")}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 hover:bg-primary/90 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">
            {user.role === "client" ? "add" : "search"}
          </span>
          {user.role === "client" ? "Post a Project" : "Find Projects"}
        </button>
      </DashboardHeader>

      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
              <span className="material-symbols-outlined">work</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active</p>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">{projects.active.length}</h4>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center">
              <span className="material-symbols-outlined">task_alt</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Completed</p>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">{projects.completed.length}</h4>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center">
              <span className="material-symbols-outlined">star</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Saved</p>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">{projects.saved.length}</h4>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800">
          {(["active", "completed", "saved"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 font-bold text-sm transition-all relative capitalize ${activeTab === tab
                  ? "text-primary"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
            >
              {tab} Projects
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Projects List or Empty State */}
        {isLoadingOffers ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : currentList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentList.map((project: Offer) => (
              <div
                key={project._id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-2xl">rocket</span>
                  </div>
                  <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                    {activeTab === 'active' ? 'Ongoing' : 'Finished'}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{project.jobTitle}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 h-10">
                  {project.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Budget</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">${project.budget.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => router.push(`/messages?conversation=${project._id}`)}
                    className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-500 transition-all flex items-center justify-center shadow-inner"
                  >
                    <span className="material-symbols-outlined text-xl">chat_bubble</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm relative min-h-[400px] flex items-center justify-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="text-center p-8 max-w-sm relative z-10">
              <div className="w-24 h-24 mx-auto bg-slate-50 dark:bg-slate-800/80 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-white dark:ring-slate-900">
                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">
                  {activeTab === "active" ? "rocket_launch" : activeTab === "completed" ? "emoji_events" : "bookmark"}
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                No {activeTab} projects yet
              </h3>

              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                {activeTab === "active"
                  ? "You don't have any ongoing projects at the moment. Explore opportunities or start a new task to get things moving!"
                  : activeTab === "completed"
                    ? "Projects that have been successfully finished will appear here. It's empty for now, but keep pushing forward!"
                    : "Items you save for later will be organized here. Start exploring and bookmarking your favorite projects."
                }
              </p>

              <button
                onClick={() => router.push(user.role === "client" ? "/post-job" : "/find-work")}
                className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto active:scale-95 shadow-lg shadow-slate-900/20 dark:shadow-white/20"
              >
                {user.role === "client" ? "Create a Project" : "Explore Projects"}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </section>
        )}

      </div>
      <div className="h-10"></div>
    </div>
  );
}
