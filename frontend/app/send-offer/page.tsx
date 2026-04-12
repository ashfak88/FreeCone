"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore, User } from "@/lib/store";
import Link from "next/link";
import RichTextEditor from "@/components/RichTextEditor";

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
    <div className="min-h-screen bg-slate-50 font-display transition-colors duration-500">
      <header className="sticky top-0 z-50 bg-white border-b border-primary/10 px-4 md:px-8 h-16 flex items-center">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center rounded-full w-10 h-10 -ml-2 text-slate-500 hover:text-primary hover:bg-primary/10 transition-all duration-300"
            title="Go Back"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
            <h1 className="text-sm font-black uppercase tracking-widest text-slate-800">Direct Offer</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-white rounded-3xl border border-primary/10 shadow-sm overflow-hidden">

          {/* Compact Talent Card */}
          <div className="px-6 py-5 bg-primary/5 flex items-center justify-between border-b border-primary/5">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl border-2 border-white bg-white overflow-hidden shadow-sm">
                <img
                  src={profile.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6a6b4c&color=fff`}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="leading-tight">
                <h2 className="text-base font-black text-slate-900">{profile.name}</h2>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{profile.title || 'Elite Talent'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Rate</p>
              <p className="text-sm font-black text-slate-900">${profile.rate || '0'}/hr</p>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Project Proposal</h3>
              <p className="text-xs font-semibold text-slate-400">Review your requirement details before sending</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {status && (
                <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 ${status.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}>
                  <span className="material-symbols-outlined text-lg">{status.type === "success" ? "check_circle" : "error"}</span>
                  {status.message}
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="jobTitle" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-0.5">
                    Job Title
                  </label>
                  <input
                    id="jobTitle"
                    required
                    placeholder="Enter project name"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm text-slate-900"
                    type="text"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-0.5">
                    Description
                  </label>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-primary transition-all overflow-hidden">
                    <RichTextEditor
                      value={formData.description}
                      onChange={(content) => setFormData({ ...formData, description: content })}
                      placeholder="Share your goals and deliverables..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="budget" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-0.5">
                    Budget ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      id="budget"
                      required
                      placeholder="0.00"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm text-slate-900"
                      type="number"
                      value={formData.budget}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full h-14 rounded-2xl font-black text-base tracking-tight transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isSubmitting
                      ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                      : "bg-primary text-white shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
                    }`}
                >
                  {isSubmitting ? (
                    <div className="size-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Job Offer</span>
                      <span className="material-symbols-outlined text-lg">send</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="material-symbols-outlined text-slate-300 text-xs">verified</span>
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                  Protected by FreeCone Escrow
                </p>
              </div>
            </form>
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