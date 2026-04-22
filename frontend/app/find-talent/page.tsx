"use client";

import React, { useState, useEffect } from "react";
import { useStore, User } from "@/lib/store";
import TalentCard from "@/components/TalentCard";
import { useRouter } from "next/navigation";
import CompactNavbar from "@/components/CompactNavbar";

export default function FindTalentPage() {
  const router = useRouter();
  const { talent, fetchTalent, isLoadingTalent: loading, user } = useStore();

  // Filter state
  const [search, setSearch] = useState("");
  const [rateRange, setRateRange] = useState<string>(""); // "0-50", "50-100", "above-100"
  const [selectedRating, setSelectedRating] = useState<string>(""); // "1", "2", "3", "4", "5"

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show Visibility Reminder Swal on load
  useEffect(() => {
    const showReminder = async () => {
      if (isMounted && user && user.role === 'user' && !user.showAsFreelancer) {
        const hasShown = sessionStorage.getItem('visibility_reminder_find_talent');
        if (!hasShown) {
          const Swal = (await import('sweetalert2')).default;
          Swal.fire({
            title: 'Boost Your Visibility!',
            text: 'Clients currently cannot find your profile. Enable your visibility now to start appearing in search results and receiving offers.',
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#0ea5e9',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Enable Visibility',
            cancelButtonText: 'Later',
            background: document.documentElement.classList.contains("dark") ? "#0f172a" : "#fff",
            color: document.documentElement.classList.contains("dark") ? "#fff" : "#000",
            customClass: {
                popup: 'rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl',
                confirmButton: 'rounded-xl px-6 py-3 font-bold uppercase tracking-wider text-[11px] ml-2',
                cancelButton: 'rounded-xl px-6 py-3 font-bold uppercase tracking-wider text-[11px]'
            }
          }).then((result) => {
            if (result.isConfirmed) {
              router.push("/profile");
            }
            sessionStorage.setItem('visibility_reminder_find_talent', 'true');
          });
        }
      }
    };
    showReminder();
  }, [isMounted, user, router]);


  // Refetch when filters change (Debounced Search)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTalent({
        search,
        rateRange,
        rating: selectedRating,
      });
    }, search ? 500 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [search, rateRange, selectedRating, fetchTalent]);


  const clearAll = () => {
    setSearch("");
    setRateRange("");
    setSelectedRating("");
  };

  const hasFilters = search !== "" || rateRange !== "" || selectedRating !== "";


  // Filter out current user from the list
  const filteredTalent = talent.filter(
    (item: User) => (item._id || item.id) !== (user?._id || user?.id)
  );

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <CompactNavbar title="Find Talent" />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Simple Filter Row */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          {/* Search Input */}
          <div className="relative flex-1 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg transition-colors group-focus-within:text-primary">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search talent by name, title or bio..."
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all outline-none text-sm font-medium"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            {/* Rate Select */}
            <div className="relative flex-1 md:flex-none">
              <select
                value={rateRange}
                onChange={(e) => setRateRange(e.target.value)}
                className="w-full md:w-44 h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 appearance-none outline-none text-sm font-bold text-slate-700 cursor-pointer"
              >
                <option value="">Any Hourly Rate</option>
                <option value="0-50">$0 - $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="above-100">$100 above</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
            </div>

            {/* Rating Select */}
            <div className="relative flex-1 md:flex-none">
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full md:w-44 h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 appearance-none outline-none text-sm font-bold text-slate-700 cursor-pointer"
              >
                <option value="">Any Rating</option>
                <option value="5">5 Stars only</option>
                <option value="4">4 Stars & above</option>
                <option value="3">3 Stars & above</option>
                <option value="2">2 Stars & above</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
            </div>

            {/* Clear Button */}
            {hasFilters && (
              <button
                onClick={clearAll}
                title="Clear all filters"
                className="h-12 w-12 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined">restart_alt</span>
              </button>
            )}
          </div>
        </div>

        {/* Visibility Reminder Card - Simple Tip Style */}
        {user && user.role === 'user' && !user.showAsFreelancer && (
          <div className="bg-[#fefce8] border border-yellow-200/50 rounded-2xl p-6 space-y-3 max-w-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <span className="material-symbols-outlined text-xl">lightbulb</span>
              <h4 className="font-bold text-sm">Visibility Tip</h4>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              Enabling your freelancer visibility can increase your profile views by up to 40%. Clients are currently unable to find you in search results.
            </p>

            <button
              onClick={() => router.push("/profile")}
              className="group flex items-center gap-2 text-yellow-800 font-bold text-sm hover:text-yellow-900 transition-colors"
            >
              Update Profile
              <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_right_alt</span>
            </button>
          </div>
        )}

        {/* Results Info */}
        <div className="flex justify-between items-center px-2">
          <h3 className="text-slate-900 text-lg font-extrabold flex items-center gap-2">
            {hasFilters ? "Filtered Results" : "Top Talent"}
            {!loading && <span className="text-xs font-bold text-slate-300">•</span>}
            {!loading && <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredTalent.length} found</span>}
          </h3>
        </div>

        {/* Talent List */}
        <div className="space-y-4 pb-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 animate-pulse">
              <span className="material-symbols-outlined text-6xl mb-4 text-primary/20">hourglass_top</span>
              <p className="font-bold text-sm tracking-widest uppercase">Fetching Talent...</p>
            </div>
          ) : filteredTalent.length > 0 ? (
            filteredTalent.map((item: User) => (
              <TalentCard key={item._id || item.id} talent={item} />
            ))
          ) : (
            <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-slate-100 space-y-6">
              <div className="size-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-slate-50/50">
                <span className="material-symbols-outlined text-5xl text-slate-200">person_off</span>
              </div>
              <div className="space-y-2">
                <h4 className="text-slate-900 font-extrabold text-xl">No talent found</h4>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">We couldn't find anyone matching those specific filters. Try expanding your search criteria.</p>
              </div>
              <button onClick={clearAll} className="px-8 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                Show All Talent
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}