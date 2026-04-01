"use client";

import React, { useEffect, useRef, useState } from "react";
import { useStore, Conversation, User, Message } from "@/lib/store";
import MessageInput from "./MessageInput";
import { format, isToday, isYesterday } from "date-fns";

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
      {/* WhatsApp Chat Header */}
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
          <button className="hover:text-wa-text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">more_vert</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Area with Pattern */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-10 py-6 flex flex-col gap-1 relative scroll-smooth custom-scrollbar"
        style={{
           backgroundImage: `url("https://w0.peakpx.com/wallpaper/580/630/wallpaper-dark-background-whatsapp-doodle-patterns-thumbnail.jpg")`,
           backgroundSize: '400px',
           backgroundBlendMode: 'overlay',
        }}
      >
        {/* Overlay to dim the background slightly */}
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
                       className={`relative px-2 py-1.5 min-w-[80px] max-w-[85%] sm:max-w-[65%] shadow-sm ${
                         isMe 
                           ? "bg-wa-bubble-sent text-wa-text-primary rounded-lg rounded-tr-none" 
                           : "bg-wa-bubble-received text-wa-text-primary rounded-lg rounded-tl-none"
                       }`}
                    >
                       {/* Triangle tails */}
                       <div className={`absolute top-0 w-2 h-4 overflow-hidden transform ${
                         isMe ? "right-[-7px] rotate-0" : "left-[-7px] rotate-0"
                       }`}>
                          <div className={`w-4 h-4 transform rotate-45 translate-y-[-2px] ${
                            isMe ? "bg-wa-bubble-sent translate-x-[-10px]" : "bg-wa-bubble-received translate-x-[4px]"
                          }`}></div>
                       </div>

                       <div className={`relative flex flex-col pb-[2px] pt-[2px] min-w-[85px] max-w-full ${isMe ? 'pr-[70px]' : 'pr-[50px]'}`}>
                          <span className="text-[14.2px] leading-snug break-words whitespace-pre-wrap inline-block">
                            {msg.content}
                          </span>
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

      {/* WhatsApp Input Area */}
      <MessageInput 
        conversationId={activeConversation?._id} 
        recipientId={!activeConversation ? otherUser?._id || otherUser?.id : undefined} 
      />
    </div>
  );
}
