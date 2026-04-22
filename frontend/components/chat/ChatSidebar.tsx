"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore, Conversation, User } from "@/lib/store";
import { format, isToday, isYesterday } from "date-fns";
import Swal from "sweetalert2";
import { API_URL, handleResponse } from "@/lib/api";

export default function ChatSidebar() {
  const router = useRouter();
  const { conversations, activeConversation, tempParticipant, setActiveConversation, user, deleteConversation, deleteAllConversations, toggleFavoriteConversation } = useStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const getOtherParticipant = (participants: any[]): any => {
    return participants?.find((p: any) => p._id !== user?.id && p._id !== user?._id);
  };
  
  const handleReport = async () => {
    if (!reportReason.trim()) return;

    const otherUser = activeConversation
      ? activeConversation.participants.find((p: any) => p._id !== user?.id && p._id !== user?._id)
      : tempParticipant;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: "Chat Sidebar Report",
          message: reportReason,
          category: "message",
          reportedUser: otherUser ? (otherUser._id || otherUser.id) : undefined
        })
      });

      const data = await handleResponse(res);
      if (data) {
        Swal.fire({
          title: "Report Submitted",
          text: "Thank you for your report. Our team will review it shortly.",
          icon: "success",
          confirmButtonColor: "#6A6B4C"
        });
        setIsReporting(false);
        setReportReason("");
      }
    } catch (err: any) {
      Swal.fire({
        title: "Error",
        text: err.message || "Failed to submit report. Please try again later.",
        icon: "error",
        confirmButtonColor: "#6A6B4C"
      });
    }
  };

  // Build the unified list of chats including temp participants
  const allChats = useMemo(() => {
    let list = [...conversations];
    
    // ... (rest of allChats logic remains the same)
    if (tempParticipant) {
      const alreadyInList = conversations.some(c => 
        c.participants.some(p => p._id === (tempParticipant._id || tempParticipant.id))
      );
      if (!alreadyInList) {
        list.unshift({
          _id: "temp",
          participants: [user, tempParticipant],
          lastMessage: null,
          updatedAt: new Date().toISOString(),
          isTemp: true
        } as any);
      }
    }
    if (search) {
      list = list.filter(chat => {
        const other = getOtherParticipant(chat.participants);
        return other?.name.toLowerCase().includes(search.toLowerCase());
      });
    }
    if (filter === "unread") {
      list = list.filter(chat => {
        const lastMsg = chat.lastMessage;
        if (!lastMsg) return false;
        const myId = user?._id || user?.id;
        let senderId = lastMsg.sender;
        if (typeof senderId === 'object' && senderId !== null) senderId = senderId._id || senderId.id;
        if (senderId === myId) return false;
        const readArray = Array.isArray(lastMsg.readBy) ? lastMsg.readBy : [];
        return !readArray.some((r: any) => {
          if (typeof r === 'object' && r !== null) return r._id === myId || r.id === myId;
          return r === myId;
        });
      });
    }
    return list;
  }, [conversations, tempParticipant, search, user, filter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "dd/MM/yyyy");
  };

  const renderChatCard = (chat: Conversation) => {
    const otherUser = getOtherParticipant(chat.participants);
    const isActive = (activeConversation?._id === chat._id) || (chat.isTemp && tempParticipant);
    const lastMsg = chat.lastMessage;
    let myId = user?._id || user?.id;
    let isMe = false;
    let isUnread = false;

    if (lastMsg) {
      let senderId = lastMsg.sender;
      if (typeof senderId === 'object' && senderId !== null) senderId = senderId._id || senderId.id;
      isMe = senderId === myId;

      if (!isMe) {
        const readArray = Array.isArray(lastMsg.readBy) ? lastMsg.readBy : [];
        const isRead = readArray.some((r: any) => {
          if (typeof r === 'object' && r !== null) return r._id === myId || r.id === myId;
          return r === myId;
        });
        isUnread = !isRead;
      }
    }
    
    return (
      <div 
        key={chat._id}
        onClick={() => {
           if (!chat.isTemp) {
              setActiveConversation(chat);
           }
        }}
        className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-wa-bg-search/5 group relative ${
          isActive ? "bg-wa-bg-active" : "hover:bg-wa-bg-search/30"
        }`}
      >
        <div className="relative shrink-0">
          <img 
            alt={otherUser?.name} 
            className="w-12 h-12 rounded-full object-cover" 
            src={otherUser?.imageUrl || otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'User')}&background=0b141a&color=fff`} 
          />
        </div>
        
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex justify-between items-baseline mb-0.5">
            <h3 className={`text-[15px] font-medium truncate flex items-center gap-1 ${isUnread ? 'text-primary' : 'text-wa-text-primary'}`}>
              {otherUser?.name}
            </h3>
            <span className={`text-[11px] shrink-0 ml-2 ${isUnread ? "text-primary font-bold tracking-wide" : (isActive ? "text-wa-check-blue" : "text-wa-text-secondary")}`}>
              {chat.updatedAt ? formatDate(chat.updatedAt).toLowerCase() : ""}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <p className={`text-[13.5px] truncate flex items-center gap-1 leading-tight ${isUnread ? 'text-wa-text-primary font-medium' : 'text-wa-text-secondary'}`}>
               {lastMsg && isMe && (
                 <span className={`material-symbols-outlined text-[17px] ${
                   lastMsg.readBy && lastMsg.readBy.length > 1 
                     ? "text-wa-check-blue" 
                     : "text-wa-text-secondary"
                 }`}>
                   done_all
                 </span>
               )}
               {lastMsg?.type === 'voice' || (typeof lastMsg?.content === 'string' && lastMsg.content.includes('voice_messages') && lastMsg.content.endsWith('.webm')) ? (
                 <span className="flex items-center gap-1">
                   <span className="material-symbols-outlined text-[17px] mt-0.5">mic</span>
                   Voice message
                 </span>
               ) : (
                 lastMsg?.content || (chat.isTemp ? "New message..." : "Start a chat")
               )}
            </p>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {isUnread && (
                <div className="bg-primary text-white dark:text-[#111b21] rounded-full min-w-[20px] h-[20px] flex items-center justify-center text-[11px] font-bold px-1.5 pt-[1px] shadow-sm">
                  1
                </div>
              )}
              
              <div className="relative flex items-center h-full">
                <span 
                   onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === chat._id ? null : chat._id); }}
                   className={`material-symbols-outlined text-wa-text-secondary opacity-0 group-hover:opacity-100 transition-opacity text-sm cursor-pointer hover:bg-wa-bg-search/20 rounded-full p-0.5 ${isUnread ? 'hidden' : ''}`}
                >
                  expand_more
                </span>
                
                {openDropdownId === chat._id && (
                  <div className="absolute right-0 top-6 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-[60]" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={async () => {
                        const result = await Swal.fire({
                          title: 'Delete Chat?',
                          text: "You will lose all messages in this conversation.",
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#ef4444',
                          cancelButtonColor: '#94a3b8',
                          confirmButtonText: 'Yes, delete',
                          background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
                          color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                          customClass: {
                            popup: 'rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl',
                            confirmButton: 'rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest',
                            cancelButton: 'rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest'
                          }
                        });

                        if (result.isConfirmed) {
                          deleteConversation(chat._id);
                          setOpenDropdownId(null);
                        }
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-between"
                    >
                      Delete chat
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-full h-full bg-wa-bg-sidebar flex flex-col shrink-0 overflow-hidden select-none relative">
      {/* Header */}
      <div className="p-4 border-b border-wa-bg-search/10">
        <div className="flex items-center justify-between text-wa-text-primary">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()} 
              className="p-1 -ml-1 flex hover:bg-wa-bg-search/50 rounded-full transition-colors text-wa-text-secondary hover:text-wa-text-primary"
              title="Back"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <h2 className="text-xl font-bold tracking-tight">Chats</h2>
          </div>
          <div className="flex items-center gap-2 relative">
            <button 
              onClick={() => setHeaderDropdownOpen(!headerDropdownOpen)}
              className="p-1 hover:bg-wa-bg-search/50 rounded-full transition-colors text-wa-text-secondary hover:text-wa-text-primary"
            >
              <span className="material-symbols-outlined text-xl">more_vert</span>
            </button>

            {headerDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-[70]">
                <button
                  onClick={async () => {
                    const result = await Swal.fire({
                      title: 'Delete All Chats?',
                      text: "This cannot be undone. You will lose all conversation history.",
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#ef4444',
                      cancelButtonColor: '#94a3b8',
                      confirmButtonText: 'Yes, delete all',
                      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
                      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                      customClass: {
                        popup: 'rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl',
                        confirmButton: 'rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest',
                        cancelButton: 'rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest'
                      }
                    });

                    if (result.isConfirmed) {
                      deleteAllConversations();
                      setHeaderDropdownOpen(false);
                      Swal.fire({
                        title: 'Conversations Cleared',
                        text: 'All your chats have been successfully deleted.',
                        icon: 'success',
                        confirmButtonColor: '#6A6B4C',
                        background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
                        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                        customClass: {
                          popup: 'rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl',
                          confirmButton: 'rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest',
                        }
                      });
                    }
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-between"
                >
                  Delete all chat
                  <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                </button>
                <button
                  onClick={() => { setIsReporting(true); setHeaderDropdownOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between border-t border-slate-100 dark:border-slate-700"
                >
                  Report section
                  <span className="material-symbols-outlined text-[20px]">report</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {allChats.length > 0 ? (
          <div className="divide-y divide-wa-bg-search/5">
            {allChats.map(chat => renderChatCard(chat))}
          </div>
        ) : (
          <div className="p-12 text-center text-wa-text-secondary">
             <div className="size-16 mx-auto mb-4 opacity-20">
                <span className="material-symbols-outlined text-5xl">chat_bubble_outline</span>
             </div>
             <p className="text-sm">No conversations yet</p>
          </div>
        )}
      </div>

      {/* Report Section Overlay */}
      {isReporting && (
        <div className="absolute inset-0 bg-white dark:bg-[#111b21] z-[80] flex flex-col p-4">
          <div className="flex items-center gap-3 mb-6">
            <button 
              onClick={() => setIsReporting(false)}
              className="p-1 hover:bg-wa-bg-search/30 rounded-full transition-colors text-wa-text-secondary"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 className="text-xl font-bold text-wa-text-primary">Submit a Report</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-wa-text-secondary">Tell us what's happening. Your feedback helps keep FreeCone safe.</p>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary uppercase tracking-wider">Report Reason</label>
              <textarea 
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="What's the issue? (e.g. Spam, Abusive content, Technical bug...)"
                className="w-full h-40 p-4 bg-wa-bg-search border-none rounded-xl text-sm text-wa-text-primary placeholder:text-wa-text-secondary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
              />
            </div>

            <button 
              onClick={handleReport}
              disabled={!reportReason.trim()}
              className="w-full py-3 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              Submit Report
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
