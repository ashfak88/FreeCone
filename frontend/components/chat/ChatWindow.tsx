"use client";

import React, { useEffect, useRef, useState } from "react";
import { useStore, Conversation, User, Message } from "@/lib/store";
import MessageInput from "./MessageInput";
import { format, isToday, isYesterday } from "date-fns";
import Swal from "sweetalert2";
import { API_URL, handleResponse } from "@/lib/api";
import { Play, Pause, Mic as MicIcon } from "lucide-react";



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

function VoiceMessageBubble({ msg, isMe }: { msg: any; isMe: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const requestRef = useRef<number>(null);

  const updateProgress = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      if (total > 0) {
        setProgress((current / total) * 100);
      }
      requestRef.current = requestAnimationFrame(updateProgress);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updateProgress);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
      setProgress(val);
    }
  };

  const toggleSpeed = () => {
    const rates = [1, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const nextRate = rates[nextIndex];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-4 py-1.5 min-w-[260px] pr-2">
      <div className="relative shrink-0">
        <img
          src={msg.sender?.imageUrl || msg.sender?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.name || 'U')}&background=0b141a&color=fff`}
          alt="Avatar"
          className="size-10 rounded-full object-cover border border-wa-bg-search"
        />
        <div className="absolute -bottom-1 -right-1 bg-wa-bg-sidebar rounded-full p-1 border border-wa-bg-search">
          <MicIcon className="size-3 text-primary fill-current" />
        </div>
      </div>

      <button
        onClick={togglePlay}
        className="size-11 flex items-center justify-center text-wa-text-secondary hover:text-wa-text-primary transition-colors bg-wa-bg-search/20 rounded-full"
      >
        {isPlaying ? (
          <Pause className="size-6 fill-current" />
        ) : (
          <Play className="size-6 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex flex-col h-11 justify-center min-w-0 pr-4">
        <div className="h-full flex items-center">
          <input
            type="range"
            value={progress || 0}
            onChange={handleSeek}
            className="w-full h-1 bg-wa-bg-search rounded-lg appearance-none cursor-pointer accent-primary"
            style={{
              background: `linear-gradient(to right, #6A6B4C ${progress}%, #d1d7db ${progress}%)`
            }}
          />
        </div>
        <div className="flex justify-between items-center px-0.5 -mt-2">
          <span className="text-[11px] font-medium text-wa-text-secondary">
            {isPlaying ? formatTime(audioRef.current?.currentTime || 0) : formatTime(duration)}
          </span>
          <button
            onClick={toggleSpeed}
            className="bg-wa-bg-search rounded-full px-1.5 py-0.5 text-[10px] font-black text-wa-text-primary hover:bg-wa-text-secondary/10 transition-colors"
          >
            {playbackRate}x
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={msg.content}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
      />
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
    setActiveConversation,
    isDarkMode,
    setDarkMode
  } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      <div className="flex-1 flex flex-col items-center justify-center bg-wa-bg-main p-12 text-center select-none border-b-[6px] border-primary">
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
    <div className="flex-1 flex flex-col h-full bg-wa-bg-main relative overflow-hidden">
      <div className="px-3 md:px-4 py-1.5 md:py-2 bg-wa-bg-sidebar border-b border-wa-bg-search/20 flex justify-between items-center z-20 shrink-0">
        <div className="flex items-center gap-3 cursor-pointer p-1 hover:bg-wa-bg-search/30 rounded-lg transition-colors">
          <button
            onClick={() => setActiveConversation(null)}
            className="md:hidden text-wa-text-secondary hover:text-wa-text-primary transition-colors flex items-center justify-center -ml-1 pr-1"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
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

        <div className="flex items-center gap-2 text-wa-text-secondary relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`size-10 flex items-center justify-center rounded-full transition-all ${isMenuOpen ? 'bg-wa-bg-search text-wa-text-primary' : 'hover:bg-wa-bg-search/50 hover:text-wa-text-primary'}`}
          >
            <span className="material-symbols-outlined text-2xl">more_vert</span>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#233138] border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 border-b border-slate-50 dark:border-slate-800/50 mb-1">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Options</span>
              </div>
              
              <button 
                onClick={() => {
                  handleReport();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
              >
                <span className="material-symbols-outlined text-[20px] text-slate-500 group-hover:text-red-500 transition-colors">report</span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-red-500 transition-colors">Report User</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Flag inappropriate behavior</span>
                </div>
              </button>

              <div className="my-1 border-t border-slate-50 dark:border-slate-800/50" />

              <button 
                onClick={() => {
                  setDarkMode(!isDarkMode);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
              >
                <span className="material-symbols-outlined text-[20px] text-slate-500 group-hover:text-primary transition-colors">
                  {isDarkMode ? 'light_mode' : 'dark_mode'}
                </span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">
                    {isDarkMode ? 'Light appearance' : 'Dark appearance'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    Switch to {isDarkMode ? 'light' : 'dark'} theme
                  </span>
                </div>
                <div className={`ml-auto size-2 rounded-full ${isDarkMode ? 'bg-primary' : 'bg-slate-300'}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-10 py-4 md:py-6 flex flex-col gap-1 relative scroll-smooth custom-scrollbar"
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
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
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

                      <div className={`relative flex flex-col pb-[2px] pt-[2px] min-w-[85px] max-w-full ${isMe ? 'pr-[70px]' : 'pr-[50px]'} ${msg.metadata?.status === 'sending' ? 'opacity-70' : ''}`}>
                        {msg.type === 'payment' ? (
                          <PaymentMessageBubble msg={msg} />
                        ) : msg.type === 'confirmation' ? (
                          <ConfirmationMessageBubble msg={msg} />
                        ) : (msg.type === 'voice' || (typeof msg.content === 'string' && msg.content.includes('voice_messages') && msg.content.endsWith('.webm'))) ? (
                          <div className="-ml-1">
                            <VoiceMessageBubble msg={msg} isMe={isMe} />
                          </div>
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
                            msg.metadata?.status === 'sending' ? (
                              <span className="material-symbols-outlined text-[14px] ml-[2px] text-wa-text-secondary animate-pulse">schedule</span>
                            ) : (
                              <span className={`material-symbols-outlined text-[16px] font-bold ml-[2px] ${msg.readBy && msg.readBy.length > 1
                                ? "text-wa-check-blue"
                                : "text-wa-text-secondary"
                                }`}>
                                done_all
                              </span>
                            )
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
