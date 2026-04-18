"use client";

import React, { useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import BottomNavbar from "@/components/BottomNavbar";
import { API_URL, handleResponse } from "@/lib/api";
import Swal from "sweetalert2";

export default function BroadcastPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      return Swal.fire("Required", "Please provide both a title and a message.", "warning");
    }

    const result = await Swal.fire({
      title: 'Send Broadcast?',
      text: "This will send a notification to ALL users on the platform. This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6A6B4C',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Send to All!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl px-6 py-3 font-bold uppercase tracking-widest text-xs',
        cancelButton: 'rounded-xl px-6 py-3 font-bold uppercase tracking-widest text-xs'
      }
    });

    if (result.isConfirmed) {
      setIsSending(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/admin/broadcast`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ title, message })
        });

        const data = await handleResponse(res);
        if (data) {
          Swal.fire({
            title: "Broadcast Sent!",
            text: data.message,
            icon: "success",
            confirmButtonColor: "#6A6B4C",
            customClass: {
              popup: 'rounded-3xl',
              confirmButton: 'rounded-xl px-8 py-3 font-bold uppercase tracking-widest text-xs',
            }
          });
          setTitle("");
          setMessage("");
        }
      } catch (error: any) {
        Swal.fire("Error", error.message || "Failed to send broadcast", "error");
      } finally {
        setIsSending(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-display">
      <AdminHeader />

      <main className="flex-1 pb-32 max-w-4xl mx-auto w-full p-4 md:p-8">
        <div className="mb-10 text-center space-y-2">
          <div className="inline-flex items-center justify-center size-16 bg-primary/10 rounded-2xl mb-4">
            <span className="material-symbols-outlined text-primary text-4xl">campaign</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Broadcast Center</h1>
          <p className="text-slate-500 font-medium italic">// Reach all your users with a single notification</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative group">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none"></div>

          <form onSubmit={handleBroadcast} className="p-8 md:p-12 space-y-8 relative z-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Notification Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Platform Maintenance / Special Offer"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
              />
            </div>

            <div className="space-y-3">
               <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary">Detailed Message</label>
                  <span className="text-[10px] font-bold text-slate-400">{message.length} characters</span>
               </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your broadcast message here..."
                rows={6}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm resize-none"
              />
            </div>

            <div className="p-6 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 rounded-2xl flex gap-4">
              <span className="material-symbols-outlined text-orange-500">info</span>
              <p className="text-xs text-orange-700 dark:text-orange-400 font-medium leading-relaxed">
                <span className="font-black uppercase tracking-wider block mb-1">Important Note:</span>
                This message will be pushed to the notification center of every user. Be concise and professional to ensure a good user experience.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSending || !title.trim() || !message.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
            >
              {isSending ? (
                <>
                  <div className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Sending Blast...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">send</span>
                  Blast Notification to All
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 flex justify-center gap-8 text-slate-400 opacity-50 select-none grayscale">
           <span className="material-symbols-outlined text-4xl">rocket_launch</span>
           <span className="material-symbols-outlined text-4xl">sensors</span>
           <span className="material-symbols-outlined text-4xl">hub</span>
        </div>
      </main>

      <BottomNavbar />
    </div>
  );
}
