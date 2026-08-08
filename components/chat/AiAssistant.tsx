"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect, FormEvent } from "react";
import { Bot, X, Send, User, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const chat = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isBusy = chat.status === "streaming" || chat.status === "submitted";

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages, isBusy]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isBusy) return;
    setInputValue("");
    await chat.sendMessage({ text: trimmed });
  };



  // Helper to extract text from a message
  const getMessageText = (message: any): string => {
    // v7 format: parts array
    if (message.parts && Array.isArray(message.parts)) {
      const texts = message.parts
        .filter((part: any) => part.type === "text")
        .map((part: any) => part.text || "");
      if (texts.length > 0) return texts.join("");
    }
    // Fallback: content string
    if (typeof message.content === "string") {
      return message.content;
    }
    // Fallback: content array (some formats use this)
    if (Array.isArray(message.content)) {
      return message.content
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text || "")
        .join("");
    }
    return "";
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors z-50 flex items-center justify-center gap-2"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ display: isOpen ? "none" : "flex" }}
      >
        <Sparkles size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-96 h-[32rem] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center shadow-md">
              <div className="flex items-center gap-2">
                <Bot size={24} />
                <div>
                  <h3 className="font-semibold">CounselConnect AI</h3>
                  <p className="text-xs text-blue-100">Smart Mentoring Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {chat.messages.length === 0 && (
                <div className="text-center text-gray-400 mt-10">
                  <Bot size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Hi! I&apos;m your AI Assistant.</p>
                  <p className="text-sm">How can I help you today?</p>
                </div>
              )}
              
              {chat.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                      m.role === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 opacity-70 text-xs font-medium">
                      {m.role === "user" ? (
                        <>You <User size={12} /></>
                      ) : (
                        <><Bot size={12} /> AI</>
                      )}
                    </div>
                    {m.role === "user" ? (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {getMessageText(m)}
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none text-gray-800 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:text-base [&_h1]:font-bold [&_h1]:my-1.5 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:my-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:my-1 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-gray-100 [&_pre]:p-2 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:text-xs [&_a]:text-blue-600 [&_a]:underline [&_strong]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-blue-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-1">
                        <ReactMarkdown>{getMessageText(m)}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isBusy && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm rounded-bl-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={onSubmit} className="p-3 bg-white border-t border-gray-100">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border-none rounded-full focus:ring-2 focus:ring-blue-100 focus:outline-none text-sm transition-shadow"
                  disabled={isBusy}
                />
                <button
                  type="submit"
                  disabled={isBusy || !inputValue.trim()}
                  className="absolute right-1 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
