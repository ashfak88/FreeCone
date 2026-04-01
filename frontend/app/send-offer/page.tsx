"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore, User } from "@/lib/store";
import Link from "next/link";

function SendOfferContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const talentId = searchParams.get("id");

  const { talent: talentList, fetchTalent } = useStore();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    jobTitle: "",
    description: "",
    budget: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const profile = talentList.find((f) => f._id === talentId || String(f.id) === talentId);

  useEffect(() => {
    if (talentList.length === 0) {
      fetchTalent().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [talentList.length, fetchTalent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Please log in to send an offer");

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${API_URL}/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          talentId,
          jobTitle: formData.jobTitle,
          description: formData.description,
          budget: Number(formData.budget)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send offer");
      }

      setStatus({ type: "success", message: "Offer sent successfully!" });
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: any) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading talent details...</div>;
  if (!talentId || !profile) return <div className="p-8 text-center text-red-500">Talent not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-manrope pb-12">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-slate-600 dark:text-slate-400 hover:text-primary">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold">Send Offer</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-10">
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* Left Column: Offer Form */}
          <div className="flex-1 w-full order-2 lg:order-1">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
              <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <h3 className="text-xl font-black">Offer Details</h3>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 1 of 1</div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {status && (
                  <div className={`p-5 rounded-2xl text-sm font-bold flex items-center gap-3 ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                    <span className="material-symbols-outlined">{status.type === "success" ? "check_circle" : "error"}</span>
                    {status.message}
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 dark:text-slate-300 ml-1">Project Title</label>
                  <input
                    id="jobTitle"
                    required
                    placeholder="e.g. Design a Modern Landing Page"
                    className="w-full p-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold placeholder:text-slate-400"
                    type="text"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 dark:text-slate-300 ml-1">Project Description</label>
                  <textarea
                    id="description"
                    required
                    rows={8}
                    placeholder="Describe the job, requirements, and deliverables..."
                    className="w-full p-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium placeholder:text-slate-400 leading-relaxed"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 dark:text-slate-300 ml-1">Total Budget</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                    <input
                      id="budget"
                      required
                      placeholder="e.g. 500"
                      className="w-full p-4 pl-10 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-black placeholder:text-slate-400 text-xl"
                      type="number"
                      value={formData.budget}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-5 rounded-[1.5rem] font-black text-xl transition-all active:scale-95 shadow-lg ${isSubmitting ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-primary text-white hover:shadow-2xl hover:shadow-primary/30"
                    }`}
                >
                  {isSubmitting ? "Sending..." : "Send Job Offer"}
                </button>

                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <p className="text-center text-[10px] font-bold uppercase tracking-widest">
                    Secure Payment & Agreement Active
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Talent Summary Sidebar */}
          <div className="w-full lg:w-80 order-1 lg:order-2 sticky top-28">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm text-center">
              <div className="relative inline-block mb-6">
                <div className="h-28 w-28 rounded-[2rem] overflow-hidden border-4 border-primary/10 bg-slate-100 mx-auto shadow-xl">
                  <img
                    src={profile.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6a6b4c&color=fff`}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-white size-8 rounded-xl flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900">
                  <span className="material-symbols-outlined text-xs fill-icon">verified</span>
                </div>
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1">{profile.name}</h2>
              <p className="text-primary font-black text-xs uppercase tracking-[0.2em] mb-4">{profile.title || profile.role || "Talent"}</p>

              <div className="flex items-center justify-center gap-1.5 text-slate-500 bg-slate-50 dark:bg-slate-800/50 py-2 rounded-xl border border-slate-100 dark:border-slate-800 px-4">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span className="text-xs font-bold">{profile.location || 'Global'}</span>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-400">Rate</span>
                  <span className="text-slate-900 dark:text-white">${profile.rate || '0'}/hr</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-400">Success</span>
                  <span className="text-slate-900 dark:text-white">{profile.successRate || '100%'}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-900/20">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-amber-500">lightbulb</span>
                <p className="text-[11px] font-bold text-amber-800 dark:text-amber-400 leading-relaxed">
                  Tip: Be detailed in your description to help the talent understand exactly what you need.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function SendOfferPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <SendOfferContent />
    </Suspense>
  );
}