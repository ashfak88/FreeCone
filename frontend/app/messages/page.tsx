"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import DashboardHeader from "@/components/DashboardHeader";
import { useStore } from "@/lib/store";
import { socketService } from "@/lib/socket";

function MessagesContent() {
  const { 
    fetchConversations, 
    conversations,
    activeConversation, 
    addMessage, 
    updateConversationLocally, 
    user, 
    setActiveConversation,
    setTempParticipant,
    talent,
    fetchTalent
  } = useStore();
  
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("userId");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Initial fetch and Socket setup
  useEffect(() => {
    fetchConversations();
    if (talent.length === 0) fetchTalent();

    if (user) {
      const userId = user._id || user.id;
      const socket = socketService.connect();
      socketService.joinRoom(userId);

      // Listen for new messages
      const handleNewMessage = (message: any) => {
        console.log("   [MESSAGES] Received new message via socket:", message);
        addMessage(message);

        // Update the conversation list
        updateConversationLocally({
          _id: message.conversationId,
          participants: [], 
          lastMessage: message,
          updatedAt: new Date().toISOString(),
        } as any);
      };

      const handleNewConversation = (conversation: any) => {
        console.log("   [MESSAGES] Received new conversation via socket:", conversation);
        updateConversationLocally(conversation);
      };

      socket.on("newMessage", handleNewMessage);
      socket.on("newConversation", handleNewConversation);

      return () => {
        socket.off("newMessage", handleNewMessage);
        socket.off("newConversation", handleNewConversation);
      };
    }
  }, [fetchConversations, fetchTalent, talent.length, user, addMessage, updateConversationLocally]);

  // Handle target user from URL
  useEffect(() => {
    if (targetUserId && (conversations.length > 0 || talent.length > 0)) {
      const existingConv = conversations.find(c => 
        c.participants.some(p => p._id === targetUserId || p.id === targetUserId)
      );

      if (existingConv) {
        setActiveConversation(existingConv);
      } else {
        const targetUser = talent.find(t => t._id === targetUserId || t.id === targetUserId);
        if (targetUser) {
          setTempParticipant(targetUser);
        }
      }
    }
  }, [targetUserId, conversations, talent, setActiveConversation, setTempParticipant]);

  // Handle mobile view switching
  useEffect(() => {
    if (activeConversation) {
      setIsSidebarVisible(false);
    } else {
      setIsSidebarVisible(true);
    }
  }, [activeConversation]);

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <main className="flex-1 w-full flex items-center justify-center overflow-hidden">
        <div className="flex w-full h-full bg-white dark:bg-slate-900 overflow-hidden relative animate-in fade-in duration-500">
          {/* Sidebar */}
          <div className={`${isSidebarVisible ? "flex" : "hidden"} md:flex w-full md:w-80 lg:w-[380px] h-full shrink-0 border-r border-slate-100 dark:border-slate-800`}>
            <ChatSidebar />
          </div>

          {/* Main Chat Area */}
          <div className={`${!isSidebarVisible ? "flex" : "hidden"} md:flex flex-1 h-full bg-slate-50 dark:bg-[#0a1014] relative`}>
            <ChatWindow />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
