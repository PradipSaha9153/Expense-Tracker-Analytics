import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  ChevronDown, 
  MessageSquare,
  TrendingDown,
  PieChart,
  ShieldAlert,
  HelpCircle,
  Flame
} from 'lucide-react';
import { api } from '../services/api';

export default function FinancialAssistant({ currency = '₹', timeFilter = 'all' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "👋 Hi! I'm your **Xpenzic Financial Copilot**.\n\nI can analyze your live ledger in real-time. Ask me things like:\n• *\"Where is my money gone mostly?\"*\n• *\"How much did I spend this month?\"*\n• *\"What was my biggest expense?\"*\n• *\"Am I over budget?\"*",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askAssistant(userMsg.text, currency, timeFilter);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: res.reply || "I analyzed your ledger, but couldn't find a direct match. Try asking: *'Where did my money go mostly?'* or *'How much did I spend this month?'*",
        time: res.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Assistant error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "⚠️ Sorry, I encountered a temporary connection issue. Please make sure the backend is active.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: "🧹 Chat cleared! What would you like to know about your expenses?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Quick suggestion prompts
  const suggestions = [
    { label: "Where is my money gone mostly?", icon: "📊" },
    { label: "How much did I spend this month?", icon: "💳" },
    { label: "What is my biggest expense?", icon: "🏆" },
    { label: "Am I over budget on anything?", icon: "⚠️" },
    { label: "What is my savings rate & runway?", icon: "💰" },
    { label: "How can I save more money?", icon: "💡" },
  ];

  // Helper to render bold markdown and line breaks cleanly
  const renderFormattedText = (rawText) => {
    const lines = rawText.split('\n');
    return lines.map((line, lIdx) => {
      // Split on **bold** syntax
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={lIdx} className={`${line.trim() === '' ? 'h-2' : 'min-h-[1.25rem]'}`}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return (
                <em key={pIdx} className="italic text-slate-700">
                  {part.slice(1, -1)}
                </em>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <>
      {/* 1. Floating Trigger Pill (Bottom-Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center space-x-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-brand-600 to-teal-700 text-white font-bold text-xs shadow-xl shadow-brand-900/25 hover:shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
          >
            <span className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm group-hover:rotate-12 transition-transform">
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </span>
            <span className="tracking-wide">Ask Financial AI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          </button>
        </div>
      )}

      {/* 2. Glassmorphic Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[410px] h-[560px] max-h-[85vh] bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-800 via-brand-700 to-teal-800 px-4 py-3.5 text-white flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xs">
                  <Bot className="w-5 h-5 text-teal-300" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-brand-800" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Xpenzic AI Copilot</h3>
                <p className="text-[10px] text-teal-200 font-medium">Live Financial Intelligence Engine</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleClearChat}
                title="Clear Conversation"
                className="p-1.5 rounded-xl hover:bg-white/10 text-teal-200 hover:text-white transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="p-1.5 rounded-xl hover:bg-white/10 text-teal-200 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-slate-50/90 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s.label)}
                disabled={loading}
                className="shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 hover:border-brand-400 hover:bg-brand-50/50 text-[11px] font-semibold text-slate-700 hover:text-brand-800 transition shadow-xs active:scale-95"
              >
                <span>{s.icon}</span>
                <span className="whitespace-nowrap">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start space-x-2 ${
                  m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    m.sender === 'user' 
                      ? 'bg-slate-800 text-white' 
                      : 'bg-brand-50 text-brand-700 border border-brand-200/60'
                  }`}
                >
                  {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[82%] rounded-2xl p-3 shadow-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-brand-600 to-emerald-700 text-white font-medium rounded-tr-xs'
                      : 'bg-slate-50 border border-slate-200/70 text-slate-700 rounded-tl-xs'
                  }`}
                >
                  <div className="text-[12px] whitespace-pre-wrap">
                    {renderFormattedText(m.text)}
                  </div>
                  <span
                    className={`block text-[9px] mt-1.5 text-right ${
                      m.sender === 'user' ? 'text-emerald-200/80' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-start space-x-2">
                <div className="w-7 h-7 rounded-xl bg-brand-50 text-brand-700 border border-brand-200/60 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-semibold text-slate-400 ml-2">Analyzing live ledger...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-1.5 focus-within:bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10 transition">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask e.g. Where is my money gone mostly?..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="flex-1 bg-transparent border-none outline-none text-xs text-slate-800 placeholder:text-slate-400 font-medium"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white transition shadow-xs active:scale-95 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-1.5">
              Powered by Xpenzic Financial Analytics Engine
            </p>
          </div>
        </div>
      )}
    </>
  );
}

