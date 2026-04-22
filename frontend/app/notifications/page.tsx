"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore, Offer } from "@/lib/store";
import DashboardHeader from "@/components/DashboardHeader";
import Navbar from "@/components/Navbar";
import Swal from "sweetalert2";

import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [offerTab, setOfferTab] = useState<"received" | "sent">("received");
  const [proposalTab, setProposalTab] = useState<"received" | "sent">("received");
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);
  const [selectedPaymentReceipt, setSelectedPaymentReceipt] = useState<any | null>(null);
  const {
    offers,
    fetchOffers,
    notifications: realNotifications,
    sentNotifications,
    fetchNotifications,
    markNotificationAsRead,
    myProposals,
    receivedProposals,
    fetchMyProposals,
    fetchReceivedProposals,
    updateProposalStatus,
    markProposalAsViewed,
    updateOfferStatus,
    isLoadingNotifications,
    user
  } = useStore();

  useEffect(() => {
    fetchNotifications('received');
    fetchNotifications('sent');
    fetchOffers();
    fetchMyProposals();
    fetchReceivedProposals();
  }, [fetchNotifications, fetchOffers, fetchMyProposals, fetchReceivedProposals]);

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
    }

    if (notif.type === "offer") {
      const offer = offers.find(o => o._id === notif.relatedId || o._id === notif.id);
      if (offer) {
        setSelectedOffer(offer);
      }
    } else if (notif.type === "proposal") {
      setSelectedProposal(notif);
    } else if (notif.type === "payment") {
      const relatedOffer = offers.find(o => o._id === notif.relatedId);
      const isPaid = relatedOffer?.isPaid === true;
      const isPaymentRequired = notif.title?.toLowerCase().includes("required");

      if (isPaymentRequired && !isPaid) {
        const isProposal = notif.title?.toLowerCase().includes("proposal");
        router.push(`/payment/${notif.relatedId}${isProposal ? "?type=proposal" : ""}`);
      } else {
        setSelectedPaymentReceipt(notif);
      }
    }
  };

  const mappedNotifications = useMemo(() => {
    const allNotifs = [
      ...(Array.isArray(realNotifications) ? realNotifications : []).map(n => ({ ...n, direction: 'received' })),
      ...(Array.isArray(sentNotifications) ? sentNotifications : []).map(n => ({ ...n, direction: 'sent' }))
    ];

    return allNotifs.map((n) => ({
      id: n._id,
      type: n.type,
      direction: n.direction,
      relatedId: n.relatedId,
      title: n.title,
      message: n.message,
      time: n.createdAt,
      isRead: n.isRead,
    })).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [realNotifications, sentNotifications]);

  const filteredNotifications = mappedNotifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "proposals") return n.type === "proposal";
    if (activeTab === "projects") return n.type === "offer";
    if (activeTab === "payments") return n.type === "payment";
    return false;
  });

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-20">
      {/* Header Section */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-40 border-b border-primary/10">
        <div
          onClick={() => router.back()}
          className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </div>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 px-4">Notifications</h2>
        <div className="flex items-center justify-end">
          <button
            onClick={() => useStore.getState().markAllNotificationsAsRead()}
            className="text-primary text-sm font-bold leading-normal tracking-wide shrink-0 hover:bg-primary/5 px-2 py-1 rounded-lg"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="sticky top-[61px] z-30 bg-background-light dark:bg-background-dark border-b border-primary/10">
        <div className="flex px-4 gap-6 overflow-x-auto no-scrollbar">
          {["all", "proposals", "projects", "payments"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[10px] pt-4 whitespace-nowrap transition-all ${activeTab === tab
                  ? "border-primary text-slate-900 dark:text-slate-100 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-bold"
                }`}
            >
              <p className="text-sm capitalize">{tab}</p>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto w-full px-4">
        {isLoadingNotifications ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] animate-pulse">Syncing Feed...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          (() => {
            const groups: { [key: string]: typeof filteredNotifications } = {};
            const todayStr = new Date().toDateString();
            const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

            filteredNotifications.forEach(n => {
              const d = new Date(n.time).toDateString();
              let groupName = "Earlier";
              if (d === todayStr) groupName = "Recent";
              else if (d === yesterdayStr) groupName = "Yesterday";

              if (!groups[groupName]) groups[groupName] = [];
              groups[groupName].push(n);
            });

            const order = ["Recent", "Yesterday", "Earlier"];

            return order.filter(g => groups[g]).map((groupName) => (
              <div key={groupName} className="flex flex-col pt-2">
                <h3 className="text-slate-900 dark:text-slate-100 text-sm font-bold uppercase tracking-widest pb-3 pt-6 opacity-60">
                  {groupName}
                </h3>

                <div className="flex flex-col space-y-3">
                  {groups[groupName].map((notif) => {
                    const icons: any = {
                      offer: { icon: "work", color: "text-primary", bg: "bg-primary/10" },
                      proposal: { icon: "description", color: "text-primary", bg: "bg-primary/10" },
                      payment: { icon: "payments", color: "text-primary", bg: "bg-primary/10" },
                      completion_request: { icon: "check_circle", color: "text-green-600", bg: "bg-green-500/10" },
                      other: { icon: "notifications", color: "text-slate-500", bg: "bg-slate-500/10" }
                    };
                    const typeStyle = icons[notif.type] || icons.other;

                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer relative shadow-sm hover:shadow-md ${!notif.isRead
                            ? "bg-white dark:bg-white/5 border-primary/10"
                            : "bg-background-light/50 dark:bg-slate-900/20 border-primary/5 opacity-80"
                          }`}
                      >
                        <div className={`${typeStyle.color} flex items-center justify-center rounded-lg ${typeStyle.bg} shrink-0 size-12 transition-transform group-hover:scale-105`}>
                          <span className="material-symbols-outlined text-2xl">{typeStyle.icon}</span>
                        </div>

                        <div className="flex flex-col justify-center flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-slate-900 dark:text-slate-100 text-[15px] font-semibold leading-snug tracking-tight">
                              {notif.title}
                              <span className="text-slate-500 dark:text-slate-400 font-medium block mt-0.5 text-sm line-clamp-2">
                                {notif.message}
                              </span>
                            </p>
                            {!notif.isRead && (
                              <div className="shrink-0 mt-1.5">
                                <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                              </div>
                            )}
                          </div>
                          <p className="text-slate-400 font-medium text-[11px] mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            {formatDistanceToNow(new Date(notif.time), { addSuffix: true })}
                          </p>

                          {/* Quick Actions (e.g. for Received Proposals) */}
                          {notif.type === 'proposal' && notif.direction === 'received' && (() => {
                            const proposal = receivedProposals.find(p => p._id === notif.relatedId);
                            if (proposal && (proposal.status === 'pending' || proposal.status === 'viewed')) {
                              return (
                                <div className="mt-3 flex gap-2">
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      updateProposalStatus(proposal._id, 'accepted');
                                    }}
                                    className="px-4 py-1.5 bg-green-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-green-600 transition-all active:scale-95"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      updateProposalStatus(proposal._id, 'rejected');
                                    }}
                                    className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                  >
                                    Reject
                                  </button>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ));
          })()
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="size-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600">notifications_off</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold">No notifications yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                We'll let you know when you receive new updates.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Offer Details Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Offer Details</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    Ref: {String(selectedOffer._id).slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOffer(null)}
                className="size-8 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Job Title & Budget */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Title</p>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">{selectedOffer.jobTitle}</h4>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Budget</p>
                  <p className="text-lg font-black">${selectedOffer.budget}</p>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 dark:border-white/5">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">From</p>
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-white/5">
                      {selectedOffer.client?.imageUrl ? (
                        <img src={selectedOffer.client.imageUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-slate-400">person</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{selectedOffer.client?.name || "Unknown"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">To</p>
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-white/5">
                      {selectedOffer.freelancer?.imageUrl ? (
                        <img src={selectedOffer.freelancer.imageUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-slate-400">person</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{selectedOffer.freelancer?.name || "Unknown"}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</p>
                <div
                  className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-bold border border-slate-100 dark:border-white/5 p-4 rounded-xl prose dark:prose-invert max-w-none bg-slate-50/30 dark:bg-white/5"
                  dangerouslySetInnerHTML={{ __html: selectedOffer.description }}
                />
              </div>

              {/* Status & Date */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  <p className="text-xs font-medium">Sent on {new Date(selectedOffer.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedOffer.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                  selectedOffer.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                  {selectedOffer.status}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-white/5 flex gap-3">
              <button
                onClick={() => setSelectedOffer(null)}
                className="flex-1 py-3 px-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-display"
              >
                Close
              </button>
              {selectedOffer.status === 'pending' && user?.id === (typeof selectedOffer.freelancer === 'string' ? selectedOffer.freelancer : (selectedOffer.freelancer?._id || selectedOffer.freelancer?.id)) && (
                <div className="flex flex-1 gap-3">
                  <button
                    onClick={() => {
                      updateOfferStatus(selectedOffer._id, 'rejected');
                      setSelectedOffer(null);
                    }}
                    className="flex-1 py-3 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-all border border-red-100 font-display"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      updateOfferStatus(selectedOffer._id, 'accepted');
                      setSelectedOffer(null);
                    }}
                    className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-bold text-sm hover:bg-[#5a5c41] transition-all shadow-lg shadow-primary/20 font-display"
                  >
                    Accept
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Proposal Details Modal */}
      {selectedProposal && (() => {
        const proposalDetail = [...myProposals, ...receivedProposals].find(p => p._id === selectedProposal.relatedId);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined">assignment_ind</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Proposal Details</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                      ID: {String(selectedProposal.relatedId || selectedProposal.id).slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProposal(null)}
                  className="size-8 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{selectedProposal.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Received {formatDistanceToNow(new Date(selectedProposal.time), { addSuffix: true })}</p>
                  </div>
                  {proposalDetail && (
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${proposalDetail.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                      proposalDetail.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                      {proposalDetail.status}
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
                    {selectedProposal.message}
                  </p>
                  {proposalDetail && proposalDetail.talent && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center gap-3">
                      <div className="size-10 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden flex-shrink-0 border border-slate-100 dark:border-white/5">
                        {proposalDetail.talent.imageUrl ? (
                          <img src={proposalDetail.talent.imageUrl} alt={proposalDetail.talent.name} className="size-full object-cover" />
                        ) : (
                          <div className="size-full flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined">person</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sender Profile</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{proposalDetail.talent.name}</p>
                        <button
                          onClick={() => {
                            const talentId = proposalDetail.talent._id || proposalDetail.talent.id;
                            router.push(`/talent/${talentId}`);
                          }}
                          className="mt-2 px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/20 transition-all flex items-center gap-1 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          View Profile
                        </button>
                      </div>
                    </div>
                  )}
                  {proposalDetail && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pitch / Cover Letter</p>
                      <div
                        className="text-sm text-slate-600 dark:text-slate-400 italic prose dark:prose-invert max-w-none font-medium bg-white/40 dark:bg-slate-900/40 p-4 rounded-xl border border-primary/5"
                        dangerouslySetInnerHTML={{ __html: proposalDetail.coverLetter }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-400 bg-blue-50/30 dark:bg-blue-500/5 p-3 rounded-xl border border-blue-100/50 dark:border-blue-500/10">
                  <span className="material-symbols-outlined text-sm text-blue-500">info</span>
                  <p className="text-[11px] font-medium leading-tight">You can manage all your applications and interview requests on the main Proposals page.</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-white/5 flex gap-3">
                <button
                  onClick={() => setSelectedProposal(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-display"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedProposal(null);
                    router.push('/proposals');
                  }}
                  className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-bold text-sm hover:bg-[#5a5c41] transition-all shadow-lg shadow-primary/20 font-display"
                >
                  Manage Proposals
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Payment Receipt Modal */}
      {selectedPaymentReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/5">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-8 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 11px)' }}></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-white/30 transition-transform hover:scale-110">
                  <span className="material-symbols-outlined text-3xl font-bold">check_circle</span>
                </div>
                <h3 className="text-xl font-black mb-1 uppercase tracking-wider">Payment Verified</h3>
                <p className="text-emerald-100 text-sm font-bold opacity-90 tracking-tight">Funds secured in escrow</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Transaction ID</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">
                  #{String(selectedPaymentReceipt.relatedId || selectedPaymentReceipt.id).slice(-10).toUpperCase()}
                </span>
              </div>
              <div className="border-t border-dashed border-slate-200 dark:border-white/5"></div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Details</p>
                  <p className="text-[15px] font-bold text-slate-700 dark:text-slate-200 leading-snug">{selectedPaymentReceipt.message}</p>
                </div>
                <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-500/5 rounded-xl px-5 py-4 border border-emerald-100 dark:border-emerald-500/20 shadow-inner">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Amount Secured</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {selectedPaymentReceipt.message?.match(/\$[\d,]+/)?.[0] || '—'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Status</span>
                    <span className="px-3 py-1.5 bg-amber-100/50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border border-amber-200/50 dark:border-amber-500/10">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      Escrow
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Time</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center h-full border border-slate-100 dark:border-white/5 rounded-lg">
                      {formatDistanceToNow(new Date(selectedPaymentReceipt.time), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 flex gap-3 border border-slate-100 dark:border-white/5">
                <span className="material-symbols-outlined text-amber-500 text-[20px] shrink-0">verified_user</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  We'll hold these funds securely. They will only be released to your wallet once labels are approved or the client confirms milestone completion.
                </p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setSelectedPaymentReceipt(null)}
                className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all font-display shadow-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}