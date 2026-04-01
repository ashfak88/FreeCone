"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";

interface MessageInputProps {
  conversationId?: string;
  recipientId?: string;
}

export default function MessageInput({ conversationId, recipientId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { user, addMessage, updateConversationLocally, fetchConversations, setActiveConversation, conversations } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '42px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + 'px';
    }
  }, [content]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "👋", "🤚", "🖐", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦵", "🦿", "👣", "👂", "🦻", "👃", "🧠", "🦷", "🦴", "👀", "👁", "👅", "👄", "💋", "🩸", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "🆔", "⚛️", "🉑", "☢️", "☣️", "📴", "📳", "🈶", "🈚", "🈸", "🈺", "🈷️", "✴️", "🆚", "💮", "🉐", "㊙️", "㊗️", "🈴", "🈵", "🈹", "🈲", "🅰️", "🅱️", "🆎", "🆑", "🅾️", "🆘", "❌", "⭕", "🛑", "⛔", "📛", "🚫", "💯", "💢", "♨️", "🚷", "🚯", "🚳", "🚱", "🔞", "📵", "🚭", "❗", "❕", "❓", "❔", "‼️", "⁉️", "🔅", "🔆", "〽️", "⚠️", "🚸", "🔱", "⚜️", "🔰", "♻️", "✅", "🈯", "💹", "❇️", "✳️", "❎", "🌐", "💠", "Ⓜ️", "🌀", "💤", "🏧", "🚾", "♿", "🅿️", "🈳", "🈂️", "🛂", "🛃", "🛄", "🛅", "🚹", "🚺", "🚼", "🚻", "🚮", "🅿️", "📶", "🎦", "🈁", "🔡", "🔤", "🔣", "ℹ️", "🔠", "🔤", "🆙", "🆒", "🆓", "🔟", "🔢", "▶️", "⏸", "⏯", "⏹", "⏺", "⏭", "⏮", "⏩", "⏪", "⏫", "⏬", "◀️", "🔼", "🔽", "➡️", "⬅️", "⬆️", "⬇️", "↗️", "↘️", "↙️", "↖️", "↕️", "↔️", "↪️", "↩️", "⤴️", "⤵️", "🔀", "🔁", "🔂", "🔄", "🔃", "🎵", "🎶", "➕", "➖", "➗", "✖️", "♾️", "💲", "💱", "™️", "©️", "®️", "〰️", "➰", "➿", "🔚", "🔙", "🔛", "🔝", "🔜", "✔️", "☑️", "🔘", "⚪", "⚫", "🔴", "🔵", "🟤", "🟣", "🟢", "🟡", "🟠", "🟥", "🟦", "🟧", "🟨", "🟩", "🟪", "⬛", "⬜", "🟫", "📁", "📂", "📅", "📆", "🗒", "🗓", "📇", "📈", "📉", "📊", "📋", "📌", "📍", "📎", "🖇", "📏", "📐", "✂️", "🗃", "🗄", "🗑"
  ];

  const onEmojiClick = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;
    const newText = text.substring(0, start) + emoji + text.substring(end);
    
    setContent(newText);
    
    // Set cursor position after the emoji
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    }, 0);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isSending) return;
    setShowEmojiPicker(false);

    if (!conversationId && !recipientId) {
      console.warn("   [SEND] Aborted: No conversationId or recipientId found.");
      toast.error("Contact information missing. Please refresh.");
      return;
    }

    setIsSending(true);
    const loadingToast = toast.loading("Sending message...");
    const api_url = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/$/, ""); 
    const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;

    try {
      console.log("   [SEND] Attempting send:", { conversationId, recipientId, contentSize: content.length });
      
      if (!token) {
        toast.error("Your session has expired. Please log in again.", { id: loadingToast });
        return;
      }

      const res = await fetch(`${api_url}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: recipientId || undefined,
          content: content.trim(),
          conversationId: conversationId || undefined,
        }),
      });

      const responseText = await res.text();
      let responseData: any = { message: "Incompatible server response" };
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.warn("   [SEND] Failed to parse JSON, raw response:", responseText);
      }

      if (res.ok) {
        console.log("   [SEND] Success:", responseData);
        toast.success("Message sent", { id: loadingToast });
        
        addMessage(responseData);

        updateConversationLocally({
          _id: responseData.conversationId,
          participants: [],
          lastMessage: responseData,
          updatedAt: new Date().toISOString(),
        } as any);

        // Transition from Temp to Persistent
        if (recipientId && !conversationId) {
          await fetchConversations();
          const updatedConversations = useStore.getState().conversations;
          const newConv = updatedConversations.find(c => c._id === responseData.conversationId);
          if (newConv) {
            setActiveConversation(newConv);
            window.history.replaceState(null, "", "/messages");
          }
        }

        setContent("");
        textareaRef.current?.focus();
      } else if (res.status === 401) {
        console.error("   [SEND] Unauthorized Error (401). Token may be expired.");
        toast.error("Your session has expired. Please log out and log back in.", { id: loadingToast, duration: 6000 });
        // Optional: clear invalid token if you want to force logout on next refresh
        // localStorage.removeItem("accessToken");
      } else {
        console.error("   [SEND] API Error Status:", res.status);
        console.error("   [SEND] API Error Body:", responseData);
        console.error("   [SEND] API Error Raw:", responseText);
        
        const errorMsg = responseData.message || responseData.error || responseText.substring(0, 100) || "Failed to send";
        toast.error(`Error: ${errorMsg}`, { id: loadingToast });
      }
    } catch (err) {
      console.error("   [SEND] System Error:", err);
      toast.error("Connection error. Check your internet.", { id: loadingToast });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-2 bg-wa-bg-sidebar border-t border-wa-bg-search/5 select-none z-20 relative">
      {/* Emoji Picker Overlay */}
      {showEmojiPicker && (
        <div 
          ref={emojiPickerRef}
          className="absolute bottom-full left-4 mb-2 w-72 h-80 bg-white dark:bg-[#233138] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-[100]"
        >
          <div className="p-3 border-b border-slate-100 dark:border-slate-700">
            <h4 className="text-[13px] font-bold text-primary uppercase tracking-wider">Emojis</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-2 scrollbar-none">
            <div className="grid grid-cols-8 gap-1">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => onEmojiClick(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-xl hover:bg-wa-bg-search/50 rounded-lg transition-colors active:scale-90"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-screen-2xl mx-auto flex items-center gap-4">
        {/* Attachment & Emoji Icons */}
        <div className="flex items-center gap-1 text-wa-text-secondary">
          <button 
             type="button" 
             onClick={() => setShowEmojiPicker(!showEmojiPicker)}
             className={`p-1.5 hover:bg-wa-bg-search/40 rounded-full transition-colors active:scale-95 ${showEmojiPicker ? 'text-primary bg-wa-bg-search/40' : ''}`}
             title="Emoji"
          >
             <span className="material-symbols-outlined text-2xl">sentiment_satisfied</span>
          </button>
          <button 
             type="button" 
             className="p-1.5 hover:bg-wa-bg-search/40 rounded-full transition-colors active:scale-95"
             title="Add"
          >
             <span className="material-symbols-outlined text-2xl">add</span>
          </button>
        </div>

        {/* Input Bar */}
        <div className="flex-1 relative bg-wa-bg-search flex items-center rounded-lg px-3 py-1.5 focus-within:ring-0 transition-all">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-wa-text-primary placeholder:text-wa-text-secondary min-h-[42px] max-h-32 py-2 px-1 resize-none font-normal leading-normal custom-scrollbar"
          />
        </div>

        {/* Send Button */}
        <div className="flex items-center justify-center shrink-0">
           <button
              onClick={() => handleSend()}
              disabled={!content.trim() || isSending}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-90 ${
                content.trim() && !isSending 
                  ? "bg-wa-check-blue text-white shadow-lg shadow-wa-check-blue/20 hover:scale-105" 
                  : "bg-wa-bg-search text-wa-text-secondary opacity-50 cursor-not-allowed shadow-none"
              }`}
              title="Send message"
           >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              )}
           </button>
        </div>
      </div>
    </div>
  );
}
