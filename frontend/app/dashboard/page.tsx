"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: "Alex Rivera",
    email: "alex.rivera@freecone.io",
    role: "Pro Member",
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
            avatar: parsedUser.avatar || prev.avatar 
          }));
        }
      } catch (err) {}
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-display">
      {/* Top Nav */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px]">hexagon</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Freecone</h1>
        </div>
        
        <div className="flex items-center gap-5">
          <button className="text-slate-500 hover:text-slate-800 transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white relative z-10 block"></span>
          </button>
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/profile')}>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{user.name}</p>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide mt-1">{user.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200">
              <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1240px] mx-auto p-6 md:p-8 space-y-10">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-slate-500">Total Earnings</p>
              <span className="material-symbols-outlined text-slate-400 text-xl">payments</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">$12,450.00</h2>
              <div className="flex items-center gap-1 mt-2 text-green-600 font-bold text-xs">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span>+12.5%</span>
              </div>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-slate-500">Total Spend</p>
              <span className="material-symbols-outlined text-slate-400 text-xl">shopping_cart</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">$4,820.00</h2>
              <div className="flex items-center gap-1 mt-2 text-slate-500 font-medium text-xs">
                <span className="material-symbols-outlined text-[14px]">history</span>
                <span>Last 30 days</span>
              </div>
            </div>
          </div>
          
          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-slate-500">Active Projects</p>
              <span className="material-symbols-outlined text-slate-400 text-xl">account_tree</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">8</h2>
              <div className="flex items-center gap-1 mt-2 text-slate-500 font-medium text-xs">
                <span>3 Freelancer • 5 Client</span>
              </div>
            </div>
          </div>
          
          {/* Card 4 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-slate-500">Success Rate</p>
              <span className="material-symbols-outlined text-slate-400 text-xl">verified</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">98%</h2>
              <div className="flex items-center gap-1 mt-2 text-slate-500 font-medium text-xs">
                <span className="material-symbols-outlined text-[14px]">star</span>
                <span>Top Rated Plus</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* My Projects */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900">My Projects</h3>
                <Link href="#" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                  View all projects
                </Link>
              </div>
              
              <div className="space-y-4">
                {/* Project 1 */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-slate-500">code</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-900">SaaS Platform UI Redesign</h4>
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">FREELANCER</span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-500">75%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Project 2 */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-slate-500">campaign</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-900">Q4 Marketing Strategy</h4>
                        <span className="bg-blue-50 text-blue-500 border border-blue-100 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">CLIENT</span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full relative" style={{ width: '30%' }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-500">30%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Project 3 */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-slate-500">smartphone</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-900">E-commerce Mobile App</h4>
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">FREELANCER</span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: '90%' }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-500">90%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-5">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button className="bg-primary hover:bg-[#5a5c41] transition-colors text-white rounded-xl p-6 shadow-md flex flex-col items-center justify-center gap-3 h-32">
                  <span className="material-symbols-outlined text-3xl">search</span>
                  <span className="font-bold text-sm">Find Work</span>
                </button>
                <button className="bg-white hover:border-primary transition-colors border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center gap-3 h-32 group">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-3xl">person_search</span>
                  <span className="font-bold text-sm text-slate-700">Find Talent</span>
                </button>
                <button className="bg-white hover:border-primary transition-colors border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center gap-3 h-32 group">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-3xl">add_box</span>
                  <span className="font-bold text-sm text-slate-700">Post a Job</span>
                </button>
              </div>
            </div>
            
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-5">Recent Activity</h3>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 relative">
                  {/* Timeline vertical line */}
                  <div className="absolute left-[35px] top-8 bottom-8 w-px bg-slate-100"></div>
                  
                  <div className="space-y-6">
                    {/* Activity 1 */}
                    <div className="flex gap-4 relative z-10">
                      <div className="w-3 h-3 bg-slate-400 rounded-full mt-1.5 shrink-0 border-[3px] border-white z-10 box-content"></div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">New Proposal Received</p>
                        <p className="text-xs text-slate-500 mt-1 mb-2">Jordan sent a proposal for "React Dev" job.</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2 Minutes Ago</p>
                      </div>
                    </div>
                    
                    {/* Activity 2 */}
                    <div className="flex gap-4 relative z-10">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mt-1.5 shrink-0 border-[3px] border-white z-10 box-content shadow-sm"></div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">Milestone Approved</p>
                        <p className="text-xs text-slate-500 mt-1 mb-2">The client approved Milestone #2 for UI Project.</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">1 Hour Ago</p>
                      </div>
                    </div>
                    
                    {/* Activity 3 */}
                    <div className="flex gap-4 relative z-10">
                      <div className="w-3 h-3 bg-slate-300 rounded-full mt-1.5 shrink-0 border-[3px] border-white z-10 box-content"></div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">Payment Processed</p>
                        <p className="text-xs text-slate-500 mt-1 mb-2">Payment of $1,200.00 has been added to your balance.</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Yesterday</p>
                      </div>
                    </div>
                    
                    {/* Activity 4 */}
                    <div className="flex gap-4 relative z-10">
                      <div className="w-3 h-3 bg-slate-300 rounded-full mt-1.5 shrink-0 border-[3px] border-white z-10 box-content"></div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">New Message</p>
                        <p className="text-xs text-slate-500 mt-1 mb-2 line-clamp-1">Sarah: "Hey Alex, just sent over the final assets for review."</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Yesterday</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-slate-100 p-4 text-center">
                  <Link href="#" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">
                    View All Activity
                  </Link>
                </div>
              </div>
            </div>

            {/* Dashboard Tip */}
            <div className="bg-[#f8faf4] border border-[#e8efe0] rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-[20px]">lightbulb</span>
                <p className="font-bold text-slate-900 text-sm">Dashboard Tip</p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Complete your profile to increase your visibility by 40%. Clients look for verified skills and portfolio items.
              </p>
              <Link href="/profile" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                Update Profile <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            
          </div>
        </div>
        
      </main>
    </div>
  );
}
