"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import DashboardHeader from "@/components/DashboardHeader";
import { socketService } from "@/lib/socket";

export default function DashboardPage() {
  const router = useRouter();
  const { 
    user, 
    fetchOffers, 
    fetchMyJobs,
    fetchMyProposals,
    fetchReceivedProposals,
    isLoadingOffers,
    isLoadingMyData,
    offers,
    receivedProposals,
    myProposals,
    myJobs
  } = useStore();

  useEffect(() => {
    fetchOffers();
    fetchMyJobs();
    fetchMyProposals();
    fetchReceivedProposals();

    // Socket.io Real-time Listeners
    const socket = socketService.getSocket();
    if (socket) {
      const handleUpdate = () => {
        fetchOffers();
        fetchMyJobs();
        fetchMyProposals();
        fetchReceivedProposals();
      };

      socket.on("newNotification", handleUpdate);
      socket.on("notificationUpdate", handleUpdate);
      socket.on("offerUpdate", handleUpdate);
      socket.on("proposalUpdate", handleUpdate);

      return () => {
        socket.off("newNotification", handleUpdate);
        socket.off("notificationUpdate", handleUpdate);
        socket.off("offerUpdate", handleUpdate);
        socket.off("proposalUpdate", handleUpdate);
      };
    }
  }, [fetchOffers, fetchMyJobs, fetchMyProposals, fetchReceivedProposals]);

  // Format activity message
  const getActivityMessage = (activity: any) => {
    if (activity.type === 'proposal') {
      const isClient = user?.id === activity.job?.user || user?._id === activity.job?.user;
      if (isClient) {
        return `Received proposal from ${activity.talent?.name || 'Talent'} for ${activity.job?.title}`;
      } else {
        return `Sent proposal for ${activity.job?.title}`;
      }
    }

    const isClient = user?.id === activity.client?._id || user?.id === activity.client?.id;
    const otherUser = isClient ? activity.freelancer : activity.client;
    const name = otherUser?.name || "Someone";
    
    if (isClient) {
      return `Sent offer to ${name} for ${activity.jobTitle}`;
    } else {
      return `Received offer from ${name} for ${activity.jobTitle}`;
    }
  };

  const isClientRole = user?.role === "client";
  const activeProjectsCount = isClientRole ? myJobs.length : myProposals.filter(p => p.status === 'accepted').length;
  const pendingProposalsCount = isClientRole ? receivedProposals.length : myProposals.filter(p => p.status === 'pending').length;

  return (
    <div className="flex-1 overflow-y-auto">
      <DashboardHeader
        user={user}
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name}!`}
      >
        <button 
          onClick={() => router.push("/notifications")}
          className="text-slate-500 hover:text-slate-800 transition-colors relative"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </DashboardHeader>

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
              <h2 className="text-2xl font-bold text-slate-900">$0.00</h2>
              <div className="flex items-center gap-1 mt-2 text-slate-400 font-medium text-xs">
                <span>No earnings yet</span>
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
              <h2 className="text-2xl font-bold text-slate-900">$0.00</h2>
              <div className="flex items-center gap-1 mt-2 text-slate-400 font-medium text-xs">
                <span>No spending yet</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-slate-500">
                {isClientRole ? "Active Projects" : "Submitted Proposals"}
              </p>
              <span className="material-symbols-outlined text-slate-400 text-xl">account_tree</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {isClientRole ? myJobs.length : myProposals.length}
              </h2>
              <div className="flex items-center gap-1 mt-2 text-slate-400 font-medium text-xs">
                <span>{isClientRole ? `${myJobs.length} jobs posted` : `${myProposals.length} proposals sent`}</span>
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
              <h2 className="text-2xl font-bold text-slate-900">0%</h2>
              <div className="flex items-center gap-1 mt-2 text-slate-400 font-medium text-xs">
                <span>New account</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-10">

            {/* Dynamically Render My Posted Jobs OR Recent Proposals based on activity */}
            {myJobs.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-slate-900">My Posted Jobs</h3>
                  <Link href="/jobs/manage" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                    View all
                  </Link>
                </div>
                <div className="space-y-4">
                  {myJobs.slice(0, 3).map((job: any) => (
                    <div key={job._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-primary transition-all cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900">{job.title}</h4>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-1">{job.description}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">${job.budget}</span>
                            <span className="text-xs text-slate-400 font-medium">{new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-emerald-100 text-emerald-600">
                          {job.status || 'active'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(myProposals.length > 0 || (myJobs.length === 0 && !isClientRole)) && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-slate-900">Recent Proposals</h3>
                  <Link href="/proposals" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                    View all
                  </Link>
                </div>

                {myProposals.length > 0 ? (
                  <div className="space-y-4">
                    {myProposals.slice(0, 3).map((proposal: any) => (
                      <div 
                        key={proposal._id} 
                        onClick={() => router.push(`/jobs/${proposal.job?._id || proposal.job}`)}
                        className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-primary transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900">{proposal.job?.title}</h4>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-1">{proposal.coverLetter}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">${proposal.proposedRate}</span>
                              <span className="text-xs text-slate-400 font-medium">{new Date(proposal.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                            proposal.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                            proposal.status === 'viewed' ? 'bg-blue-100 text-blue-600' :
                            proposal.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {proposal.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 border-dashed p-10 shadow-sm flex flex-col items-center justify-center text-center mb-10">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-slate-300 text-3xl">folder_open</span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">No activity yet</h4>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
                      Apply for projects to build your professional history.
                    </p>
                    <div className="flex gap-3">
                      <Link href="/find-work" className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">
                        Find Work
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isClientRole && myJobs.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 border-dashed p-10 shadow-sm flex flex-col items-center justify-center text-center mb-10">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-slate-300 text-3xl">folder_open</span>
                </div>
                <h4 className="font-bold text-slate-900 mb-1">No activity yet</h4>
                <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
                  Post your first job to start finding talent.
                </p>
                <div className="flex gap-3">
                  <Link href="/post-job" className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">
                    Post a Job
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-5">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/find-work')}
                  className="bg-primary hover:bg-[#5a5c41] transition-colors text-white rounded-xl p-6 shadow-md flex flex-col items-center justify-center gap-3 h-32"
                >
                  <span className="material-symbols-outlined text-3xl">search</span>
                  <span className="font-bold text-sm">Find Work</span>
                </button>
                <button
                  onClick={() => router.push('/find-talent')}
                  className="bg-white hover:border-primary transition-colors border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center gap-3 h-32 group"
                >
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-3xl">person_search</span>
                  <span className="font-bold text-sm text-slate-700">Find Talent</span>
                </button>
                <button
                  onClick={() => router.push('/post-job')}
                  className="bg-white hover:border-primary transition-colors border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center gap-3 h-32 group"
                >
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
                {isLoadingOffers || isLoadingMyData ? (
                  <div className="p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm text-slate-500">Loading activity...</p>
                  </div>
                ) : ([...offers, ...receivedProposals, ...myProposals].length > 0) ? (
                  <div className="divide-y divide-slate-100">
                    {[...offers, ...receivedProposals, ...myProposals]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map((activity: any) => (
                      <div key={activity._id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex gap-3">
                          <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-sm">
                              {activity.type === 'proposal' ? 'description' : (user?.id === activity.client?._id || user?.id === activity.client?.id ? "send" : "mail")}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-slate-900 font-medium">
                              {getActivityMessage(activity)}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(activity.createdAt).toLocaleDateString()} at {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-slate-300">history</span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm mb-1">No activity yet</p>
                    <p className="text-xs text-slate-500">Your recent activities will appear here.</p>
                  </div>
                )}

                <div className="border-t border-slate-100 p-4 text-center">
                  <span className={`text-sm font-bold ${offers.length > 0 ? 'text-primary hover:underline cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}>
                    View All Activity
                  </span>
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
