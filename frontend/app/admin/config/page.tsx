"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminHeader from "@/components/AdminHeader";
import BottomNavbar from "@/components/BottomNavbar";
import { API_URL, handleResponse } from "@/lib/api";

export default function AdminConfigPage() {
  const [commission, setCommission] = useState<number>(0);
  const [securityLevel, setSecurityLevel] = useState("enhanced");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/admin/system-settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await handleResponse(res);
        if (data) {
          setCommission(data.platformCommission);
          setMaintenanceMode(data.maintenanceMode);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/admin/system-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          platformCommission: commission,
          maintenanceMode: maintenanceMode
        })
      });
      const data = await handleResponse(res);
      if (data) {
        alert("Settings updated successfully!");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <AdminHeader />

      <main className="flex-1 pb-32 max-w-5xl mx-auto w-full">
        {/* Hero / Branding Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pt-8 pb-4"
        >
          <h2 className="text-primary text-xs font-black uppercase tracking-[0.2em]">FreeCone Admin Control</h2>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">System Configuration</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage global platform parameters and security protocols.</p>
        </motion.div>

        {/* Financial & Security Section */}
        <section className="mt-8">
          <h3 className="text-slate-900 dark:text-slate-100 text-xl font-extrabold px-4 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">security</span>
            Financial & Security
          </h3>
          <div className="px-4 space-y-6">
            {/* Platform Commission */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest ml-1">Platform Commission (%)</label>
              <div className="relative group">
                <input
                  className="w-full rounded-2xl border-primary/10 bg-white dark:bg-slate-800 dark:border-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10 h-16 px-6 text-lg font-bold transition-all outline-none"
                  placeholder="10.0"
                  type="number"
                  value={isNaN(commission) ? "" : commission}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setCommission(isNaN(val) ? 0 : val);
                  }}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl opacity-50 group-focus-within:opacity-100 transition-opacity">%</span>
              </div>
            </div>

            {/* Security Level */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest ml-1">Security Level</label>
              <div className="relative">
                <select
                  value={securityLevel}
                  onChange={(e) => setSecurityLevel(e.target.value)}
                  className="w-full appearance-none rounded-2xl border-primary/10 bg-white dark:bg-slate-800 dark:border-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10 h-16 px-6 text-lg font-bold transition-all outline-none"
                >
                  <option value="standard">Standard Protection</option>
                  <option value="enhanced">Enhanced (Recommended)</option>
                  <option value="strict">Strict Lockdown</option>
                </select>
                <span className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                  <span className="material-symbols-outlined text-2xl font-bold">expand_more</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Operational Toggles Section */}
        <section className="mt-12">
          <h3 className="text-slate-900 dark:text-slate-100 text-xl font-extrabold px-4 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">settings_applications</span>
            Operations
          </h3>
          <div className="px-4 space-y-4">
            {/* Maintenance Mode Toggle */}
            <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-2xl border border-primary/5 shadow-sm hover:border-primary/20 transition-all group">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">construction</span>
                </div>
                <div>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200">Maintenance Mode</p>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Redirect users to landing page</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  const newState = !maintenanceMode;
                  if (newState) {
                    const confirm = window.confirm("Are you sure you want to enable Maintenance Mode? This will block access for all regular users.");
                    if (!confirm) return;
                  }
                  
                  // Optimistic update
                  setMaintenanceMode(newState);
                  
                  // Immediate save for maintenance mode
                  try {
                    const token = localStorage.getItem("accessToken");
                    const res = await fetch(`${API_URL}/admin/system-settings`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                      },
                      body: JSON.stringify({ maintenanceMode: newState })
                    });
                    await handleResponse(res);
                  } catch (err) {
                    console.error("Failed to toggle maintenance mode:", err);
                    setMaintenanceMode(!newState); // revert
                  }
                }}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${maintenanceMode ? "bg-red-500" : "bg-slate-200 dark:bg-slate-700"}`}
              >
                <motion.span
                  animate={{ x: maintenanceMode ? 24 : 4 }}
                  className="inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform"
                />
              </button>
            </div>
          </div>
        </section>

        {/* Quick Stats/Info Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="mx-4 mt-12 p-8 rounded-3xl bg-gradient-to-br from-[#6A6B4C] to-[#454632] text-white shadow-2xl shadow-primary/20 relative overflow-hidden group"
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-3xl opacity-80">cloud_done</span>
            <h4 className="font-black uppercase tracking-[0.2em] text-xs">System Health</h4>
          </div>
          <div className="grid grid-cols-2 gap-8 relative z-10">
            <div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xl font-extrabold tracking-tight">Fully Operational</p>
              </div>
            </div>
            <div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Uptime</p>
              <p className="text-xl font-extrabold tracking-tight">99.98% <span className="text-[10px] font-bold opacity-60 ml-1">LTM</span></p>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <div className="px-4 mt-10">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="material-symbols-outlined animate-spin">refresh</span>
            ) : (
              <span className="material-symbols-outlined">save</span>
            )}
            {isSaving ? "Saving..." : "Save System Config"}
          </motion.button>
        </div>
      </main>

      <BottomNavbar />
    </div>
  );
}
