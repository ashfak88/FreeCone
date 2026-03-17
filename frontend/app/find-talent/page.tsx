"use client";

import { useEffect, useState } from "react";
import FreelancerCard from "@/components/FreelancerCard";
import { Freelancer } from "@/types/freelancer";

export default function FindTalentPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users/freelancers");
        if (!response.ok) {
          throw new Error("Failed to fetch freelancers");
        }
        const data = await response.json();
        setFreelancers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, []);

  return (
    <div className="min-h-screen bg-background-light font-manrope">
      
      <header className="flex items-center bg-white p-4 border-b border-slate-200 sticky top-0 z-50">
        <div className="text-primary flex size-10 items-center justify-center cursor-pointer">
          <span className="material-symbols-outlined text-3xl">arrow_back</span>
        </div>
        <h1 className="text-slate-900 text-xl font-bold flex-1 text-center">Find Talent</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center rounded-full w-10 h-10 bg-slate-100 text-slate-700">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="h-10 w-10 rounded-full border-2 border-primary overflow-hidden">
            <img src="https://i.pravatar.cc/150?u=user" alt="Me" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            type="text"
            placeholder="Search freelancers by name or role"
            className="w-full h-14 pl-12 pr-4 rounded-xl border-none shadow-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {['Skills', 'Hourly Rate', 'Rating', 'Availability'].map((f) => (
            <button key={f} className="flex shrink-0 items-center gap-2 px-5 py-2 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-700">
              {f} <span className="material-symbols-outlined text-lg text-slate-400">expand_more</span>
            </button>
          ))}
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-end">
          <h3 className="text-slate-900 text-lg font-bold">Top Rated Freelancers</h3>
          <span className="text-xs text-slate-500 font-medium">{freelancers.length} results found</span>
        </div>

        {/* Cards List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10">Loading freelancers...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : freelancers.length > 0 ? (
            freelancers.map((item) => (
              <FreelancerCard key={item._id || item.id} freelancer={item} />
            ))
          ) : (
            <div className="text-center py-10">No freelancers found.</div>
          )}
        </div>
      </main>
    </div>
  );
}