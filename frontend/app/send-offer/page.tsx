"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Send, 
  ShieldCheck, 
  DollarSign, 
  FileText, 
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Briefcase
} from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { API_URL, handleResponse } from "@/lib/api";

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

      await handleResponse(response);

      setStatus({ type: "success", message: "Your offer has been sent securely!" });
      setTimeout(() => router.push("/dashboard"), 2500);
    } catch (err: any) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f7f8]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"
        >
          <Briefcase className="text-primary size-8" />
        </motion.div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Preparing Workspace...</p>
      </div>
    );
  }

  if (!talentId || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f7f8] p-4 text-center">
        <div className="size-20 rounded-full bg-rose-50 flex items-center justify-center mb-6">
          <AlertCircle className="text-rose-500 size-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Talent Not Found</h2>
        <p className="text-slate-500 max-w-xs mb-8 font-medium">We couldn't locate the profile you were looking for. It might have been removed or deactivated.</p>
        <Link href="/find-talent" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95">
          Browse Talent
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8] font-display text-slate-900 selection:bg-primary/20">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200/50 h-16 md:h-20 flex items-center px-4 md:px-8">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
              <ArrowLeft size={18} />
            </div>
            <span className="hidden md:block text-sm font-bold tracking-tight">Back to Profile</span>
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="text-emerald-500 size-5" />
            </div>
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Secure Offer</h1>
          </div>
          
          <div className="w-10 md:w-32" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Side */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 p-6 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <Send size={120} />
              </div>

              <div className="mb-10">
                <h3 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Create Proposal</h3>
                <p className="text-slate-400 font-semibold text-sm">Define your project requirements and budget.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <AnimatePresence mode="wait">
                  {status && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-5 rounded-2xl flex items-start gap-4 ${
                        status.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                          : "bg-rose-50 text-rose-800 border border-rose-100"
                      }`}
                    >
                      {status.type === "success" ? <CheckCircle2 className="size-6 shrink-0 mt-0.5" /> : <AlertCircle className="size-6 shrink-0 mt-0.5" />}
                      <div className="space-y-1">
                        <p className="font-black text-sm uppercase tracking-wider">{status.type === "success" ? "Success" : "Error"}</p>
                        <p className="text-sm font-semibold opacity-90">{status.message}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-6">
                  {/* Job Title */}
                  <div className="group space-y-3">
                    <label htmlFor="jobTitle" className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">
                      <FileText size={14} />
                      Project Title
                    </label>
                    <input
                      id="jobTitle"
                      required
                      placeholder="e.g. Modern Web Dashboard UI Design"
                      className="w-full h-14 px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                      type="text"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Description */}
                  <div className="group space-y-3">
                    <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">
                      <Briefcase size={14} />
                      Scope of Work
                    </label>
                    <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 focus-within:bg-white focus-within:border-primary/30 transition-all overflow-hidden focus-within:ring-4 focus-within:ring-primary/5">
                      <RichTextEditor
                        value={formData.description}
                        onChange={(content) => setFormData({ ...formData, description: content })}
                        placeholder="Detailed project requirements, goals, and key deliverables..."
                      />
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="group space-y-3">
                    <label htmlFor="budget" className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">
                      <DollarSign size={14} />
                      Fixed Budget
                    </label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">$</span>
                      <input
                        id="budget"
                        required
                        placeholder="0.00"
                        className="w-full h-14 pl-12 pr-6 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-black text-lg text-slate-900 placeholder:text-slate-300"
                        type="number"
                        value={formData.budget}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className={`group w-full h-16 rounded-2xl font-black text-lg tracking-tight transition-all flex items-center justify-center gap-3 ${
                      isSubmitting
                        ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                        : "bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/30"
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="size-6 border-3 border-slate-300 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Submit Project Offer</span>
                        <Send className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={20} />
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>

            <div className="px-8 flex items-center justify-between opacity-40">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Escrow Protected</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure 256-bit Encryption</p>
            </div>
          </motion.div>

          {/* Talent Side Card */}
          <motion.aside 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 space-y-6 lg:sticky lg:top-36"
          >
            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-lg p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                <div className="size-16 bg-primary/5 rounded-full flex items-center justify-center -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors">
                  <UserIcon size={32} className="text-primary/20" />
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative group/avatar">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-110 group-hover/avatar:scale-125 transition-transform duration-500 opacity-0 group-hover/avatar:opacity-100" />
                  <div className="size-28 rounded-[2rem] border-4 border-white overflow-hidden shadow-2xl relative bg-slate-50 shrink-0">
                    <img
                      src={profile.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6a6b4c&color=fff&size=200`}
                      alt={profile.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 size-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                    <CheckCircle2 size={20} />
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{profile.name}</h2>
                  <p className="text-primary font-black uppercase tracking-[0.15em] text-[10px]">{profile.title || 'Expert Freelancer'}</p>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {profile.skills?.slice(0, 3).map((skill: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      {skill}
                    </span>
                  ))}
                  {(profile.skills?.length || 0) > 3 && (
                    <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black uppercase text-slate-400">
                      +{(profile.skills?.length || 0) - 3}
                    </span>
                  )}
                </div>

                <div className="w-full pt-6 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</p>
                      <p className="text-xl font-black text-slate-900 tracking-tight">${profile.rate || '0'}<span className="text-slate-400 text-sm font-bold">/hr</span></p>
                    </div>
                    <div className="p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/50 space-y-1">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Experience</p>
                      <p className="text-xl font-black text-indigo-900 tracking-tight">Level 3</p>
                    </div>
                  </div>
                </div>

                <div className="w-full p-6 rounded-2xl bg-primary/5 border border-primary/10 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="text-primary size-4" />
                    </div>
                    <p className="text-[11px] font-black text-primary uppercase tracking-widest">Talent Guarantee</p>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                    This freelancer is verified through our rigorous identity check process and has a proven track record.
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>

        </div>
      </main>
    </div>
  );
}

export default function SendOfferPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7f8]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Data...</p>
        </div>
      </div>
    }>
      <SendOfferContent />
    </Suspense>
  );
}