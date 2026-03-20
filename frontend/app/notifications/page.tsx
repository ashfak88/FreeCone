"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden font-display text-slate-900 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-primary/10">
        <div 
          onClick={() => router.back()}
          className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </div>

        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 px-4">
          Notifications
        </h2>

        <div className="flex items-center justify-end">
          <button className="text-primary text-sm font-bold leading-normal tracking-wide shrink-0 hover:bg-primary/5 px-2 py-1 rounded-lg">
            Mark all as read
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="pb-1 bg-background-light dark:bg-background-dark">
        <div className="flex border-b border-primary/10 px-4 gap-6 overflow-x-auto no-scrollbar">
          <a className="flex flex-col items-center justify-center border-b-[3px] border-primary text-slate-900 dark:text-slate-100 pb-[10px] pt-4 whitespace-nowrap" href="#">
            <p className="text-sm font-bold">All</p>
          </a>
          <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-slate-500 dark:text-slate-400 pb-[10px] pt-4 whitespace-nowrap" href="#">
            <p className="text-sm font-bold">Proposals</p>
          </a>
          <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-slate-500 dark:text-slate-400 pb-[10px] pt-4 whitespace-nowrap" href="#">
            <p className="text-sm font-bold">Projects</p>
          </a>
          <a className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-slate-500 dark:text-slate-400 pb-[10px] pt-4 whitespace-nowrap" href="#">
            <p className="text-sm font-bold">Payments</p>
          </a>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="size-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center ring-8 ring-slate-50/50 dark:ring-white/5">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">notifications_off</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold">No notifications yet</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
            We'll let you know when you receive new proposals, offers, or payments.
          </p>
        </div>
      </div>

      <div className="h-10"></div>
    </div>
  );
}