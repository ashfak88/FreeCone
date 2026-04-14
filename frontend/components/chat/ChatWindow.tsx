"use client";

import React, { useEffect, useRef, useState } from "react";
import { useStore, Conversation, User, Message } from "@/lib/store";
import MessageInput from "./MessageInput";
import { format, isToday, isYesterday } from "date-fns";
import Swal from "sweetalert2";
import { API_URL, handleResponse } from "@/lib/api";



function ConfirmationMessageBubble({ msg }: { msg: any }) {
  const status = msg.metadata?.status || null;
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useStore();

  const handleAction = async (action: 'confirm' | 'reject') => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/jobs/proposals/${msg.metadata?.proposalId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, messageId: msg._id })
      });
      if (res.ok) {
        // Optimistic UI update
        const updatedMsg = {
          ...msg,
          metadata: { ...msg.metadata, status: action === 'confirm' ? 'confirmed' : 'rejected' }
        };
        useStore.getState().updateMessageLocally(updatedMsg);
      }
    } catch (err) {
      console.error("Handshake error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isFreelancer =
    (user?.id && msg.metadata?.freelancerId && user.id.toString() === msg.metadata.freelancerId.toString()) ||
    (user?._id && msg.metadata?.freelancerId && user._id.toString() === msg.metadata.freelancerId.toString()) ||
    user?.id === msg.metadata?.freelancerId ||
    user?._id === msg.metadata?.freelancerId;

  const hasActionTaken = status === 'confirmed' || status === 'rejected';

  return (
    <div className="flex flex-col gap-3 p-3 bg-slate-900/5 dark:bg-white/5 rounded-xl border border-primary/20 mt-1 mb-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[22px] text-primary font-bold">handshake</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-primary">Project Confirmation</span>
          <p className="text-[12px] text-wa-text-primary leading-tight mt-0.5">{msg.content}</p>
        </div>
      </div>

      {status === 'confirmed' ? (
        <div className="w-full py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[13px] font-bold text-emerald-600 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          Accepted
        </div>
      ) : status === 'rejected' ? (
        <div className="w-full py-2 bg-rose-50 border border-rose-200 rounded-lg text-[13px] font-bold text-rose-600 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[16px]">cancel</span>
          Rejected
        </div>
      ) : hasActionTaken ? null : !isFreelancer ? (
        <div className="w-full py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-bold text-slate-500 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[16px]">pending</span>
          Awaiting Confirmation
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => handleAction('confirm')}
            disabled={isLoading}
            className="flex-1 h-9 bg-emerald-500 text-white rounded-lg text-[12px] font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10"
          >
            Accept
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={isLoading}
            className="flex-1 h-9 bg-rose-50 text-rose-500 border border-rose-200 rounded-lg text-[12px] font-bold hover:bg-rose-100 transition-all"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

function PaymentMessageBubble({ msg }: { msg: any }) {
  const [isPaid, setIsPaid] = useState<boolean | null>(null);
  const offerId = msg.metadata?.offerId || msg.metadata?.proposalId;

  useEffect(() => {
    if (!offerId) return;
    const token = localStorage.getItem("accessToken");
    const endpoint = msg.metadata?.type === 'proposal' ? `/jobs/proposals/${offerId}` : `/offers/${offerId}`;

    fetch(`${API_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.isPaid !== undefined) setIsPaid(data.isPaid);
      })
      .catch(() => { });
  }, [offerId, msg.metadata?.type]);

  const handlePay = () => {
    const type = msg.metadata?.type === 'proposal' ? 'proposal' : 'offer';
    const id = msg.metadata?.proposalId || msg.metadata?.offerId;
    window.location.href = `/payment/${id}?type=${type}`;
  };

  return (
    <div className={`flex flex-col gap-3 p-3 ${isPaid ? 'bg-emerald-50/50' : 'bg-slate-900/5'} dark:bg-white/5 rounded-xl border ${isPaid ? 'border-emerald-200' : 'border-primary/20'} mt-1 mb-2`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isPaid ? 'bg-emerald-100' : 'bg-primary/10'}`}>
          <span className={`material-symbols-outlined text-[24px] ${isPaid ? 'text-emerald-600' : 'text-primary'}`}>
            {isPaid ? 'check_circle' : 'payments'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className={`text-[13px] font-bold ${isPaid ? 'text-emerald-700' : 'text-primary'}`}>
            {isPaid ? 'Payment Completed' : 'Payment Request'}
          </span>
          <span className="text-[11px] text-wa-text-secondary line-clamp-1">{msg.metadata?.jobTitle || 'Advance Payment'}</span>
        </div>
      </div>

      <div className="flex justify-between items-center px-1">
        <span className="text-[12px] font-medium text-wa-text-secondary">Amount</span>
        <span className={`text-[16px] font-black ${isPaid ? 'text-emerald-700' : 'text-wa-text-primary'}`}>${msg.metadata?.amount?.toLocaleString() || '0'}</span>
      </div>

      {isPaid ? (
        <div className="w-full h-10 bg-emerald-500 text-white rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          Paid
        </div>
      ) : (
        <button
          onClick={handlePay}
          className="w-full h-10 bg-primary text-white rounded-lg text-[13px] font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
        >
          Pay Now
        </button>
      )}
    </div>
  );
}

export default function ChatWindow() {
  const {
    activeConversation,
    tempParticipant,
    messages,
    user,
    fetchMessages,
    isLoadingMessages,
    setActiveConversation
  } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeConversation?._id) {
      fetchMessages(activeConversation._id);
    }
  }, [activeConversation?._id, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const otherUser = activeConversation
    ? activeConversation.participants.find((p: any) => p._id !== user?.id && p._id !== user?._id)
    : tempParticipant;

  const formatDateLabel = (date: Date) => {
    if (isToday(date)) return "TODAY";
    if (isYesterday(date)) return "YESTERDAY";
    return format(date, "MMMM d, yyyy").toUpperCase();
  };

  const handleReport = async () => {
    if (!otherUser) return;

    const { value: formValues } = await Swal.fire({
      title: 'Report this User',
      html:
        '<div class="flex flex-col gap-4 text-left p-1">' +
          '<label class="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Reason for report</label>' +
          '<select id="report-category" class="swal2-input !mt-0 !w-full !text-sm !h-11 !rounded-xl">' +
            '<option value="user_report">Harassment / Bullying</option>' +
            '<option value="message">Scam / Fraud</option>' +
            '<option value="message">Spam / Advertising</option>' +
            '<option value="other">Inappropriate Content</option>' +
          '</select>' +
          '<label class="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 mt-4">Subject</label>' +
          '<input id="report-subject" class="swal2-input !mt-0 !w-full !text-sm !h-11 !rounded-xl" placeholder="Brief summary">' +
          '<label class="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 mt-4">Details</label>' +
          '<textarea id="report-message" class="swal2-textarea !mt-0 !w-full !text-sm !rounded-xl !h-24" placeholder="Explain the situation..."></textarea>' +
        '</div>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#6A6B4C',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Submit Report',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl px-8 py-3 font-bold uppercase tracking-widest text-xs',
        cancelButton: 'rounded-xl px-8 py-3 font-bold uppercase tracking-widest text-xs'
      },
      preConfirm: () => {
        return {
          category: (document.getElementById('report-category') as HTMLSelectElement).value,
          subject: (document.getElementById('report-subject') as HTMLInputElement).value,
          message: (document.getElementById('report-message') as HTMLTextAreaElement).value,
          reportedUser: otherUser._id || otherUser.id
        }
      }
    });

    if (formValues) {
      if (!formValues.subject || !formValues.message) {
        return Swal.fire({
          title: "Error",
          text: "All fields are required.",
          icon: "error",
          confirmButtonColor: "#6A6B4C"
        });
      }

      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/report`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(formValues)
        });

        const data = await handleResponse(res);
        if (data) {
          Swal.fire({
            title: "Report Submitted",
            text: "Administrators have been notified and will review the case shortly.",
            icon: "success",
            confirmButtonColor: "#6A6B4C"
          });
        }
      } catch (err: any) {
        Swal.fire("Error", err.message || "Failed to send report. Try again later.", "error");
      }
    }
  };

  if (!activeConversation && !tempParticipant) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-wa-bg-main p-12 text-center select-none border-b-[6px] border-wa-check-blue">
        <div className="size-64 mb-8 opacity-20 filter grayscale drop-shadow-2xl">
          <span className="material-symbols-outlined text-[180px] text-wa-text-secondary leading-none">settings_ethernet</span>
        </div>
        <h2 className="text-3xl font-extralight text-wa-text-primary tracking-tight mb-4">Select a chat</h2>
        <p className="text-sm text-wa-text-secondary max-w-sm leading-relaxed">
          Connect with your team and freelancers in real-time. All your communications are strictly end-to-end encrypted.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-wa-bg-main relative">
      <div className="px-4 py-2 bg-wa-bg-sidebar border-b border-wa-bg-search/20 flex justify-between items-center z-20">
        <div className="flex items-center gap-3 cursor-pointer p-1 hover:bg-wa-bg-search/30 rounded-lg transition-colors">
          <button
            onClick={() => setActiveConversation(null)}
            className="md:hidden text-wa-text-secondary hover:text-wa-text-primary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          <img
            alt={otherUser?.name}
            className="w-10 h-10 rounded-full object-cover"
            src={otherUser?.imageUrl || otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'User')}&background=0b141a&color=fff`}
          />
          <div className="flex flex-col min-w-0">
            <h3 className="text-[15px] font-medium text-wa-text-primary truncate leading-tight">
              {otherUser?.name}
            </h3>
            <span className="text-[11px] text-wa-text-secondary">click here for info</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-wa-text-secondary">
          <button 
            onClick={handleReport}
            className="hover:text-red-500 transition-colors flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg group"
            title="Report this user"
          >
            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">report</span>
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block mt-0.5">Report</span>
          </button>
          <button className="hover:text-wa-text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">more_vert</span>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-10 py-6 flex flex-col gap-1 relative scroll-smooth custom-scrollbar"
        style={{
          backgroundImage: `url("https://w0.peakpx.com/wallpaper/580/630/wallpaper-dark-background-whatsapp-doodle-patterns-thumbnail.jpg")`,
          backgroundSize: '400px',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="absolute inset-0 bg-wa-bg-main/90 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-1">
          {isLoadingMessages ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-3 border-wa-check-blue/20 border-t-wa-check-blue rounded-full animate-spin"></div>
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg, index) => {
              const isMe = msg.sender?._id === user?.id || msg.sender?._id === user?._id || msg.sender === user?.id;
              const prevMsg = messages[index - 1];
              const msgDate = new Date(msg.createdAt);
              const showDate = !prevMsg ||
                new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

              return (
                <React.Fragment key={msg._id}>
                  {showDate && (
                    <div className="flex justify-center my-6">
                      <span className="px-3 py-1 bg-wa-bg-sidebar/90 border border-wa-bg-search/20 text-[11px] font-medium text-wa-text-secondary rounded-lg shadow-md uppercase tracking-wider">
                        {formatDateLabel(msgDate)}
                      </span>
                    </div>
                  )}

                  <div className={`flex w-full mb-0.5 ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`relative px-2 py-1.5 min-w-[80px] max-w-[85%] sm:max-w-[65%] shadow-sm ${isMe
                          ? "bg-wa-bubble-sent text-wa-text-primary rounded-lg rounded-tr-none"
                          : "bg-wa-bubble-received text-wa-text-primary rounded-lg rounded-tl-none"
                        }`}
                    >
                      <div className={`absolute top-0 w-2 h-4 overflow-hidden transform ${isMe ? "right-[-7px] rotate-0" : "left-[-7px] rotate-0"
                        }`}>
                        <div className={`w-4 h-4 transform rotate-45 translate-y-[-2px] ${isMe ? "bg-wa-bubble-sent translate-x-[-10px]" : "bg-wa-bubble-received translate-x-[4px]"
                          }`}></div>
                      </div>

                      <div className={`relative flex flex-col pb-[2px] pt-[2px] min-w-[85px] max-w-full ${isMe ? 'pr-[70px]' : 'pr-[50px]'}`}>
                        {msg.type === 'payment' ? (
                          <PaymentMessageBubble msg={msg} />
                        ) : msg.type === 'confirmation' ? (
                          <ConfirmationMessageBubble msg={msg} />
                        ) : (
                          <span className="text-[14.2px] leading-snug break-words whitespace-pre-wrap inline-block">
                            {msg.content}
                          </span>
                        )}
                        <div className="absolute right-1 bottom-[1px] flex items-center justify-end h-4 select-none">
                          <span className="text-[10.5px] text-wa-text-secondary font-medium tracking-tight mt-[1px]">
                            {format(msgDate, "h:mm a").toLowerCase()}
                          </span>
                          {isMe && (
                            <span className="material-symbols-outlined text-[16px] text-wa-check-blue font-bold ml-[2px]">done_all</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          ) : (
            !activeConversation && !isLoadingMessages && (
              <div className="flex justify-center my-10">
                <div className="bg-[#182229] px-4 py-2 rounded-lg text-center shadow-md">
                  <p className="text-[12.5px] text-[#ffd279] uppercase tracking-wide font-medium">Messages are end-to-end encrypted</p>
                  <p className="text-[12px] text-wa-text-secondary mt-1">No one outside of this chat, not even FreeCone, can read them.</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <MessageInput
        conversationId={activeConversation?._id}
        recipientId={!activeConversation ? otherUser?._id || otherUser?.id : undefined}
      />
    </div>
  );
}
