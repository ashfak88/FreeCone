"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { API_URL, handleResponse } from "@/lib/api";

export default function PostJobPage() {
  const router = useRouter();
  const { user } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    timeline: "1-2 Weeks",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          budget: Number(formData.budget),
        }),
      });

      await handleResponse(res);

      // Successfully posted job
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-display flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-4 max-w-5xl mx-auto p-4 w-full">
          <div 
            onClick={() => router.back()}
            className="text-slate-700 flex size-10 items-center justify-center cursor-pointer hover:bg-slate-100 rounded-full transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[18px]">add_task</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">New Job</h2>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-xl">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Post a New Job</h2>
          <p className="text-slate-500 mb-8">Fill out the details below to find the right talent for your project.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-2">
              Job Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="e.g. Need a React Native Developer"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2">
              Job Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Describe the project details, requirements, and deliverables..."
            ></textarea>
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-bold text-slate-700 mb-2">
              Budget ($)
            </label>
            <input
              type="number"
              id="budget"
              name="budget"
              required
              min="1"
              value={formData.budget}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="e.g. 500"
            />
          </div>

          <div>
            <label htmlFor="timeline" className="block text-sm font-bold text-slate-700 mb-2">
              Estimated Deadline / Duration
            </label>
            <select
              id="timeline"
              name="timeline"
              required
              value={formData.timeline}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
            >
              <option value="Less than 1 Week">Less than 1 Week</option>
              <option value="1-2 Weeks">1-2 Weeks</option>
              <option value="2-4 Weeks">2-4 Weeks</option>
              <option value="1-3 Months">1-3 Months</option>
              <option value="3-6 Months">3-6 Months</option>
              <option value="More than 6 Months">More than 6 Months</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-[#5a5c41] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Posting..." : "Post Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}
