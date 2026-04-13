"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import DashboardHeader from "@/components/DashboardHeader";
import { socketService } from "@/lib/socket";
import HistoryModal from "@/components/HistoryModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface EscrowSummary {
  escrowAsClient: { total: number; count: number };
  escrowAsFreelancer: { total: number; count: number };
  totalSpent: number;
  totalEarned: number;
}

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
    myJobs,
    transactions,
    fetchTransactions,
    fetchProfile
  } = useStore();

  const [escrow, setEscrow] = useState<EscrowSummary | null>(null);
  const [loadingEscrow, setLoadingEscrow] = useState(true);
  const [historyModal, setHistoryModal] = useState<{ isOpen: boolean; title: string; type: "earnings" | "spending" | "escrow" }>({
    isOpen: false,
    title: "",
    type: "earnings"
  });

  const fetchEscrow = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await fetch(`${API_URL}/offers/escrow-summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEscrow(data);
      }
    } catch (e) {
      // non-blocking
    } finally {
      setLoadingEscrow(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
    fetchMyJobs();
    fetchReceivedProposals();
    fetchEscrow();
    fetchTransactions();

    // Socket.io Real-time Listeners
    const socket = socketService.getSocket();
    if (socket) {
      const handleUpdate = () => {
        fetchOffers();
        fetchMyJobs();
        fetchMyProposals();
        fetchReceivedProposals();
        fetchProfile();
      };
      const handleEscrowUpdate = () => {
        fetchEscrow();
        fetchTransactions();
        fetchProfile();
      };

      socket.on("newNotification", handleUpdate);
      socket.on("notificationUpdate", handleUpdate);
      socket.on("offerUpdate", handleUpdate);
      socket.on("proposalUpdate", handleUpdate);
      socket.on("escrowUpdate", handleEscrowUpdate);

      return () => {
        socket.off("newNotification", handleUpdate);
        socket.off("notificationUpdate", handleUpdate);
        socket.off("offerUpdate", handleUpdate);
        socket.off("proposalUpdate", handleUpdate);
        socket.off("escrowUpdate", handleEscrowUpdate);
      };
    }
  }, [fetchOffers, fetchMyJobs, fetchMyProposals, fetchReceivedProposals, fetchEscrow]);

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

  const activeProjectsCount = React.useMemo(() => {
    return offers.filter(o => o.status === 'accepted' && o.isPaid === true).length;
  }, [offers]);

  // Determine escrow balance based on role
  const escrowBalance = isClientRole
    ? escrow?.escrowAsClient.total ?? 0
    : escrow?.escrowAsFreelancer.total ?? 0;
  const escrowCount = isClientRole
    ? escrow?.escrowAsClient.count ?? 0
    : escrow?.escrowAsFreelancer.count ?? 0;
  const totalFinancial = isClientRole
    ? (escrow?.totalSpent ?? 0)
    : (escrow?.totalEarned ?? 0);

  return (
    <div>
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

          <button 
            onClick={() => setHistoryModal({ isOpen: true, title: isClientRole ? "Spending History" : "Total Earnings", type: isClientRole ? "spending" : "earnings" })}
            className="bg-white hover:bg-slate-50 transition-all cursor-pointer rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between text-left group"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-slate-500">
                {isClientRole ? "Total Spend" : "Total Earnings"}
              </p>
              <span className="material-symbols-outlined text-slate-400 text-xl group-hover:text-primary transition-colors">payments</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                ${totalFinancial.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <div className="flex items-center gap-1 mt-2 text-slate-400 font-medium text-xs">
                <span>{totalFinancial > 0 ? `${isClientRole ? "Paid out" : "Earned"} so far` : "No activity yet"}</span>
                <span className="material-symbols-outlined text-[10px] ml-1">arrow_forward</span>
              </div>
            </div>
          </button>

          {/* Card 2 — Escrow Balance */}
          <button 
            onClick={() => setHistoryModal({ isOpen: true, title: "Escrow History", type: "escrow" })}
            className={`rounded-xl border p-6 shadow-sm flex flex-col justify-between text-left group transition-all cursor-pointer ${
            escrowBalance > 0
              ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 hover:shadow-lg hover:shadow-amber-100"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}>
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-slate-500">In Escrow</p>
              <span className={`material-symbols-outlined text-xl group-hover:scale-110 transition-transform ${escrowBalance > 0 ? "text-amber-500" : "text-slate-400"}`}>
                lock
              </span>
            </div>
            <div>
              {loadingEscrow ? (
                <div className="w-6 h-6 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin mt-1"></div>
              ) : (
                <>
                  <h2 className={`text-2xl font-bold ${escrowBalance > 0 ? "text-amber-700" : "text-slate-900"}`}>
                    ${escrowBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-2">
                    {escrowBalance > 0 ? (
                      <span className="text-[11px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        🔒 {escrowCount} payment{escrowCount > 1 ? "s" : ""} held
                        <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">No funds in escrow</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </button>

          {/* Card 3 — Active Projects */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-slate-500">Active Projects</p>
              <span className="material-symbols-outlined text-slate-400 text-xl">account_tree</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {activeProjectsCount}
              </h2>
              <div className="flex items-center gap-1 mt-2 text-slate-400 font-medium text-xs">
                <span>{isClientRole ? `${myJobs.length} total jobs posted` : `${myProposals.length} total proposals sent`}</span>
              </div>
            </div>
          </div>

          {/* Card 4 — Success Rate */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-slate-500">Success Rate</p>
              <span className="material-symbols-outlined text-slate-400 text-xl">verified</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{user?.successRate || 0}%</h2>
              <div className="flex items-center gap-1 mt-2 text-slate-400 font-medium text-xs">
                <span>{user?.completedProjects || 0} projects completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-10">

            {/* Escrow Detail Card — shown when there's an active escrow balance */}
            {escrowBalance > 0 && (
              <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border border-amber-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-600 text-xl">account_balance_wallet</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Escrow Balance</h3>
                    <p className="text-xs text-slate-500">
                      {isClientRole
                        ? "Funds you've deposited, held securely until work is approved."
                        : "Funds awaiting release after work is approved by the client."}
                    </p>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Amount Held</p>
                    <p className="text-3xl font-extrabold text-amber-700">
                      ${escrowBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Across {escrowCount} active payment{escrowCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      Escrow Protected
                    </span>
                    <p className="text-[11px] text-slate-400 text-right max-w-[180px]">
                      USD • Secured by FreeCone
                    </p>
                  </div>
                </div>
              </div>
            )}

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

      <HistoryModal
        isOpen={historyModal.isOpen}
        onClose={() => setHistoryModal({ ...historyModal, isOpen: false })}
        title={historyModal.title}
        type={historyModal.type}
        transactions={
          historyModal.type === 'escrow' 
            ? transactions.filter(t => t.status === 'Escrow')
            : transactions.filter(t => t.status === 'Success')
        }
      />
    </div>
  );
}
