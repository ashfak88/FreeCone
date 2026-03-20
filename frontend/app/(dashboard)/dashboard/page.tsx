"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import DashboardHeader from "@/components/DashboardHeader";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useStore();

  return (
    <div className="flex-1 overflow-y-auto">
      <DashboardHeader
        user={user}
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name}!`}
      >
        <button 
          onClick={() => router.push("/notifications")}
          className="text-slate-500 hover:text-slate-800 transition-colors relative"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </DashboardHeader>

      <main className="max-w-[1240px] mx-auto p-6 md:p-8 space-y-10">

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-slate-500">Total Earnings</p>
              <span className="material-symbols-outlined text-slate-400 text-xl">payments</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">$0.00</h2>
              <div className="flex items-center gap-1 mt-2 text-slate-400 font-medium text-xs">
                <span>No earnings yet</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-slate-500">Total Spend</p>
              <span className="material-symbols-outlined text-slate-400 text-xl">shopping_cart</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">$0.00</h2>
              <div className="flex items-center gap-1 mt-2 text-slate-400 font-medium text-xs">
                <span>No spending yet</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-slate-500">Active Projects</p>
              <span className="material-symbols-outlined text-slate-400 text-xl">account_tree</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">0</h2>
              <div className="flex items-center gap-1 mt-2 text-slate-400 font-medium text-xs">
                <span>No active projects</span>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-slate-500">Success Rate</p>
              <span className="material-symbols-outlined text-slate-400 text-xl">verified</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">0%</h2>
              <div className="flex items-center gap-1 mt-2 text-slate-400 font-medium text-xs">
                <span>New account</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-10">

            {/* My Projects */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900">My Projects</h3>
                <Link href="#" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                  View all projects
                </Link>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 border-dashed p-10 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-slate-300 text-3xl">folder_open</span>
                </div>
                <h4 className="font-bold text-slate-900 mb-1">No active projects yet</h4>
                <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
                  Start your first project today and build your professional history.
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/find-work"
                    className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-sm"
                  >
                    Find Work
                  </Link>
                  <Link
                    href="/post-job"
                    className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
                  >
                    Post a Job
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-5">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/find-work')}
                  className="bg-primary hover:bg-[#5a5c41] transition-colors text-white rounded-xl p-6 shadow-md flex flex-col items-center justify-center gap-3 h-32"
                >
                  <span className="material-symbols-outlined text-3xl">search</span>
                  <span className="font-bold text-sm">Find Work</span>
                </button>
                <button
                  onClick={() => router.push('/find-talent')}
                  className="bg-white hover:border-primary transition-colors border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center gap-3 h-32 group"
                >
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-3xl">person_search</span>
                  <span className="font-bold text-sm text-slate-700">Find Talent</span>
                </button>
                <button
                  onClick={() => router.push('/post-job')}
                  className="bg-white hover:border-primary transition-colors border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center gap-3 h-32 group"
                >
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-3xl">add_box</span>
                  <span className="font-bold text-sm text-slate-700">Post a Job</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-8">

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-5">Recent Activity</h3>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-slate-300">history</span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm mb-1">No activity yet</p>
                  <p className="text-xs text-slate-500">Your recent activities will appear here.</p>
                </div>

                <div className="border-t border-slate-100 p-4 text-center">
                  <span className="text-sm font-bold text-slate-300 cursor-not-allowed">
                    View All Activity
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard Tip */}
            <div className="bg-[#f8faf4] border border-[#e8efe0] rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-[20px]">lightbulb</span>
                <p className="font-bold text-slate-900 text-sm">Dashboard Tip</p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Complete your profile to increase your visibility by 40%. Clients look for verified skills and portfolio items.
              </p>
              <Link href="/profile" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                Update Profile <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
