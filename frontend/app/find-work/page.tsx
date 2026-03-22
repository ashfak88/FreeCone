"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import JobCard from "@/components/Jobcard";
import { useStore } from "@/lib/store";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function JobsPage() {
  const router = useRouter();
  const { jobs, isLoadingJobs: loading, fetchJobs, user } = useStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Only fetch if we don't have jobs yet
    if (jobs.length === 0) {
      fetchJobs();
    }
  }, [jobs.length, fetchJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for filtering could be added here
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f7f8] dark:bg-[#101922] font-display text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {/* HERO SECTION */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2">Find your next project</h1>
          <p className="text-slate-500 dark:text-slate-400">Explore over 1,500 new freelance opportunities posted today</p>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="mb-6 sticky top-[73px] z-10 bg-[#f6f7f8]/80 dark:bg-[#101922]/80 backdrop-blur-md py-2">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="flex items-stretch rounded-xl h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                <div className="flex items-center justify-center pl-4 text-slate-400">
                  <span className="material-symbols-outlined font-light">search</span>
                </div>
                <input 
                  className="flex w-full bg-transparent border-none focus:ring-0 px-3 text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none" 
                  placeholder="Search for projects, skills, or keywords" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>
            <button className="bg-primary text-white px-8 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
              <span>Search</span>
            </button>
          </form>

          {/* CATEGORY PILLS */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
            <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary text-white px-5 text-sm font-semibold whitespace-nowrap shadow-md shadow-primary/10">
              <span className="material-symbols-outlined text-sm">grid_view</span>
              All Categories
            </button>
            {['Budget', 'Duration', 'Expertise'].map((label) => (
              <button key={label} className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 text-sm font-medium whitespace-nowrap transition-all hover:border-primary hover:text-primary">
                <span className="material-symbols-outlined text-sm">
                  {label === 'Budget' ? 'payments' : label === 'Duration' ? 'schedule' : 'bolt'}
                </span>
                {label}
                <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
              </button>
            ))}
          </div>
        </div>

        {/* RESULTS HEADER */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold">Featured Opportunities</h3>
          <div className="flex items-center gap-1 text-primary text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity">
            <span>Sort by: Newest</span>
            <span className="material-symbols-outlined text-sm">swap_vert</span>
          </div>
        </div>

        {/* JOB LISTING */}
        <div className="grid gap-4 mb-20">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 animate-pulse shadow-sm" />
            ))
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard key={job._id || job.id} job={job} />
            ))
          ) : (
            <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
              <div className="size-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-slate-300">work_off</span>
              </div>
              <h4 className="text-xl font-bold mb-2">No jobs found</h4>
              <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm">We couldn't find any opportunities matching your current criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
