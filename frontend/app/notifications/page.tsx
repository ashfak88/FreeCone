"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore, Offer } from "@/lib/store";

interface Notification {
  id: string;
  type: "proposal" | "offer" | "payment" | "other";
  direction?: "sent" | "received";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [offerTab, setOfferTab] = useState<"received" | "sent">("received");
  const [proposalTab, setProposalTab] = useState<"received" | "sent">("received");
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);
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
    isLoadingOffers,
    user
  } = useStore();

  useEffect(() => {
    fetchNotifications('received');
    fetchNotifications('sent');
    fetchOffers();
    fetchMyProposals();
    fetchReceivedProposals();
  }, [fetchNotifications, fetchOffers, fetchMyProposals, fetchReceivedProposals]);

  // Handle notification click
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
      const proposal = [...myProposals, ...receivedProposals].find(p => p._id === notif.relatedId);
      if (proposal && notif.direction === 'received' && proposal.status === 'pending') {
        await markProposalAsViewed(proposal._id);
      }
      setSelectedProposal(notif);
    }
  };

  // Map real backend notifications to UI format
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
      time: new Date(n.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      isRead: n.isRead,
    }));
  }, [realNotifications, sentNotifications]);

  const filteredNotifications = mappedNotifications.filter((n) => {
    if (activeTab === "all") return true; // Show all notifications
    if (activeTab === "proposals") return n.type === "proposal" && n.direction === proposalTab;
    if (activeTab === "offers") return n.type === "offer" && n.direction === offerTab;
    if (activeTab === "payments") return n.type === "payment" && n.direction === 'received';
    return false;
  });

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden font-display text-slate-900 dark:text-slate-100">

      {/* Header */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-primary/10">
        <div
          onClick={() => router.back()}
          className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </div>

        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 px-4">
          Notifications
        </h2>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => useStore.getState().markAllNotificationsAsRead()}
            className="text-primary text-xs font-bold leading-normal tracking-wide shrink-0 hover:bg-primary/10 px-3 py-1.5 rounded-xl transition-colors border border-primary/20"
          >
            Mark all as read
          </button>
          <button
            onClick={() => useStore.getState().markAllNotificationsAsUnread()}
            className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-normal tracking-wide shrink-0 hover:bg-slate-100 dark:hover:bg-white/5 px-3 py-1.5 rounded-xl transition-colors border border-slate-200 dark:border-white/10"
          >
            Mark all as unread
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="pb-1 bg-background-light dark:bg-background-dark">
        <div className="flex border-b border-primary/10 px-4 gap-6 overflow-x-auto no-scrollbar">
          {["all", "proposals", "offers", "payments"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[10px] pt-4 whitespace-nowrap transition-all ${activeTab === tab
                  ? "border-primary text-slate-900 dark:text-slate-100 font-bold"
                  : "border-transparent text-slate-500 dark:text-slate-400"
                }`}
            >
              <p className="text-sm font-bold uppercase tracking-wide">{tab}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Proposal Sub-Tabs */}
      {activeTab === "proposals" && (
        <div className="bg-slate-50 dark:bg-white/5 px-4 py-2 border-b border-primary/5 flex gap-2 overflow-x-auto no-scrollbar">
          {["received", "sent"].map((tab) => (
            <button
              key={tab}
              onClick={() => setProposalTab(tab as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${proposalTab === tab
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Offer Sub-Tabs (shown only when 'offers' is selected) */}
      {activeTab === "offers" && (
        <div className="bg-slate-50 dark:bg-white/5 px-4 py-2 border-b border-primary/5 flex gap-2 overflow-x-auto no-scrollbar">
          {["received", "sent"].map((tab) => (
            <button
              key={tab}
              onClick={() => setOfferTab(tab as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${offerTab === tab
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-4 space-y-1">
        {(isLoadingNotifications || isLoadingOffers) ? (
          <div className="flex justify-center py-20">
            <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 border-b border-primary/5 hover:bg-primary/5 transition-colors cursor-pointer ${!notif.isRead ? "bg-primary/5" : ""
                }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-sm ${!notif.isRead ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-700 dark:text-slate-300"}`}>
                      {notif.title}
                    </h3>
                    {notif.type === 'proposal' && (() => {
                      const proposal = [...myProposals, ...receivedProposals].find(p => p._id === notif.relatedId);
                      if (!proposal) return null;

                      const statusMap: any = {
                        pending: { label: 'Pending', color: 'bg-amber-100 text-amber-600 border-amber-200' },
                        viewed: { label: 'Viewed', color: 'bg-blue-100 text-blue-600 border-blue-200' },
                        accepted: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
                        rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600 border-red-200' }
                      };
                      const s = statusMap[proposal.status] || { label: proposal.status, color: 'bg-slate-100 text-slate-600' };

                      return (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${s.color}`}>
                          {s.label}
                        </span>
                      );
                    })()}
                    {notif.type === 'offer' && (() => {
                      const offer = offers.find(o => o._id === notif.relatedId || o._id === notif.id);
                      if (!offer) return null;

                      const statusMap: any = {
                        pending: { label: 'Pending', color: 'bg-amber-100 text-amber-600 border-amber-200' },
                        accepted: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
                        rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600 border-red-200' }
                      };
                      const s = statusMap[offer.status] || { label: offer.status, color: 'bg-slate-100 text-slate-600' };

                      return (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${s.color}`}>
                          {s.label}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2">
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-slate-400 text-[10px] font-medium">{notif.time}</p>
                    {notif.type === 'proposal' && notif.direction === 'received' && (() => {
                      const proposal = receivedProposals.find(p => p._id === notif.relatedId);
                      if (proposal && (proposal.status === 'pending' || proposal.status === 'viewed')) {
                        return (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("Are you sure you want to accept this proposal?")) {
                                  updateProposalStatus(proposal._id, 'accepted');
                                }
                              }}
                              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1 rounded-lg text-[10px] font-bold border border-emerald-100 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("Are you sure you want to reject this proposal?")) {
                                  updateProposalStatus(proposal._id, 'rejected');
                                }
                              }}
                              className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-lg text-[10px] font-bold border border-red-100 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    {notif.type === 'offer' && notif.direction === 'received' && (() => {
                      const offer = offers.find(o => o._id === notif.relatedId || o._id === notif.id);
                      if (offer && offer.status === 'pending') {
                        return (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("Are you sure you want to accept this offer?")) {
                                  updateOfferStatus(offer._id, 'accepted');
                                }
                              }}
                              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1 rounded-lg text-[10px] font-bold border border-emerald-100 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("Are you sure you want to reject this offer?")) {
                                  updateOfferStatus(offer._id, 'rejected');
                                }
                              }}
                              className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-lg text-[10px] font-bold border border-red-100 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
                {!notif.isRead && (
                  <div className="size-2 bg-primary rounded-full mt-1.5 ml-2"></div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="size-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center ring-8 ring-slate-50/50 dark:ring-white/5">
              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">notifications_off</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold">No {activeTab} {activeTab === 'offers' ? offerTab : ''} yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
                We'll let you know when you receive new {activeTab === 'all' ? 'notifications' : activeTab}.
              </p>
            </div>
          </div>
        )}
      </div>

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
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Title</p>
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
                    <div className="size-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                      {selectedOffer.client?.imageUrl ? (
                        <img src={selectedOffer.client.imageUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-slate-400">person</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedOffer.client?.name || "Unknown"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">To</p>
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                      {selectedOffer.freelancer?.imageUrl ? (
                        <img src={selectedOffer.freelancer.imageUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-slate-400">person</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedOffer.freelancer?.name || "Unknown"}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                  {selectedOffer.description}
                </p>
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
                className="flex-1 py-3 px-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
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
                    className="flex-1 py-3 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-all border border-red-100"
                  >
                    Reject Offer
                  </button>
                  <button 
                    onClick={() => {
                      updateOfferStatus(selectedOffer._id, 'accepted');
                      setSelectedOffer(null);
                    }}
                    className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-bold text-sm hover:bg-[#5a5c41] transition-all shadow-lg shadow-primary/20"
                  >
                    Accept Offer
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
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{selectedProposal.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{selectedProposal.time}</p>
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
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedProposal.message}
                  </p>
                  {proposalDetail && proposalDetail.talent && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center gap-3">
                      <div className="size-10 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden flex-shrink-0">
                        {proposalDetail.talent.imageUrl ? (
                          <img src={proposalDetail.talent.imageUrl} alt={proposalDetail.talent.name} className="size-full object-cover" />
                        ) : (
                          <div className="size-full flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined">person</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sender Profile</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{proposalDetail.talent.name}</p>
                        <p className="text-xs text-slate-500">{proposalDetail.talent.email}</p>
                      </div>
                    </div>
                  )}
                  {proposalDetail && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cover Letter Snippet</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 italic line-clamp-3">
                        "{proposalDetail.coverLetter}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <p className="text-xs font-medium">You can manage all your applications on the Proposals page.</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-white/5 flex gap-3">
                <button
                  onClick={() => setSelectedProposal(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedProposal(null);
                    router.push('/proposals');
                  }}
                  className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-bold text-sm hover:bg-[#5a5c41] transition-all shadow-lg shadow-primary/20"
                >
                  Go to Proposals
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="h-10"></div>
    </div>
  );
}