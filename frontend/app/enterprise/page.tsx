"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { staggerChildren: 0.1 }
};

export default function EnterprisePage() {
  return (
    <div className="bg-background text-on-surface min-h-screen overflow-x-hidden">
      <Navbar />
      <main className="w-full">
        {/* Hero Section */}
        <section className="relative px-4 py-20 md:py-32 overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 -z-10 opacity-10 bg-primary/10"></div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] tracking-[0.2em] uppercase"
            >
              FreeCone For Enterprise
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl md:text-7xl font-black tracking-tight text-on-surface leading-[1.1]"
            >
              Scale Your High-Impact <br />
              <span className="text-primary italic">Talent Infrastructure</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto font-medium leading-relaxed"
            >
              The world's most secure and scalable ecosystem for elite businesses to collaborate with the top 3% of global independent specialists.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4"
            >
              <Link href="#solutions">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "var(--color-surface-container)", y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="bg-surface text-on-surface border border-outline-variant px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-colors shadow-xl"
                >
                  View Solutions
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Bento-esque Visual Elements */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-24 grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-6xl mx-auto px-4"
          >
            <motion.div
              variants={fadeInUp}
              className="md:col-span-8 h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20"
            >
              <img
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                alt="Modern high-end minimalist office"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyNJKHdxxTqa-Yp5SzNFGNW49qsS3NTLmZ7wWgo2w2qy8OaKfIdMlr9UmEda80t0QTQwXmDbkCH3UFA9XkZtx5Df8ZlLOdru4PCAxbaTLCB0cDtK8ldQCwzOc2BaBnCKPjCDBkPBVeJHGdezwBh7pUd0dr80sGrT4caTpnQYz2X8pB9tyNbLhhcYX1KxOc6usADbmX9QWUdrKHBNGtnom0gfvDl6nZQcdoBvsy6b_7loVvuctL48sKlE_2CzqWgDQLl9cAD-2EmRGH"
              />
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="md:col-span-4 h-[400px] rounded-[2.5rem] bg-primary flex flex-col justify-end p-10 text-on-primary text-left relative overflow-hidden group"
            >
              <motion.div
                animate={{
                  rotate: [0, 5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 right-0 p-8 opacity-10"
              >
                <span className="material-symbols-outlined text-[160px]">public</span>
              </motion.div>
              <div className="relative z-10">
                <span className="material-symbols-outlined text-5xl mb-6 block" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
                <h3 className="text-3xl font-black tracking-tight mb-2">120+ Countries</h3>
                <p className="opacity-80 font-medium leading-relaxed">Fully compliant, borderless payment infrastructure for multi-national teams.</p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Value Proposition Grid */}
        <section id="solutions" className="py-32 bg-surface-dim relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48"></div>

          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">The Enterprise Edge</span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Built for Scale, <br />Designed for Speed.</h2>
              </div>

              <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
                className="space-y-4"
              >
                {[
                  { icon: "verified_user", title: "Institutional-Grade Compliance", desc: "Automated tax compliance, MSA management, and IP protection tailored to your corporate standards." },
                  { icon: "workspace_premium", title: "Dedicated Vetting Console", desc: "Access the top 1% of talent with custom assessment pipelines integrated directly into your HRIS." },
                  { icon: "account_balance", title: "Custom Billing & Reporting", desc: "Unified invoicing across departments with granular budget tracking and real-time ROI dashboards." }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeInUp}
                    className="flex gap-6 p-6 rounded-3xl hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 group cursor-default"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-2">{item.title}</h4>
                      <p className="text-on-surface-variant leading-relaxed text-sm">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl skew-y-1 hover:skew-y-0 transition-transform duration-1000">
                <img
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                  alt="Team collaboration"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4SyxjKKIDF_kcm715JZAuWugh9OUQCEnQE88MzCygKqBnjPLHw_4w2czBC2-VGJ22SIqD_oIZeOsPJArZIj-wN0zPr6Qn2rmgf1ILHMQzd6-BOYYvo708IJwB8iiKcsSkjIgn8xf8mCZxST54pUQB5ZHbV0ENbF2YB0lzZ2XTqIevgbJ5S13engVMXm_jR8U1eretylWI6jiZRiRatzjFnT8beRvBxYmJzqHeennT7yMthXEQpGlemqMXYNr7wrtOUY23HeyUgD1z"
                />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute -bottom-10 -left-10 bg-surface p-10 rounded-[2rem] shadow-2xl border border-outline-variant max-w-xs"
              >
                <p className="italic text-on-surface-variant font-medium text-lg leading-relaxed">"Freecone transformed how we scale our engineering team across three continents with absolute security."</p>
                <div className="mt-6 flex items-center gap-4 border-t border-outline-variant pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden ring-4 ring-primary/5">
                    <img src="https://ui-avatars.com/api/?name=Marcus+Chen&background=6A6B4C&color=fff" alt="Marcus Chen" />
                  </div>
                  <div>
                    <p className="text-sm font-black">Marcus Chen</p>
                    <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-black">CTO, NexaCorp</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-surface relative">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {[
                { val: "99.9%", label: "Escrow Success" },
                { val: "$2B+", label: "Volume Managed" },
                { val: "150k", label: "Vetted Specialists" },
                { val: "4.9/5", label: "Partner Rating" }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  className="text-center space-y-2 group"
                >
                  <motion.h4
                    whileHover={{ scale: 1.1, color: "var(--color-primary)" }}
                    className="text-5xl font-black text-primary/80 transition-colors"
                  >
                    {stat.val}
                  </motion.h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-32 bg-primary text-on-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-24 max-w-3xl mx-auto space-y-6"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Enterprise Infrastructure</h2>
              <p className="text-primary-fixed-dim text-lg font-medium">The most advanced tools for modern talent management.</p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-16 text-center"
            >
              {[
                { icon: "visibility", title: "Total Visibility", desc: "Real-time tracking of every milestone, payment, and deliverable across your entire organization." },
                { icon: "security", title: "Zero-Trust Security", desc: "End-to-end encryption for all contracts and deliverables, with biometrically verified access." },
                { icon: "bolt", title: "Instant Liquidity", desc: "Accelerated payment cycles and instant escrow release for strategic partners." }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  className="space-y-6 group"
                >
                  <motion.div
                    whileHover={{ rotate: 0, scale: 1.1 }}
                    className={`mx-auto w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center transition-all duration-300 ${idx === 1 ? "-rotate-3" : idx === 2 ? "rotate-6" : "rotate-3"}`}
                  >
                    <span className="material-symbols-outlined text-5xl">{feature.icon}</span>
                  </motion.div>
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p className="text-primary-fixed-dim leading-relaxed font-medium">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 bg-surface">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-6xl mx-auto rounded-[4rem] bg-surface-container-high overflow-hidden relative p-16 md:p-32 text-center border border-white shadow-2xl"
          >
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>

            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-8 block"
            >
              Ready to Build the Future?
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-4xl md:text-6xl font-black tracking-tight mb-10 leading-tight"
            >
              Elevate Your Team's <br />Potential Today.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="flex justify-center"
            >
              <motion.a
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                href="mailto:ashfakkp232@gmail.com"
                className="bg-primary text-on-primary px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/40 flex items-center justify-center gap-2"
              >
                Contact Strategy Team
              </motion.a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1 }}
              className="mt-12 text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">lock</span> ISO 27001 & SOC2 COMPLIANT
            </motion.p>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-16 px-8 md:px-16 bg-surface-dim border-t border-primary/5 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6">
            <span className="text-3xl font-black text-primary tracking-tighter">FreeCone</span>
            <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
              Redefining elite professional collaboration through secure infrastructure and global talent transparency.
            </p>
            <div className="flex gap-4">
              {['public', 'hub', 'partner_exchange'].map(icon => (
                <motion.div
                  key={icon}
                  whileHover={{ y: -5, scale: 1.1 }}
                  className="size-10 rounded-xl bg-white border border-outline-variant flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg">{icon}</span>
                </motion.div>
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
