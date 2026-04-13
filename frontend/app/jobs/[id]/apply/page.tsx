"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Job, useStore } from "@/lib/store";
import RichTextEditor from "@/components/RichTextEditor";
import Swal from "sweetalert2";

export default function ApplyForProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useStore();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    coverLetter: "",
    proposedRate: "",
    timeline: "",
    figmaLink: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
        const response = await fetch(`${API_URL}/jobs/${params.id}`);
        if (!response.ok) throw new Error("Job not found");
        const data = await response.json();
        setJob(data);
        // Pre-fill budget min/max if needed, but the HTML just shows the range
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) fetchJob();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("accessToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
      
      const submitData = new FormData();
      submitData.append("coverLetter", formData.coverLetter);
      submitData.append("proposedRate", formData.proposedRate);
      submitData.append("timeline", formData.timeline);
      if (formData.figmaLink) submitData.append("figmaLink", formData.figmaLink);
      if (resumeFile) submitData.append("resume", resumeFile);

      const response = await fetch(`${API_URL}/jobs/${params.id}/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit proposal");
      }

      await Swal.fire({
        title: 'Success!',
        text: 'Application sent successfully!',
        icon: 'success',
        confirmButtonColor: '#6a6b4c',
        background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
      router.push(`/jobs/${params.id}`);
    } catch (error: any) {
      console.error("Error submitting proposal:", error);
      Swal.fire({
        title: 'Error',
        text: error.message || "Something went wrong. Please try again.",
        icon: 'error',
        confirmButtonColor: '#6a6b4c',
        background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
        <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
        <button onClick={() => router.back()} className="text-primary hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300 min-h-screen">
      <div className="relative flex w-full flex-col overflow-x-hidden border-primary/10">
        
        {/* Top Navigation */}
        <div className="flex items-center p-6 py-4 justify-between bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl sticky top-0 z-20 border-b border-primary/5">
          <div className="max-w-6xl mx-auto w-full flex items-center">
            <button 
              onClick={() => router.back()}
              aria-label="Go back" 
              className="text-primary hover:bg-primary/10 p-2 rounded-xl transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 className="text-slate-900 dark:text-slate-100 text-xl font-black leading-tight tracking-tight flex-1 ml-6">Apply for Project</h2>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Project Overview */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
              <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-8 border border-primary/10 shadow-xl shadow-primary/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                
                <div className="flex items-center gap-2 mb-6 relative">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <span className="material-symbols-outlined text-sm font-bold">work</span>
                  </div>
                  <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">Active Opportunity</span>
                </div>

                <h3 className="text-slate-900 dark:text-slate-100 text-2xl font-black leading-[1.1] mb-6 tracking-tight">
                  {job.title}
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/5">
                    <span className="material-symbols-outlined text-primary">payments</span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Budget Range</p>
                      <p className="text-lg font-black text-slate-900 dark:text-slate-100">${job.budget.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/5">
                    <span className="material-symbols-outlined text-primary">category</span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Project Category</p>
                      <p className="text-lg font-black text-slate-900 dark:text-slate-100">{job.category || 'General'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-primary/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/10">
                      <span className="material-symbols-outlined text-primary text-sm">person</span>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">{job.client?.name || 'Artisan Collective'}</p>
                      <p className="text-[10px] font-bold text-slate-400">Verified Client • 4.9 Rating</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 border border-primary/10 flex items-center gap-4">
                <span className="material-symbols-outlined text-primary animate-pulse">tips_and_updates</span>
                <p className="text-xs font-bold leading-relaxed text-slate-600 dark:text-slate-400">
                  Tip: A strong cover letter increases your chances by <span className="text-primary font-black text-sm">40%</span>. Take your time!
                </p>
              </div>
            </div>

            {/* Right Column: Submission Form */}
            <form className="lg:col-span-8 space-y-10" onSubmit={handleSubmit}>
              <div className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] p-8 md:p-12 border border-primary/5 shadow-2xl shadow-primary/[0.02]">
                <div className="mb-12">
                  <h3 className="text-slate-900 dark:text-slate-100 text-3xl md:text-4xl font-black leading-tight tracking-tight mb-3">Submit Proposal</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium">Craft a compelling application to stand out from the crowd.</p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {/* Cover Letter */}
                  <div className="flex flex-col w-full group">
                    <label className="text-slate-700 dark:text-slate-200 text-xs font-black uppercase tracking-[0.15em] pb-3 flex justify-between">
                      Cover Letter
                      <span className="text-[10px] font-bold text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full lowercase italic">Recommended</span>
                    </label>
                    <RichTextEditor 
                      value={formData.coverLetter}
                      onChange={(content) => setFormData({...formData, coverLetter: content})}
                      placeholder="Explain why you are the best fit for this project, your relevant experience, and your approach to the requirements..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Proposed Rate */}
                    <div className="flex flex-col">
                      <label className="text-slate-700 dark:text-slate-200 text-xs font-black uppercase tracking-[0.15em] pb-3">Proposed Rate</label>
                      <div className="relative group">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg group-focus-within:text-primary transition-colors">$</span>
                        <input 
                          required
                          type="number"
                          value={formData.proposedRate}
                          onChange={(e) => setFormData({...formData, proposedRate: e.target.value})}
                          className="form-input flex w-full rounded-2xl text-slate-900 dark:text-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary border border-primary/10 bg-white/50 dark:bg-slate-800/50 p-6 pl-12 text-lg font-black leading-normal transition-all shadow-inner" 
                          placeholder="0.00" 
                        />
                      </div>
                    </div>

                    {/* Estimated Timeline */}
                    <div className="flex flex-col">
                      <label className="text-slate-700 dark:text-slate-200 text-xs font-black uppercase tracking-[0.15em] pb-3">Estimated Timeline</label>
                      <div className="relative group">
                        <select 
                          required
                          value={formData.timeline}
                          onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                          className="form-select flex w-full rounded-2xl text-slate-900 dark:text-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary border border-primary/10 bg-white/50 dark:bg-slate-800/50 p-6 text-base font-black leading-normal appearance-none transition-all shadow-inner"
                        >
                          <option value="" disabled>Select duration</option>
                          <option value="1">Less than 1 month</option>
                          <option value="2">1 to 3 months</option>
                          <option value="3">3 to 6 months</option>
                          <option value="4">More than 6 months</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">expand_more</span>
                      </div>
                    </div>
                  </div>

                  {/* Resume Selection Section */}
                  <div className="flex flex-col gap-6 p-8 rounded-3xl bg-primary/5 border border-primary/10 relative overflow-hidden group/resume">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 transition-transform group-hover/resume:scale-125"></div>
                    
                    <div className="flex items-center gap-4 relative">
                      <div className="size-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-primary/5">
                        <span className="material-symbols-outlined text-primary text-2xl">description</span>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">Project Resume</h4>
                        <p className="text-[10px] font-bold text-slate-400">PDF, DOC, DOCX • Max 5MB</p>
                      </div>
                    </div>

                    <div className="space-y-4 relative">
                      {user?.resume && !resumeFile ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white transition-all hover:bg-white dark:hover:bg-slate-800">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-emerald-500 fill-icon">check_circle</span>
                            <div>
                              <p className="text-xs font-black text-slate-900 dark:text-slate-100">Using Profile Resume</p>
                              <p className="text-[10px] text-slate-500 line-clamp-1 max-w-[200px] italic">Your standard CV will be shared.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <a href={user.resume} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase text-primary hover:underline">Preview</a>
                             <span className="text-slate-200">|</span>
                             <label htmlFor="project-resume" className="text-[10px] font-black uppercase text-slate-500 hover:text-primary cursor-pointer transition-colors">Change</label>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/20 rounded-2xl bg-white/40 group-hover/resume:bg-white/60 transition-all">
                          {resumeFile ? (
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-xs font-black text-slate-900 dark:text-slate-100">{resumeFile.name}</span>
                              <button 
                                type="button" 
                                onClick={() => setResumeFile(null)}
                                className="text-[10px] font-black uppercase text-red-500 hover:underline"
                              >
                                Remove & Use Default
                              </button>
                            </div>
                          ) : (
                            <label htmlFor="project-resume" className="flex flex-col items-center gap-2 cursor-pointer group/label">
                              <span className="material-symbols-outlined text-3xl text-primary/40 group-hover/label:text-primary transition-colors">cloud_upload</span>
                              <p className="text-xs font-bold text-slate-500 tracking-tight">Click to upload a custom resume for this job</p>
                            </label>
                          )}
                        </div>
                      )}
                      
                      <input 
                        type="file" 
                        id="project-resume" 
                        className="hidden" 
                        accept=".pdf,.doc,.docx" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setResumeFile(file);
                        }}
                      />
                    </div>
                  </div>
  
                  {/* Submit Button */}
                  <div className="pt-12 pb-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary hover:bg-primary/95 text-white font-black text-xl py-6 rounded-[2rem] shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-4 transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <span>{isSubmitting ? "Sending Application..." : "Send Application"}</span>
                      <span className="material-symbols-outlined text-2xl font-black">send</span>
                    </button>
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">gavel</span>
                      <p className="text-center text-slate-400 text-[10px] uppercase font-black tracking-widest leading-relaxed">
                        By clicking send, you agree to our Terms of Service regarding freelancer contracts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Footer Bottom Spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
