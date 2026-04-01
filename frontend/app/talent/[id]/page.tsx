"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, notFound } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function TalentProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { talent: talentList, isLoadingTalent: loading, fetchTalent } = useStore();
  const [showImageModal, setShowImageModal] = useState(false);

  const profile = talentList.find((f) => f._id === params.id || f.id === params.id);

  useEffect(() => {
    // Only fetch if we don't have talent yet
    if (talentList.length === 0) {
      fetchTalent();
    }
  }, [talentList.length, fetchTalent]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    if (!loading) {
      notFound();
    }
    return null;
  }


  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] dark:bg-[#0f172a] font-display">

      {/* Premium Hero Background / Mesh Gradient */}
      <div className="absolute top-0 left-0 w-full h-[240px] bg-[#6a6b4c] overflow-hidden">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[140%] bg-primary/30 blur-[100px] rounded-full animate-pulse"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">

        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all shadow-xl"
          >
            <span className="material-symbols-outlined text-xs group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
          </button>

          <div className="flex gap-2">
            <button className="flex size-9 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-xl">
              <span className="material-symbols-outlined text-lg">share</span>
            </button>
            <button className="flex size-9 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-xl">
              <span className="material-symbols-outlined text-lg">favorite</span>
            </button>
          </div>
        </div>

        {/* Global Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* LEFT COLUMN - Profile Info (70%) */}
          <div className="flex-1 w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Profile Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700"></div>

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left relative z-10">
                <div className="relative group/avatar cursor-pointer" onClick={() => setShowImageModal(true)}>
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover/avatar:bg-primary/40 transition-all"></div>
                  <div
                    className="relative bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 shrink-0 ring-4 ring-white dark:ring-slate-800 shadow-lg transition-transform group-hover/avatar:scale-[1.02] duration-500"
                    style={{ backgroundImage: `url("${profile.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6a6b4c&color=fff`}")` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-2xl drop-shadow-md">zoom_in</span>
                  </div>
                  <div className="absolute bottom-1 right-1 size-6 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center" title="Available Now">
                    <div className="size-1.5 bg-white rounded-full animate-ping"></div>
                  </div>
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">{profile.name}</h1>
                    <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border border-primary/20">
                      <span className="material-symbols-outlined text-xs font-bold">verified</span>
                      Pro
                    </span>
                  </div>

                  <p className="text-primary font-black text-lg lg:text-xl mt-1 tracking-tight uppercase leading-none">{profile.title || profile.role || 'Professional'}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-6 justify-center md:justify-start">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      <span className="text-xs font-bold">{profile.location || 'Global Remote'}</span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-slate-300 hidden md:block"></div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-yellow-500">
                        <span className="material-symbols-outlined text-base fill-icon">star</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{profile.rating || '4.9'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">({profile.reviews || '24'} Reviews)</span>
                    </div>
                  </div>

                  {/* Quick Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-8 max-w-sm mx-auto md:mx-0">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Success Rate</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">98%</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Response</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">&lt; 2h</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About & Bio Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-10 shadow-lg shadow-slate-200/20 dark:shadow-none border border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="size-8 rounded-lg bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-lg font-bold">person</span>
                </span>
                Bio
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base font-medium whitespace-pre-line">
                {profile.about || profile.description || 'Experienced professional specializing in high-impact solutions and creative execution. Committed to delivering excellence and innovative results for global clients.'}
              </p>
            </div>

            {/* Skills & Stack Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-10 shadow-lg shadow-slate-200/20 dark:shadow-none border border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="size-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-lg font-bold">bolt</span>
                </span>
                Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill: string) => (
                    <div key={skill} className="group flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/40 transition-all cursor-default">
                      <div className="size-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></div>
                      <span className="text-slate-700 dark:text-slate-200 font-black text-[11px] uppercase tracking-wide">{skill}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs italic">No skills specified.</p>
                )}
              </div>
            </div>

            {/* Portfolio Grid */}
            {profile.portfolio && profile.portfolio.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-10 shadow-lg shadow-slate-200/20 dark:shadow-none border border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                  <span className="size-8 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-lg font-bold">window</span>
                  </span>
                  Portfolio
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile.portfolio.map((item: any, i: number) => (
                    <div key={i} className="group cursor-pointer">
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4 shadow-md border border-slate-100 dark:border-slate-800">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                          <button className="bg-white text-slate-900 size-10 rounded-full flex items-center justify-center shadow-xl translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                            <span className="material-symbols-outlined text-base font-bold">open_in_new</span>
                          </button>
                        </div>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug">{item.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Sticky Action Card (30%) */}
          <div className="w-full lg:w-[340px] lg:sticky lg:top-24 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
            <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 text-white shadow-2xl shadow-primary/30 relative overflow-hidden group/sidebar">

              <div className="relative z-10">
                <div className="mb-8 text-center md:text-left">
                  <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Hourly Rate</p>
                  <div className="flex items-baseline gap-1.5 justify-center md:justify-start">
                    <span className="text-5xl font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent tracking-tighter">${profile.rate || '45'}</span>
                    <span className="text-white/60 font-black text-lg tracking-tight">/hr</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href={`/send-offer?id=${profile._id || profile.id}`}
                    className="w-full h-14 bg-primary hover:bg-[#5a5c41] text-white flex items-center justify-center rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-primary/30 active:scale-95 group/btn"
                  >
                    <span>Hire Now</span>
                    <span className="material-symbols-outlined text-base ml-1.5 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </Link>
                  <button
                    onClick={() => router.push(`/messages?userId=${profile._id || profile.id}`)}
                    className="w-full h-14 bg-white/10 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center rounded-2xl font-black text-lg transition-all active:scale-95"
                  >
                    Message
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                    <div className="size-10 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/20">
                      <span className="material-symbols-outlined font-bold text-lg">verified_user</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-green-400 leading-none mb-0.5">Verified</p>
                      <p className="text-[9px] text-white/30 font-bold">Identity Confirmed</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                    <div className="size-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/20">
                      <span className="material-symbols-outlined font-bold text-lg">payments</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-blue-400 leading-none mb-0.5">Secured</p>
                      <p className="text-[9px] text-white/30 font-bold">Payment Escrow</p>
                    </div>
                  </div>
                </div>

                {/* Social Presence */}
                <div className="mt-8 pt-8 border-t border-white/10">
                  <div className="flex justify-center gap-3">
                    {['public', 'code', 'language'].map((icon, i) => (
                      <button key={i} className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all duration-300">
                        <span className="material-symbols-outlined text-base">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setShowImageModal(false)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
            onClick={() => setShowImageModal(false)}
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>

          <div
            className="relative max-w-4xl w-full aspect-square md:aspect-auto md:max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={profile.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6a6b4c&color=fff&size=512`}
              alt={profile.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
            />
          </div>
        </div>
      )}
    </div>
  );
}
