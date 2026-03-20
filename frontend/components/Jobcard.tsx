import React from "react";

export interface Job {
  _id: string;
  title: string;
  description: string;
  budget: number;
  createdAt: string;
}

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  // Format the date
  const dateStr = new Date(job.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {job.title}
          </h3>
          <p className="text-xs text-slate-500 font-medium">Posted {dateStr}</p>
        </div>
        <div className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold px-3 py-1 rounded-full text-sm">
          ${job.budget}
        </div>
      </div>
      
      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-6">
        {job.description}
      </p>

      <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-sm">verified</span>
          <span className="text-xs font-bold text-slate-500">Payment Verified</span>
        </div>
        <button className="text-primary font-bold text-sm hover:underline transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}