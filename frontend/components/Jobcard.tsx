import React from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export interface Job {
  _id: string;
  id?: string;
  title: string;
  description: string;
  budget: number;
  createdAt: string;
  category?: string;
  type?: string;
  duration?: string;
  rating?: number;
  reviews?: number;
  tags?: string[];
  timeline?: string;
  skills?: string[];
  client?: any;
}

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const { user } = useStore();
  const router = useRouter();

  const handleAuthRedirect = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?error=${encodeURIComponent("Please login to access that page")}`);
    } else {
      router.push(path);
    }
  };

  // Format the date
  const dateStr = new Date(job.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Data helpers/fallbacks
  const category = job.category || "General";
  const duration = job.timeline || "3-4 Weeks";
  const rating = job.client?.rating || 4.9;
  const reviews = job.client?.reviewsCount || 10;
  const tags = job.skills && job.skills.length > 0 ? job.skills : ["Web Design", "Development"];

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded mb-2 inline-block">
            {category}
          </span>
          <h4 className="text-xl font-bold transition-colors group-hover:text-primary">
            {job.title}
          </h4>
        </div>
        <button className="text-slate-400 transition-colors hover:text-primary group-hover:scale-110 active:scale-95">
          <span className="material-symbols-outlined">bookmark</span>
        </button>
      </div>

      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2 italic">
        "{job.description}"
      </p>

      {/* Metrics Row */}
      <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 font-light text-lg">payments</span>
          <span className="font-bold text-sm bg-primary/5 text-primary px-2 rounded-lg">
            ${job.budget.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-slate-400 font-light text-lg">calendar_today</span>
          <span className="text-sm font-medium text-slate-500">{duration}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-amber-500 text-lg fill-icon">star</span>
          <span className="font-bold text-sm">{rating.toFixed(1)}</span>
          <span className="text-slate-400 text-xs">({reviews} reviews)</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <div className="flex gap-2">
          {tags.slice(0, 3).map((tag: any) => (
            <span 
              key={tag} 
              className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-full font-semibold border border-slate-100 dark:border-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
        <a 
          href={`/jobs/${job._id || job.id}`} 
          onClick={(e) => handleAuthRedirect(e, `/jobs/${job._id || job.id}`)}
          className="text-primary font-bold text-sm hover:underline flex items-center gap-1 group/link cursor-pointer"
        >
          View Details
          <span className="material-symbols-outlined text-sm group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
        </a>
      </div>
    </div>
  );
}