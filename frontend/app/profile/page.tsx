 "use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: "Alex Rivera",
    email: "alex.rivera@freelance.io",
    role: "Freelancer",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAw7LaAwy9WJD6uI8U4X_3RVWryi4jvIGjsYagfy8IZNO5Es8uZhvEduaVOTOWsB5aVT2mJ9J98FozQxGj0Y64Ma9EIUemAkwYi-YYJXFS52_n-C3Z7O05_bXXKC3zKv9iXcbxzifBSc8_ntSklLUtLJGEgeIe-Fpj-vZf15gjBDlAlHVK3_75iAFMOjAt7eP0EzPHb6P7FTBGshA4Whka7eAzIUFHAHv1iLzFeM_cuHcZm86PjaNk_eltrDgvFTOnc56GZdsqJq_Ut"
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        if (parsedUser.name) {
          setUser((prev) => ({
            ...prev,
            name: parsedUser.name,
            email: parsedUser.email,
            role: parsedUser.role || "Freelancer",
            avatar: parsedUser.avatar || prev.avatar 
          }));
        }
      } catch (err) {}
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {}
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full hidden lg:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined">hexagon</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary">Freecone</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{user.role}</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          <a onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-medium">Dashboard</span>
          </a>
          <a className="cursor-pointer flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-lg transition-colors border-l-4 border-primary">
            <span className="material-symbols-outlined text-primary">person</span>
            <span className="font-semibold">Profile</span>
          </a>
          <a className="cursor-pointer flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <span className="material-symbols-outlined">work</span>
            <span className="font-medium">Projects</span>
          </a>
          <a className="cursor-pointer flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <span className="material-symbols-outlined">chat</span>
            <span className="font-medium">Messages</span>
          </a>
          <a className="cursor-pointer flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <span className="material-symbols-outlined">payments</span>
            <span className="font-medium">Earnings</span>
          </a>
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Account Settings</div>
          <a className="cursor-pointer flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <span className="material-symbols-outlined">shield_person</span>
            <span className="font-medium">Security</span>
          </a>
          <a className="cursor-pointer flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            <span className="font-medium">Notifications</span>
          </a>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-semibold">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")} className="lg:hidden text-slate-500 hover:bg-slate-100 p-2 rounded-lg transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">Profile Management</h2>
              <p className="text-xs md:text-sm text-slate-500">Manage your professional identity and account preferences.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 self-end md:self-auto">
            <div className="relative group hidden md:block">
              <input className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all w-64" placeholder="Search settings..." type="text"/>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            </div>
            <button className="hidden sm:block bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-sm">Save Changes</button>
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-primary/20 shrink-0">
              <img className="w-full h-full object-cover" alt="User profile avatar" src={user.avatar}/>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
          
          {/* Profile & Account Info Section */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">account_circle</span>
              <h3 className="font-bold text-lg">Professional & Account Info</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                <input className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" type="text" defaultValue={user.name}/>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <input className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" type="email" defaultValue={user.email}/>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Professional Bio</label>
                <textarea className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" rows={4} defaultValue="Senior Full-stack Developer with 8+ years of experience in building scalable web applications. Specialist in React, Node.js, and Cloud Infrastructure."></textarea>
              </div>
            </div>
          </section>

          {/* Professional Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Skills Section */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">psychology</span>
                <h3 className="font-bold text-lg">Skills & Expertise</h3>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-primary text-white rounded-full text-sm font-medium flex items-center gap-1">React <span className="material-symbols-outlined text-xs cursor-pointer hover:text-red-200">close</span></span>
                  <span className="px-3 py-1 bg-primary text-white rounded-full text-sm font-medium flex items-center gap-1">Node.js <span className="material-symbols-outlined text-xs cursor-pointer hover:text-red-200">close</span></span>
                  <span className="px-3 py-1 bg-primary text-white rounded-full text-sm font-medium flex items-center gap-1">Tailwind CSS <span className="material-symbols-outlined text-xs cursor-pointer hover:text-red-200">close</span></span>
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium flex items-center gap-1 cursor-pointer hover:bg-primary hover:text-white transition-colors">TypeScript <span className="material-symbols-outlined text-xs">add</span></span>
                </div>
                <input className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Add a skill..." type="text"/>
              </div>
            </div>

            {/* Hourly Rate Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">monetization_on</span>
                <h3 className="font-bold text-lg">Hourly Rate</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input className="w-full pl-8 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" type="number" defaultValue="85"/>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">/ hour</span>
                </div>
                <p className="text-xs text-slate-400">Total includes service fees. Your take-home will be $76.50/hr.</p>
              </div>
            </div>
          </div>

          {/* Portfolio Highlights */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">folder_special</span>
                <h3 className="font-bold text-lg">Portfolio Highlights</h3>
              </div>
              <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                <span className="material-symbols-outlined text-sm">add</span> Add New Project
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video">
                <img className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Developer workspace with code on screen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNEcEPa95DNP_SuikchLwZBpkUQKzD-EPiSxoLhDeBxY053xkLKiygUfc4sFJsSiUsv8d5OoqmBQ5l_vrxf96ZnTOXuRIQNs2yGmynxxDAiCfA5IzEVC--QXdbRc9Li3IrR5fXPRaYrux3dy_7syuGkMXiW5wUj-0q50eZaBJSAv1TAChTrjEKRvZ3Uz5aCUF7TjWknTg3IqXQFp1raqNToMunVpnO1GgIu9E4qDNFGcVsLbw6twDBNl8Z9UEX4U0kis2vYFJMVbST"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                  <p className="text-white font-bold text-sm">Fintech Dashboard</p>
                  <p className="text-white/60 text-xs">React, D3.js, Firebase</p>
                </div>
              </div>
              <div className="group relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video">
                <img className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Abstract data visualization mockup" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPqm6gvxV1yaXjMTJLMkL1SVgw_3k-hAFrS5wHRjbNVeec1oPwtLl99s68m7lx3cjdzuZGKqGi3Jj_7Rbz8euD3rfaOCjFJ53nUGEPjLmear7v5GUjxpealNgC__2xlkm60be_YYqF5sh4LRPCEBUSeWuY2UzV_LkLb5qc1xG-Y7IKqgGPxTRfbIOUmgpzWqIl2MDkBLtJe0T4kC6L4TDgQ7LFeC6z6zCrAnNSy95pIqWSK39lYG1pIZcVRG0bKPkre6B5SPqH8RPd"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                  <p className="text-white font-bold text-sm">Analytics Engine</p>
                  <p className="text-white/60 text-xs">Python, AWS, React</p>
                </div>
              </div>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center p-6 text-slate-400 hover:text-primary hover:border-primary transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                <span className="material-symbols-outlined text-3xl mb-2">upload</span>
                <span className="text-sm font-semibold">Upload New Work</span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Security & Privacy */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">security</span>
                <h3 className="font-bold text-lg">Security & Privacy</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="font-bold text-sm">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                  </div>
                  <button className="px-4 py-1.5 bg-primary text-white hover:bg-primary/90 rounded text-xs font-bold transition-colors">Enable</button>
                </div>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
                    Change Password <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-800"></div>
                  <button className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
                    Manage Privacy Settings <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Notifications */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">notifications_active</span>
                <h3 className="font-bold text-lg">Notifications</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">Email Notifications</p>
                    <p className="text-xs text-slate-500">Receive project updates via email.</p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked className="sr-only peer" type="checkbox"/>
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </div>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">Push Notifications</p>
                    <p className="text-xs text-slate-500">Alerts on your browser or mobile device.</p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input className="sr-only peer" type="checkbox"/>
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Payment Methods */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">credit_card</span>
              <h3 className="font-bold text-lg">Payment Methods</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-primary bg-primary/5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center text-white text-[10px] font-bold">VISA</div>
                    <div>
                      <p className="text-sm font-bold">Visa ending in 4242</p>
                      <p className="text-xs text-slate-500">Expires 12/26 • Primary</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                </div>
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between group hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-[10px] font-bold italic">PayPal</div>
                    <div>
                      <p className="text-sm font-bold">alex.rivera@pay.com</p>
                      <p className="text-xs text-slate-500">Connected on Oct 2023</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">more_vert</span>
                </div>
                <button className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 font-bold text-sm flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all">
                  <span className="material-symbols-outlined">add</span> Add Payment Method
                </button>
              </div>
            </div>
          </section>

          {/* Footer Action */}
          <div className="flex justify-end gap-4 pb-12">
            <button className="px-8 py-3 rounded-lg font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Discard Changes</button>
            <button className="bg-primary hover:bg-primary/90 text-white px-12 py-3 rounded-lg font-bold transition-all shadow-lg shadow-primary/20">Save Profile</button>
          </div>
          
        </div>
      </main>
    </div>
  );
}
