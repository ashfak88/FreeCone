"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Job } from "@/lib/store";
import Link from "next/link";
import { API_URL, handleResponse } from "@/lib/api";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`${API_URL}/jobs/${params.id}`);
        const data = await handleResponse(response);
        if (data) {
          setJob(data);
        }
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) fetchJob();
  }, [params.id]);

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
        <button onClick={() => router.back()} className="text-primary hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased font-display">
      {/* Header / TopAppBar */}
      <div className="flex items-center h-16 bg-background-light dark:bg-background-dark px-4 md:px-8 justify-between sticky top-0 z-10 border-b border-primary/10 backdrop-blur-md bg-opacity-80">
        <button 
          onClick={() => router.back()}
          className="flex items-center justify-center rounded-full w-10 h-10 -ml-2 text-primary hover:bg-primary/10 transition-all duration-300"
          title="Go Back"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-black leading-tight tracking-tight flex-1 text-center">Project Details</h2>
        <div className="flex w-10 items-center justify-end"></div>
      </div>

      {/* Project Hero Header */}
      <div className="flex p-4 bg-white dark:bg-slate-900/50 border-b border-primary/5">
        <div className="max-w-5xl mx-auto w-full flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div className="flex gap-4">
            {(job.imageUrl || job.client?.avatar) && (
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl min-h-24 w-24 border border-primary/20 shadow-sm transition-transform hover:scale-105" 
                style={{ backgroundImage: `url("${job.imageUrl || job.client?.avatar}")` }}
              ></div>
            )}
            <div className="flex flex-col justify-center">
              <p className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">{job.title}</p>
              <p className="text-primary text-sm font-medium leading-normal">by {job.client?.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[16px] text-primary/60">schedule</span>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-normal">Posted {timeAgo(job.createdAt)}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => router.push(`/jobs/${params.id}/apply`)}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-wide w-full md:w-auto shadow-sm shadow-primary/20 active:scale-95 transition-all hover:bg-primary/90"
          >
            <span className="truncate">Apply for Project</span>
          </button>
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div className="pb-3 bg-white dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto flex border-b border-primary/10 px-4 gap-8 overflow-x-auto no-scrollbar">
          <div className="flex flex-col items-center justify-center border-b-[3px] border-primary text-primary pb-3 pt-4 shrink-0 transition-all hover:opacity-80">
            <p className="text-sm font-bold leading-normal tracking-wide">Overview</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-8 p-4 md:p-8">
        {/* Project Description Section */}
        <section className="flex flex-col gap-3">
          <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">Project Description</h3>
          <p className="text-slate-600 dark:text-slate-300 text-base font-normal leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </section>

        {/* Key Details Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-primary/10 flex items-start gap-4 shadow-sm">
            <div className="bg-primary/10 p-3 rounded-lg text-primary">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Budget</p>
              <p className="text-slate-900 dark:text-slate-100 font-black text-xl">${job.budget.toLocaleString()}</p>
            </div>
          </div>
          {job.timeline && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-primary/10 flex items-start gap-4 shadow-sm">
              <div className="bg-primary/10 p-3 rounded-lg text-primary">
                <span className="material-symbols-outlined text-xl">timer</span>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Timeline</p>
                <p className="text-slate-900 dark:text-slate-100 font-black text-xl">{job.timeline}</p>
              </div>
            </div>
          )}
        </section>


        {/* Client Info Card */}
        <section className="bg-primary/5 dark:bg-primary/10 p-6 md:p-8 rounded-3xl border border-primary/10 shadow-inner">
          <h3 className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">About the Client</h3>
          <div className="flex items-center gap-5 mb-8">
            <div 
              className="size-16 rounded-full bg-cover bg-center border-2 border-primary/20 shadow-md" 
              style={{ backgroundImage: `url("${job.client?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(job.client?.name || 'U') + '&background=6a6b4c&color=fff'}")` }}
            ></div>
            <div>
              <p className="text-slate-900 dark:text-slate-100 text-lg font-black tracking-tight">{job.client?.name}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">{job.client?.role}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-white/40 dark:bg-white/5 p-3 rounded-xl border border-white/40 transition-all hover:bg-white dark:hover:bg-white/10">
              <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{job.client?.verified ? 'Verified Client' : 'Standard Member'}</span>
            </div>
            {job.client?.location && (
              <div className="flex items-center gap-3 bg-white/40 dark:bg-white/5 p-3 rounded-xl border border-white/40 transition-all hover:bg-white dark:hover:bg-white/10">
                <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{job.client?.location}</span>
              </div>
            )}
            <div className="flex items-center gap-3 bg-white/40 dark:bg-white/5 p-3 rounded-xl border border-white/40 transition-all hover:bg-white dark:hover:bg-white/10">
              <span className="material-symbols-outlined text-primary text-xl">star</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{job.client?.rating || '5.0'} ({job.client?.reviewsCount || '0'} reviews)</span>
            </div>
          </div>
        </section>

        {/* Tags/Skills */}
        {job.skills && job.skills.length > 0 && (
          <section className="flex flex-col gap-4">
            <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold">Skills Required</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span 
                  key={skill} 
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-primary/10 hover:border-primary/30 rounded-full text-[11px] font-black uppercase tracking-wider text-primary shadow-sm transition-all hover:shadow-md cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer Bottom Spacing */}
      <div className="h-20"></div>
    </div>
  );
}
