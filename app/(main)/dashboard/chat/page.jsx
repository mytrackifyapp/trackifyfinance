"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInsights } from "@/actions/ai";
import useFetch from "@/hooks/use-fetch";
import { useCurrency } from "@/components/currency-provider";
import { ArrowUp, Send, User2 } from "lucide-react";

export default function ChatWithAIPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I&apos;m Finna, your intelligent financial assistant. I&apos;m here to help you understand your finances, get personalized insights, and answer your questions—just like talking to a friend. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingIntervalRef = useRef(null);
  const processedReplyRef = useRef(null);

  const { currency } = useCurrency();
  const { loading, data, fn } = useFetch(getInsights);

  const onSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    
    // Clear any existing typing
    setIsTyping(false);
    setDisplayedText("");
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    await fn({ messages: next.slice(-10), currency });
  };

  // Handle new AI response with typewriter effect
  useEffect(() => {
    if (data?.reply && data.reply !== processedReplyRef.current) {
      processedReplyRef.current = data.reply;
      const fullText = data.reply;
      
      if (!fullText || !fullText.trim()) {
        return;
      }

      // Clear any existing typing
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }

      setIsTyping(true);
      setDisplayedText("");
      let currentIndex = 0;

      // Typewriter effect with variable speed
      const typeNextChar = () => {
        if (currentIndex < fullText.length) {
          const char = fullText[currentIndex];
          // Variable delay: faster for spaces, slower for punctuation
          const delay = char === ' ' ? 3 : char.match(/[.,!?;:]/) ? 20 : 8;
          
          setDisplayedText(fullText.slice(0, currentIndex + 1));
          currentIndex++;
          
          typingIntervalRef.current = setTimeout(typeNextChar, delay);
        } else {
          // Finished typing
          setIsTyping(false);
          // Add complete message to messages array
          setMessages((msgs) => {
            // Prevent duplicates
            const lastMessage = msgs[msgs.length - 1];
            if (lastMessage?.role === "assistant" && lastMessage?.content === fullText) {
              return msgs;
            }
            return [...msgs, { role: "assistant", content: fullText }];
          });
          setDisplayedText("");
          typingIntervalRef.current = null;
        }
      };

      // Start typing
      typeNextChar();

      return () => {
        if (typingIntervalRef.current) {
          clearTimeout(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
      };
    }
  }, [data]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearTimeout(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, []);

  // Auto-scroll - only when messages or typing state changes, not on input changes
  const messagesLength = messages.length;
  useEffect(() => {
    // Use requestAnimationFrame to prevent flickering during scroll
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }
    });
  }, [messagesLength, displayedText, loading]);

  // Lightweight formatter for assistant output: style section headers and bullets
  const renderAssistant = useMemo(() => {
    const AssistantRenderer = (text) => {
    if (!text || text.trim() === "") {
      return null;
    }
    
    const lines = text.split("\n");
    return (
      <div className="space-y-2">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          const isHeader =
            trimmed.length > 0 &&
            trimmed === trimmed.toUpperCase() &&
            !trimmed.startsWith("-") &&
            !trimmed.includes(":");
          const isBullet = trimmed.startsWith("- ");
          if (isHeader) {
            return (
              <div key={idx} className="text-[10px] tracking-widest text-[#C1FF72]/80 mt-3 font-semibold">
                {trimmed}
              </div>
            );
          }
          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[#C1FF72] to-[#A8E063] shrink-0" />
                <span className="text-gray-900/90 leading-relaxed">{trimmed.slice(2)}</span>
              </div>
            );
          }
          return (
            <div key={idx} className="text-sm text-gray-900/90 leading-relaxed">
              {trimmed || <span className="opacity-0">.</span>}
            </div>
          );
        })}
      </div>
    );
    };
    AssistantRenderer.displayName = "AssistantRenderer";
    return AssistantRenderer;
  }, []);

  const Message = React.memo(function Message({ role, content }) {
    const isAssistant = role === "assistant";
    return (
      <div className={`flex items-start gap-3 ${isAssistant ? "" : "justify-end"}`}>
        {isAssistant && (
          <div className="mt-1">
            <Image 
              src="/finna.png" 
              alt="Finna" 
              width={40} 
              height={40} 
              className="object-contain"
            />
          </div>
        )}
        <div
          className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-sm leading-relaxed shadow-lg backdrop-blur-sm transition-all ${
            isAssistant
              ? "bg-gradient-to-br from-[#C1FF72]/10 via-[#C1FF72]/5 to-[#A8E063]/10 text-gray-900 border border-[#C1FF72]/30"
              : "bg-white/90 text-gray-900 border border-gray-200/50 shadow-gray-200/20"
          }`}
        >
          {isAssistant ? (
            renderAssistant(content)
          ) : (
            <div className="whitespace-pre-wrap">{content}</div>
          )}
        </div>
        {!isAssistant && (
          <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white shadow-lg">
            <User2 size={14} />
          </div>
        )}
      </div>
    );
  });

  const suggestions = useMemo(
    () => [
      "Summarize my spending by category this month",
      "Am I close to my monthly budget?",
      "Top 3 expenses recently",
    ],
    []
  );

  // Memoize messages to prevent re-renders when input changes
  const memoizedMessages = useMemo(() => messages, [messages]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        {/* Header removed per user request */}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-[75vh] flex flex-col overflow-hidden backdrop-blur supports-[backdrop-filter]:bg-white/40 border-[#C1FF72]/30 shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-[#C1FF72]/10 via-[#C1FF72]/5 to-[#A8E063]/10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Image 
                  src="/finna.png" 
                  alt="Finna" 
                  width={48} 
                  height={48} 
                  className="object-contain"
                />
                <div>
                  <CardTitle className="text-lg gradient-title">
                    Finna
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden bg-gradient-to-b from-white/50 to-[#C1FF72]/5">
              <div ref={scrollRef} className="h-full overflow-auto p-6 space-y-5">
                {memoizedMessages.map((m, idx) => (
                  <Message key={`msg-${idx}-${m.content?.slice(0, 20)}`} role={m.role} content={m.content} />
                ))}
                
                {/* Typing message with cursor */}
                {isTyping && displayedText && (
                  <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="mt-1">
                      <Image 
                        src="/finna.png" 
                        alt="Finna" 
                        width={40} 
                        height={40} 
                        className="object-contain"
                      />
                    </div>
                    <div className="max-w-[85%] rounded-3xl px-5 py-3.5 text-sm leading-relaxed shadow-lg backdrop-blur-sm bg-gradient-to-br from-[#C1FF72]/10 via-[#C1FF72]/5 to-[#A8E063]/10 text-gray-900 border border-[#C1FF72]/30">
                      <div className="relative">
                        {renderAssistant(displayedText)}
                        <span className="inline-block w-0.5 h-4 ml-1 bg-[#C1FF72] align-middle" style={{ animation: 'blink 1s infinite' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Loading indicator - only show when loading and not typing */}
                {loading && !isTyping && (
                  <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="mt-1">
                      <Image 
                        src="/finna.png" 
                        alt="Finna" 
                        width={40} 
                        height={40} 
                        className="object-contain animate-pulse"
                      />
                    </div>
                    <div className="rounded-3xl px-5 py-3.5 text-sm bg-gradient-to-br from-[#C1FF72]/10 via-[#C1FF72]/5 to-[#A8E063]/10 text-gray-900 border border-[#C1FF72]/30 shadow-lg">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-gradient-to-br from-[#C1FF72] to-[#A8E063] animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 rounded-full bg-gradient-to-br from-[#C1FF72] to-[#A8E063] animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 rounded-full bg-gradient-to-br from-[#C1FF72] to-[#A8E063] animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="mt-4">
            <div className="rounded-3xl border-2 border-[#C1FF72]/30 bg-gradient-to-br from-white/80 to-[#C1FF72]/10 backdrop-blur-md px-4 py-3 shadow-lg shadow-[#C1FF72]/10 focus-within:ring-2 focus-within:ring-[#C1FF72]/50 focus-within:border-[#C1FF72]/70 transition-all">
              <div className="flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSend();
                    }
                  }}
                  rows={1}
                  placeholder="Ask Finna anything about your finances..."
                  className="min-h-[44px] max-h-[120px] w-full resize-none bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-gray-400"
                />
                <Button 
                  onClick={onSend} 
                  disabled={loading || !input.trim()} 
                  size="icon" 
                  className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#C1FF72] to-[#A8E063] hover:from-[#A8E063] hover:to-[#8FD460] text-white shadow-lg shadow-[#C1FF72]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? <ArrowUp size={18} className="animate-pulse" /> : <Send size={18} />}
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="text-xs rounded-full border border-[#C1FF72]/30 bg-gradient-to-br from-[#C1FF72]/10 to-[#A8E063]/5 px-4 py-1.5 text-gray-700 hover:text-gray-900 hover:border-[#C1FF72]/50 hover:bg-gradient-to-br hover:from-[#C1FF72]/20 hover:to-[#A8E063]/10 transition-all shadow-sm hover:shadow-md"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-[#C1FF72]/30 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#C1FF72]/10 via-[#C1FF72]/5 to-[#A8E063]/10">
              <CardTitle className="text-lg">
                Quick Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              {[
                "How did I spend this month by category?",
                "What are my biggest expenses recently?",
                "Am I close to my monthly budget?",
                "Which account has the highest activity?",
              ].map((s, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="w-full justify-start border-[#C1FF72]/30 hover:bg-gradient-to-br hover:from-[#C1FF72]/10 hover:to-[#A8E063]/5 hover:border-[#C1FF72]/50 hover:text-gray-900 transition-all text-left"
                  onClick={() => setInput(s)}
                >
                  {s}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
