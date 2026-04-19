"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import JobCard from "@/components/Jobcard";
import { useStore, Job } from "@/lib/store";
import Link from "next/link";
import CompactNavbar from "@/components/CompactNavbar";
import { AnimatePresence, motion } from "framer-motion";

export default function JobsPage() {
  const router = useRouter();
  const { jobs, isLoadingJobs: loading, fetchJobs, user } = useStore();

  // Filter & Search States
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (jobs.length === 0) {
      fetchJobs();
    }
  }, [jobs.length, fetchJobs]);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // 1. Hide own jobs
    result = result.filter(
      (job) => (job.user || (job as any).userId) !== (user?._id || user?.id)
    );

    // 2. Search Filter
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        j => j.title.toLowerCase().includes(query) ||
          j.description.toLowerCase().includes(query) ||
          j.skills?.some(s => s.toLowerCase().includes(query))
      );
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "budget-high") return b.budget - a.budget;
      if (sortBy === "budget-low") return a.budget - b.budget;
      return 0;
    });

    return result;
  }, [jobs, search, sortBy, user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveDropdown(null);
  };

  const isFiltered = search.trim() !== "";

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f7f8] dark:bg-[#101922] font-display text-slate-900 dark:text-slate-100 pb-20">
      <CompactNavbar title="Find Work" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        {/* HERO SECTION */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 tracking-tight">Find your next project</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg">Explore high-quality freelance opportunities posted by verified clients.</p>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="mb-8 sticky top-[64px] md:top-[73px] z-30 bg-[#f6f7f8]/90 dark:bg-[#101922]/90 backdrop-blur-xl py-4 transition-all border-b border-transparent px-1">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <label className="flex items-stretch rounded-2xl h-12 md:h-14 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/30 transition-all">
                <div className="flex items-center justify-center pl-4 md:pl-5 text-slate-400">
                  <span className="material-symbols-outlined font-light">search</span>
                </div>
                <input
                  className="flex w-full bg-transparent border-none focus:ring-0 px-3 md:px-4 text-sm md:text-base font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
                  placeholder="Search for projects, skills, or keywords"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button type="button" onClick={() => setSearch("")} className="px-4 text-slate-400 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-sm font-bold">close</span>
                  </button>
                )}
              </label>
            </div>
            <button className="bg-primary text-white px-10 h-12 md:h-14 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95 text-sm md:text-base">
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* RESULTS HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-slate-900 dark:text-slate-100 text-xl font-black">
              {isFiltered ? "Search Results" : "Featured Opportunities"}
            </h3>
            {!loading && (
              <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                {filteredJobs.length} Results
              </span>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
              className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span>{sortBy === 'newest' ? 'Newest' : sortBy === 'budget-high' ? 'Highest Budget' : 'Lowest Budget'}</span>
              <span className="material-symbols-outlined text-sm">swap_vert</span>
            </button>
            <AnimatePresence>
              {activeDropdown === 'sort' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-2 z-50"
                >
                  {[
                    { label: 'Newest First', value: 'newest' },
                    { label: 'Budget: High to Low', value: 'budget-high' },
                    { label: 'Budget: Low to High', value: 'budget-low' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => { setSortBy(item.value); setActiveDropdown(null); }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${sortBy === item.value ? 'bg-primary text-white' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* JOB LISTING */}
        <div className="grid gap-4 mb-20">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-50 dark:border-slate-700 animate-pulse shadow-sm" />
            ))
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobCard key={job._id || job.id} job={job} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-800 p-16 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700 text-center shadow-sm"
            >
              <div className="size-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
              </div>
              <h4 className="text-2xl font-black mb-2">No matching jobs</h4>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm font-medium">We couldn't find any opportunities matching your current search criteria.</p>
              <button onClick={() => setSearch("")} className="mt-8 text-primary font-black uppercase tracking-widest text-xs hover:underline">Clear search</button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
