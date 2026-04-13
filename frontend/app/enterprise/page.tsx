"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function EnterprisePage() {
  return (
    <div className="bg-background text-on-surface min-h-screen">
      <Navbar />
      <main className="w-full">
        {/* Hero Section */}
        <section className="relative px-4 py-20 md:py-32 overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 -z-10 opacity-10 bg-primary/10"></div>
          <div className="max-w-4xl mx-auto space-y-6">
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] tracking-[0.2em] uppercase">
              FreeCone For Enterprise
            </span>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight text-on-surface leading-[1.1]">
              Scale Your High-Impact <br />
              <span className="text-primary italic">Talent Infrastructure</span>.
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto font-medium leading-relaxed">
              The world's most secure and scalable ecosystem for elite businesses to collaborate with the top 3% of global independent specialists.
            </p>
            <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4">
              <button className="bg-primary text-on-primary px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-transform flex items-center gap-2 group">
                Talk to Sales <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <button className="bg-surface text-on-surface border border-outline-variant px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-surface-container transition-colors">
                View Solutions
              </button>
            </div>
          </div>

          {/* Bento-esque Visual Elements */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-6xl mx-auto px-4">
            <div className="md:col-span-8 h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20">
              <img 
                className="w-full h-full object-cover" 
                alt="Modern high-end minimalist office space with large windows, olive green plants, and professional wood furniture, soft morning light" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyNJKHdxxTqa-Yp5SzNFGNW49qsS3NTLmZ7wWgo2w2qy8OaKfIdMlr9UmEda80t0QTQwXmDbkCH3UFA9XkZtx5Df8ZlLOdru4PCAxbaTLCB0cDtK8ldQCwzOc2BaBnCKPjCDBkPBVeJHGdezwBh7pUd0dr80sGrT4caTpnQYz2X8pB9tyNbLhhcYX1KxOc6usADbmX9QWUdrKHBNGtnom0gfvDl6nZQcdoBvsy6b_7loVvuctL48sKlE_2CzqWgDQLl9cAD-2EmRGH" 
              />
            </div>
            <div className="md:col-span-4 h-[400px] rounded-[2.5rem] bg-primary flex flex-col justify-end p-10 text-on-primary text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                <span className="material-symbols-outlined text-[160px]">public</span>
              </div>
              <div className="relative z-10">
                <span className="material-symbols-outlined text-5xl mb-6 block" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
                <h3 className="text-3xl font-black tracking-tight mb-2">120+ Countries</h3>
                <p className="opacity-80 font-medium leading-relaxed">Fully compliant, borderless payment infrastructure for multi-national teams.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Grid */}
        <section className="py-32 bg-surface-dim relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">The Enterprise Edge</span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Built for Scale, <br />Designed for Speed.</h2>
              </div>
              
              <div className="space-y-8">
                <div className="flex gap-6 p-6 rounded-3xl hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">verified_user</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">Institutional-Grade Compliance</h4>
                    <p className="text-on-surface-variant leading-relaxed">Automated tax compliance, MSA management, and IP protection tailored to your corporate standards.</p>
                  </div>
                </div>

                <div className="flex gap-6 p-6 rounded-3xl hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 group shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">Dedicated Vetting Console</h4>
                    <p className="text-on-surface-variant leading-relaxed">Access the top 1% of talent with custom assessment pipelines integrated directly into your HRIS.</p>
                  </div>
                </div>

                <div className="flex gap-6 p-6 rounded-3xl hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">account_balance</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">Custom Billing & Reporting</h4>
                    <p className="text-on-surface-variant leading-relaxed">Unified invoicing across departments with granular budget tracking and real-time ROI dashboards.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl skew-y-1">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Diverse team of creative professionals collaborating around a large table in a sunlit loft office space, organic workspace feel" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4SyxjKKIDF_kcm715JZAuWugh9OUQCEnQE88MzCygKqBnjPLHw_4w2czBC2-VGJ22SIqD_oIZeOsPJArZIj-wN0zPr6Qn2rmgf1ILHMQzd6-BOYYvo708IJwB8iiKcsSkjIgn8xf8mCZxST54pUQB5ZHbV0ENbF2YB0lzZ2XTqIevgbJ5S13engVMXm_jR8U1eretylWI6jiZRiRatzjFnT8beRvBxYmJzqHeennT7yMthXEQpGlemqMXYNr7wrtOUY23HeyUgD1z" 
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-surface p-10 rounded-[2rem] shadow-2xl border border-outline-variant max-w-xs animate-float">
                <p className="italic text-on-surface-variant font-medium text-lg leading-relaxed">"Freecone transformed how we scale our engineering team across three continents with absolute security."</p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden ring-4 ring-primary/5">
                    <img src="https://ui-avatars.com/api/?name=Marcus+Chen&background=6A6B4C&color=fff" alt="Marcus Chen" />
                  </div>
                  <div>
                    <p className="text-sm font-black">Marcus Chen</p>
                    <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-black">CTO, NexaCorp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center space-y-2">
                <h4 className="text-5xl font-black text-primary">99.9%</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Escrow Success</p>
              </div>
              <div className="text-center space-y-2">
                <h4 className="text-5xl font-black text-primary">$2B+</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Volume Managed</p>
              </div>
              <div className="text-center space-y-2">
                <h4 className="text-5xl font-black text-primary">150k</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vetted Specialists</p>
              </div>
              <div className="text-center space-y-2">
                <h4 className="text-5xl font-black text-primary">4.9/5</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Partner Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-32 bg-primary text-on-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-24 max-w-3xl mx-auto space-y-6">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Enterprise Infrastructure</h2>
              <p className="text-primary-fixed-dim text-lg font-medium">The most advanced tools for modern talent management.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-16 text-center">
              <div className="space-y-6">
                <div className="mx-auto w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-300">
                  <span className="material-symbols-outlined text-5xl">visibility</span>
                </div>
                <h3 className="text-2xl font-bold">Total Visibility</h3>
                <p className="text-primary-fixed-dim leading-relaxed font-medium">Real-time tracking of every milestone, payment, and deliverable across your entire organization.</p>
              </div>
              <div className="space-y-6">
                <div className="mx-auto w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <span className="material-symbols-outlined text-5xl">security</span>
                </div>
                <h3 className="text-2xl font-bold">Zero-Trust Security</h3>
                <p className="text-primary-fixed-dim leading-relaxed font-medium">End-to-end encryption for all contracts and deliverables, with biometrically verified access.</p>
              </div>
              <div className="space-y-6">
                <div className="mx-auto w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center rotate-6 hover:rotate-0 transition-transform duration-300">
                  <span className="material-symbols-outlined text-5xl">bolt</span>
                </div>
                <h3 className="text-2xl font-bold">Instant Liquidity</h3>
                <p className="text-primary-fixed-dim leading-relaxed font-medium">Accelerated payment cycles and instant escrow release for strategic partners.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 bg-surface">
          <div className="max-w-6xl mx-auto rounded-[4rem] bg-surface-container-high overflow-hidden relative p-16 md:p-32 text-center border border-white shadow-2xl">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
            <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-8 block">Ready to Build the Future?</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-10 leading-tight">Elevate Your Team's <br />Potential Today.</h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="bg-primary text-on-primary px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/40 hover:scale-105 transition-transform">
                Contact Strategy Team
              </button>
              <button className="bg-white border border-outline px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-surface-dim transition-all">
                Request a Demo
              </button>
            </div>
            <p className="mt-12 text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">lock</span> ISO 27001 & SOC2 COMPLIANT
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-16 px-8 md:px-16 bg-surface-dim border-t border-primary/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6">
            <span className="text-3xl font-black text-primary tracking-tighter">FreeCone</span>
            <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
              Redefining elite professional collaboration through secure infrastructure and global talent transparency.
            </p>
            <div className="flex gap-4">
              {['public', 'hub', 'partner_exchange'].map(icon => (
                <div key={icon} className="size-10 rounded-xl bg-white border border-outline-variant flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-lg">{icon}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            <div className="space-y-6">
              <h5 className="font-black text-xs uppercase tracking-widest text-slate-900">Platform</h5>
              <div className="flex flex-col gap-4">
                {['Mission', 'Marketplace', 'Compliance', 'Security'].map(item => (
                  <Link key={item} href="#" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">{item}</Link>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h5 className="font-black text-xs uppercase tracking-widest text-slate-900">Company</h5>
              <div className="flex flex-col gap-4">
                {['Our Team', 'Careers', 'Contact', 'Blog'].map(item => (
                  <Link key={item} href="#" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">{item}</Link>
                ))}
              </div>
            </div>
            <div className="space-y-6 col-span-2 md:col-span-1 border-t md:border-t-0 pt-8 md:pt-0 border-slate-200">
              <h5 className="font-black text-xs uppercase tracking-widest text-slate-900">Legal</h5>
              <div className="flex flex-col gap-4">
                {['Terms', 'Privacy', 'Compliance', 'Ethics'].map(item => (
                  <Link key={item} href="#" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">{item}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">© 2024 FreeCone Enterprises. High-Security Talent Ecosystem.</p>
          <div className="flex gap-6">
            <Link href="/" className="text-[11px] font-black text-primary uppercase tracking-[0.2em] hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">arrow_back</span> Back to Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
