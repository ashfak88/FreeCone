"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import JobCard from "@/components/Jobcard";
import { useStore } from "@/lib/store";

export default function JobsPage() {
  const router = useRouter();
  const { jobs, isLoadingJobs: loading, fetchJobs } = useStore();

  useEffect(() => {
    // Only fetch if we don't have jobs yet
    if (jobs.length === 0) {
      fetchJobs();
    }
  }, [jobs.length, fetchJobs]);

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] font-display">

      {/* HEADER */}
      <header className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="flex justify-between items-center max-w-5xl mx-auto p-4">
          <div className="flex items-center gap-4">
            <div 
              onClick={() => router.back()}
              className="text-slate-700 dark:text-slate-300 flex size-10 items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[18px]">hexagon</span>
              </div>
              <h2 className="text-xl font-black dark:text-white text-slate-900 tracking-tighter uppercase">Find Jobs</h2>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* TITLE */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Find your next project</h1>
          <p className="text-slate-500 mt-2 font-medium">
            Explore freelance opportunities that match your skills.
          </p>
        </div>

        {/* SEARCH */}
        <div className="mb-8 flex gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              placeholder="Search jobs by title or keyword..."
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm text-slate-900 dark:text-slate-100"
            />
          </div>
          <button className="bg-primary hover:bg-[#5a5c41] transition-colors text-white font-bold px-8 py-4 rounded-xl shadow-md">
            Search
          </button>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[200px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm animate-pulse rounded-xl"
              />
            ))}
          </div>
        )}

        {/* JOB LIST */}
        {!loading && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && jobs.length === 0 && (
          <div className="text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-16 px-6 mt-6 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-slate-400 text-2xl">work_off</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No jobs available right now</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Check back later or try adjusting your search filters to find more opportunities.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
