"use client";

import React, { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { useStore } from "@/lib/store";
import Swal from "sweetalert2";
import { API_URL, handleResponse } from "@/lib/api";
import ChangePasswordModal from "@/components/ChangePasswordModal";

type SecurityActionType = "success" | "info" | "warning" | "error" | "question";

export default function SecurityPage() {
  const { user } = useStore();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);


  // Simulated handlers for UI interaction
  const handleAction = (
    title: string,
    message: string,
    type: SecurityActionType = "info"
  ) => {
    Swal.fire({
      title,
      text: message,
      icon: type,
      confirmButtonColor: "#6A6B4C",
    });
  };

  const handleChangePassword = () => {
    setIsPasswordModalOpen(true);
  };


  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950">
      <DashboardHeader 
        user={user} 
        title="Security Settings" 
        subtitle="Manage your account security and authentication preferences"
        showBack={false}
      />

      <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-12 pt-28 md:pt-24">
        {/* Security Status Card */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between overflow-hidden relative group transition-all hover:shadow-md">
          <div className="relative z-10">
            <p className="text-slate-500 text-sm font-semibold mb-2 uppercase tracking-wider">Overall Account Health</p>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Highly Secure</h2>
              <span className="material-symbols-outlined text-emerald-500 text-4xl leading-none">verified</span>
            </div>
            <p className="text-sm text-slate-400 mt-3 font-medium flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">schedule</span>
              Last verified: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="hidden md:block absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity rotate-12">
            <span className="material-symbols-outlined text-[180px]">shield_person</span>
          </div>
          {/* Quick Report Button */}
          <button 
            onClick={async () => {
              const { value: formValues } = await Swal.fire({
                title: 'Report a Security Complaint',
                html:
                  '<input id="swal-input1" class="swal2-input" placeholder="Subject (e.g. Suspicious Login)">' +
                  '<textarea id="swal-input2" class="swal2-textarea" placeholder="Detail your concern..."></textarea>',
                focusConfirm: false,
                confirmButtonColor: '#6A6B4C',
                showCancelButton: true,
                preConfirm: () => {
                  return {
                    subject: (document.getElementById('swal-input1') as HTMLInputElement).value,
                    message: (document.getElementById('swal-input2') as HTMLTextAreaElement).value
                  }
                }
              });

              if (formValues) {
                if (!formValues.subject || !formValues.message) {
                  return handleAction("Error", "All fields are required.", "error");
                }
                const token = localStorage.getItem("accessToken");
                try {
                  const res = await fetch(`${API_URL}/report`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(formValues)
                  });
                  const data = await handleResponse(res);
                  if (data) {
                    handleAction("Report Submitted", "Admin has been notified. We will review your case shortly.", "success");
                  }
                } catch (err) {
                  handleAction("Error", "Failed to send report. Try again later.", "error");
                }
              }
            }}
            className="absolute top-4 right-4 z-20 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all group flex items-center gap-1.5"
            title="Report to Admin"
          >
            <span className="material-symbols-outlined text-lg">report_gmailerrorred</span>
            <span className="text-[10px] font-black uppercase tracking-wider">Report</span>
          </button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Password Management */}
            <section className="space-y-4">
              <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] px-1">Authentication</h3>
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between group transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">lock_reset</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Account Password</p>
                    <p className="text-xs text-slate-500 font-medium">Reset or change your current password</p>
                  </div>
                </div>
                <button 
                  onClick={handleChangePassword}
                  className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg transition-colors hover:bg-primary hover:text-white"
                >
                  Change Password
                </button>
              </div>
            </section>

            {/* Device Management */}
            <section className="space-y-4">
              <div className="flex justify-between items-end px-1">
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Active Sessions</h3>
              </div>
              <div className="space-y-3">
                {user?.loginHistory?.slice(0, 3).map((device: any, i: number) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-2xl">{device.device.toLowerCase().includes('phone') ? 'smartphone' : 'laptop'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 dark:text-white">{device.device}</p>
                          {i === 0 && (
                            <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Current</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{device.location} • {new Date(device.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {!user?.loginHistory?.length && (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                    <p className="text-sm font-medium">No login sessions found yet.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            {/* Login History */}
            <section className="space-y-4">
              <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] px-1">Audit Log</h3>
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-primary shadow-sm">
                    <span className="material-symbols-outlined">history</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Login Events</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
                  {user?.loginHistory?.map((log: any, i: number) => (
                    <div key={i} className={`p-4 flex justify-between items-center ${log.status === 'Blocked' ? 'bg-red-50/30 dark:bg-red-500/5' : ''}`}>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{log.device}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{log.location}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 block">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider ${log.status === 'Blocked' ? 'text-red-500' : 'text-emerald-500'}`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {!user?.loginHistory?.length && (
                    <p className="p-8 text-center text-xs text-slate-400">Starting to track your logins now...</p>
                  )}
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
}
