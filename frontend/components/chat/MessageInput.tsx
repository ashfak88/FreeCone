"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";
import { Mic, Send, Square, Trash2, Smile } from "lucide-react";

interface MessageInputProps {
  conversationId?: string;
  recipientId?: string;
}

export default function MessageInput({ conversationId, recipientId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { user, addMessage, removeMessage, updateConversationLocally, fetchConversations, setActiveConversation, conversations } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
      if (!token) {
        toast.error("Your session has expired. Please log in again.", { id: loadingToast });
        return;
      }

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        _id: tempId,
        conversationId: conversationId || "temp",
        content: content.trim(),
        sender: user, // Use full user object for avatar rendering
        createdAt: new Date().toISOString(),
        readBy: [user?._id || user?.id],
        type: 'text',
        metadata: { status: 'sending', tempId }
      };

      addMessage(optimisticMessage as any);
      setContent("");
      textareaRef.current?.focus();

      const res = await fetch(`${api_url}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: recipientId || undefined,
          content: optimisticMessage.content,
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
        // addMessage will now replace the optimistic one using tempId
        addMessage({ ...responseData, metadata: { ...responseData.metadata, tempId } });

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
      } else {
        // Remove optimistic message on failure
        removeMessage(tempId);
        setContent(optimisticMessage.content); // Restore content for retry

        if (res.status === 401) {
          console.error("   [SEND] Unauthorized Error (401). Token may be expired.");
          toast.error("Your session has expired. Please log out and log back in.", { duration: 6000 });
        } else {
          console.error("   [SEND] API Error Status:", res.status);
          const errorMsg = responseData.message || responseData.error || responseText.substring(0, 100) || "Failed to send";
          toast.error(`Error: ${errorMsg}`);
        }
      }
    } catch (err) {
      console.error("   [SEND] System Error:", err);
      toast.error("Connection error. Check your internet.", { id: loadingToast });
    } finally {
      setIsSending(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        if (audioChunks.current.length > 0) {
          await sendVoiceMessage(audioBlob);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("   [RECORD] Failed to start:", err);
      toast.error("Format error or microphone permission denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder) {
      audioChunks.current = [];
      mediaRecorder.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    if (audioChunks.current.length === 0) return;

    setIsSending(true);
    const loadingToast = toast.loading("Sending voice message...");
    const api_url = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/$/, "");
    const token = localStorage.getItem("accessToken");

    const tempId = `temp-voice-${Date.now()}`;
    try {
      // 0. Add optimistic voice message
      const optimisticVoice = {
        _id: tempId,
        conversationId: conversationId || "temp",
        content: URL.createObjectURL(audioBlob), // Local preview
        sender: user, // Use full user object for avatar rendering
        createdAt: new Date().toISOString(),
        readBy: [user?._id || user?.id],
        type: 'voice',
        metadata: { status: 'sending', tempId }
      };
      addMessage(optimisticVoice as any);

      // 1. Upload the audio file
      const formData = new FormData();
      formData.append("voice", audioBlob, "voice_message.webm");

      const uploadRes = await fetch(`${api_url}/upload/voice-message`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const { audioUrl } = await uploadRes.json();

      // 2. Send the message
      const res = await fetch(`${api_url}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: recipientId || undefined,
          content: audioUrl,
          type: "voice",
          conversationId: conversationId || undefined,
        }),
      });

      const responseData = await res.json();
      if (res.ok) {
        addMessage({ ...responseData, metadata: { ...responseData.metadata, tempId } });
        updateConversationLocally({
          _id: responseData.conversationId,
          lastMessage: responseData,
          updatedAt: new Date().toISOString(),
        } as any);
      } else {
        throw new Error(responseData.message || "Failed to send");
      }
    } catch (err: any) {
      console.error("   [VOICE SEND] Error:", err);
      removeMessage(tempId);
      toast.error(err.message || "Failed to send voice message");
    } finally {
      setIsSending(false);
      setMediaRecorder(null);
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

      <div className="max-w-screen-2xl mx-auto flex items-center gap-3">
        {/* Emoji Icon */}
        <div className="flex items-center text-wa-text-secondary shrink-0">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 hover:bg-wa-bg-search/40 rounded-full transition-colors active:scale-95 ${showEmojiPicker ? 'text-primary bg-wa-bg-search/40' : ''}`}
            title="Emoji"
          >
            <Smile className="size-6" />
          </button>
        </div>

        {/* Input Bar & Recording UI */}
        <div
          onClick={() => textareaRef.current?.focus()}
          className="flex-1 relative bg-wa-bg-sidebar/50 dark:bg-wa-bg-search flex items-center rounded-xl px-4 py-2 transition-all min-h-[48px] cursor-text"
        >
          {isRecording ? (
            <div className="flex-1 flex items-center gap-4 px-1 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-[15px] font-bold text-wa-text-primary tabular-nums">
                  {Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, '0')}
                </span>
              </div>
              <div className="flex-1 text-wa-text-secondary text-[14px]">Recording...</div>
              <button
                onClick={(e) => { e.stopPropagation(); cancelRecording(); }}
                className="p-2 hover:bg-red-500/10 rounded-full text-wa-text-secondary hover:text-red-500 transition-all active:scale-90"
                title="Cancel"
              >
                <Trash2 className="size-5" />
              </button>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message"
              className="w-full bg-transparent border-none focus:ring-0 outline-none text-[15px] text-wa-text-primary placeholder:text-wa-text-secondary py-1 px-0 resize-none font-normal leading-normal scrollbar-none overflow-hidden"
              rows={1}
              style={{ minHeight: '24px', maxHeight: '120px' }}
            />
          )}
        </div>

        {/* Action Button: Send or Microphone */}
        <div className="flex items-center justify-center shrink-0">
          {(content.trim() || isRecording) ? (
            <button
              onClick={() => {
                console.log("   [UI] Action button clicked: isRecording=", isRecording);
                isRecording ? stopRecording() : handleSend();
              }}
              disabled={isSending}
              style={{ backgroundColor: (content.trim() || isRecording) && !isSending ? '#6A6B4C' : '#202c33' }}
              className={`flex items-center justify-center size-12 rounded-full transition-all active:scale-90 shadow-lg text-white ${(content.trim() || isRecording) && !isSending ? "hover:scale-105" : "opacity-50 cursor-not-allowed"
                }`}
              title={isRecording ? "Stop recording" : "Send message"}
            >
              {isSending ? (
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isRecording ? (
                <Square className="size-5 fill-current" />
              ) : (
                <Send className="size-5 fill-current ml-0.5" />
              )}
            </button>
          ) : (
            <button
              onClick={() => {
                console.log("   [UI] Microphone button clicked");
                startRecording();
              }}
              style={{ backgroundColor: '#6A6B4C' }}
              className="flex items-center justify-center size-12 text-white rounded-full shadow-lg hover:scale-105 transition-all active:scale-95 cursor-pointer"
              title="Record voice message"
            >
              <Mic size={24} color="white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

