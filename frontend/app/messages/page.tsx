"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { useStore } from "@/lib/store";
import { socketService } from "@/lib/socket";
import ProtectedRoute from "@/components/ProtectedRoute";

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
        } else {
            // If talent not loaded yet, wait or do nothing
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
    <div className="flex flex-col h-[100dvh] bg-slate-100 dark:bg-[#0a1014] overflow-hidden sm:p-4 lg:p-6 xl:px-24">
      <main className="flex-1 flex overflow-hidden sm:rounded-[24px] shadow-2xl border-none sm:border sm:border-slate-200 dark:sm:border-slate-800/50 relative">
        <div className="flex w-full h-full bg-wa-bg-sidebar overflow-hidden">
          {/* Sidebar */}
          <div className={`${isSidebarVisible ? "flex" : "hidden"} md:flex w-full md:w-80 lg:w-[400px] h-full shrink-0 border-r border-wa-bg-search/50`}>
            <ChatSidebar />
          </div>

          {/* Main Chat Area */}
          <div className={`${!isSidebarVisible ? "flex" : "hidden"} md:flex flex-1 h-full bg-wa-bg-main relative`}>
            <ChatWindow />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-wa-bg-sidebar">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wa-check-blue"></div>
        </div>
      }>
        <MessagesContent />
      </Suspense>
    </ProtectedRoute>
  );
}
