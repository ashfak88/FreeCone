"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore, Offer } from "@/lib/store";
import DashboardHeader from "@/components/DashboardHeader";
import Navbar from "@/components/Navbar";
import Swal from "sweetalert2";
import OfferDetailsModal from "@/components/modals/OfferDetailsModal";
import ProposalDetailsModal from "@/components/modals/ProposalDetailsModal";

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
    } else if (notif.type === "completion_request") {
      if (notif.relatedId) {
        router.push(`/projects/${notif.relatedId}`);
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

      <OfferDetailsModal
        offer={selectedOffer}
        onClose={() => setSelectedOffer(null)}
      />

      <ProposalDetailsModal
        proposalNotification={selectedProposal}
        proposalDetail={selectedProposal ? [...myProposals, ...receivedProposals].find(p => p._id === selectedProposal.relatedId) : null}
        onClose={() => setSelectedProposal(null)}
        onManageProposals={() => {
          setSelectedProposal(null);
          router.push('/proposals');
        }}
      />
    </div>
  );
}