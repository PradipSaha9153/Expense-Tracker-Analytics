import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX,
  MessageSquare,
  TrendingDown,
  PieChart,
  ShieldAlert,
  HelpCircle,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import RobotAvatar from './RobotAvatar';

export default function FinancialAssistant({ currency = '₹', timeFilter = 'all' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);
  const [activeTab, setActiveTab] = useState('popular');
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        setAvailableVoices(v);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const getBotMessageMood = (text) => {
    if (!text) return 'happy';
    const lower = text.toLowerCase();
    if (lower.includes('affordable') || lower.includes('safe to buy') || lower.includes('healthy') || lower.includes('great')) {
      return 'love';
    }
    if (lower.includes('sparkle') || lower.includes('congratulations') || lower.includes('optimal') || lower.includes('surplus')) {
      return 'sparkle';
    }
    if (lower.includes('₹') || lower.includes('burn rate') || lower.includes('spent') || lower.includes('runway') || lower.includes('highest')) {
      return 'money';
    }
    if (lower.includes('caution') || lower.includes('warning') || lower.includes('exceed') || lower.includes('deficit')) {
      return 'thinking';
    }
    return 'happy';
  };

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "👋 Hi! I'm your **Xpenzic Financial Assistant**.\n\nI can analyze your live ledger in real-time. Ask me questions like:\n• *\"Where is my money gone mostly?\"*\n• *\"Can I afford a ₹15,000 purchase?\"*\n• *\"How much did I spend on Food?\"*\n• *\"Compare this month vs last month\"*",
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
    } else {
      // Stop speech if closed
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
      }
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
        text: res.reply || "I analyzed your ledger, but couldn't find a direct match. Try asking: *'Where did my money go mostly?'* or *'How much did I spend on Food?'*",
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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: "🧹 Conversation cleared! What would you like to analyze next in your finances?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleCopy = (id, text) => {
    // Strip markdown formatting for clean clipboard text
    const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '');
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id, text) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text and adapt currency symbols for clear, natural pronunciation
    let cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/•/g, ', ')
      .replace(/[🥇🥈🥉]/g, '')
      .replace(/₹/g, ' rupees ')
      .replace(/\$/g, ' dollars ')
      .replace(/€/g, ' euros ');

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Pick highest quality male English voice available
    if (availableVoices.length > 0) {
      const maleVoice = availableVoices.find((v) => {
        const n = v.name.toLowerCase();
        const isEnglish = v.lang.startsWith('en');
        const hasMaleName = (
          n.includes('david') ||
          n.includes('mark') ||
          n.includes('george') ||
          n.includes('guy') ||
          n.includes('ryan') ||
          n.includes('ravi') ||
          n.includes('daniel') ||
          n.includes('alex') ||
          n.includes('male') ||
          n.includes('man')
        );
        const hasFemaleName = (
          n.includes('zira') ||
          n.includes('jenny') ||
          n.includes('aria') ||
          n.includes('samantha') ||
          n.includes('victoria') ||
          n.includes('karen') ||
          n.includes('female') ||
          n.includes('woman')
        );
        return isEnglish && hasMaleName && !hasFemaleName;
      }) || availableVoices.find((v) => {
        const n = v.name.toLowerCase();
        return (
          v.lang.startsWith('en') &&
          !n.includes('zira') &&
          !n.includes('jenny') &&
          !n.includes('aria') &&
          !n.includes('samantha') &&
          !n.includes('female') &&
          !n.includes('woman')
        );
      });

      if (maleVoice) utterance.voice = maleVoice;
    }

    // Natural, deep, confident male voice acoustics
    utterance.pitch = 0.95; // Warm, grounded male resonance
    utterance.rate = 1.0;   // Clear, steady professional cadence

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Categorized Smart Prompt Suggestions
  const promptCategories = {
    popular: [
      { label: "Where is my money gone mostly?", icon: "📊" },
      { label: `Can I afford a ${currency}15,000 purchase?`, icon: "🧮" },
      { label: "What is my biggest expense?", icon: "🏆" },
      { label: "How much did I spend this month?", icon: "💳" },
    ],
    categories: [
      { label: "How much did I spend on Food?", icon: "🍔" },
      { label: "How much did I spend on Shopping?", icon: "🛍️" },
      { label: "How much on Rent & Housing?", icon: "🏠" },
      { label: "How much did I spend on Transport?", icon: "🚗" },
    ],
    insights: [
      { label: "Compare this month vs last month", icon: "📉" },
      { label: "Am I over budget on anything?", icon: "⚠️" },
      { label: "Any unusual transaction anomalies?", icon: "🔍" },
      { label: "What are my weekend spending habits?", icon: "🎉" },
    ],
    runway: [
      { label: "What is my savings rate & runway?", icon: "💰" },
      { label: "How can I save more money?", icon: "💡" },
      { label: "What payment methods do I use most?", icon: "💳" },
      { label: "How much have I spent today?", icon: "⏱️" },
    ]
  };

  // Helper to render bold markdown and line breaks cleanly
  const renderFormattedText = (rawText) => {
    const lines = rawText.split('\n');
    return lines.map((line, lIdx) => {
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
      {/* 1. Liquid Glass Floating Trigger Pill (Bottom-Right) with Desktop Robot Head */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center space-x-3 pl-3 pr-4 py-2.5 rounded-full bg-white/75 hover:bg-white/95 backdrop-blur-2xl border border-white/90 shadow-[0_12px_36px_rgba(0,40,30,0.15),0_0_28px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:scale-105 active:scale-95 transition-all duration-300 ring-1 ring-white/60 overflow-hidden"
          >
            {/* Liquid specular glass reflection */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/15 via-teal-400/10 to-transparent pointer-events-none" />

            {/* Cute Miniature Desktop Robot Head */}
            <div className="relative group-hover:-translate-y-0.5 transition-transform duration-300">
              <RobotAvatar size="sm" mood="idle" currency={currency} />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white shadow-xs" />
            </div>

            <div className="text-left">
              <span className="block font-bold text-xs text-slate-800 tracking-tight leading-tight group-hover:text-emerald-700 transition-colors">
                Ask Financial AI
              </span>
              <span className="block text-[10px] text-slate-500 font-medium">Click to chat</span>
            </div>

            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </button>
        </div>
      )}

      {/* 2. Liquid Glass Chat Modal / Drawer */}
      {isOpen && (
        <div 
          className={`fixed bottom-6 right-6 z-50 ${
            isExpanded ? 'w-[95vw] sm:w-[580px] h-[650px]' : 'w-[92vw] sm:w-[415px] h-[570px]'
          } max-h-[88vh] liquid-glass-container rounded-[32px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300 ring-1 ring-white/70 transition-all duration-300`}
        >
          {/* Animated Liquid Gradient Background Layer */}
          <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden rounded-[32px]">
            {/* Liquid Blob 1 - Vibrant Emerald / Teal Organic Floating Liquid */}
            <div className="absolute -top-12 -left-16 w-72 h-72 bg-gradient-to-tr from-emerald-400/40 via-teal-400/35 to-green-300/30 blur-2xl liquid-blob-1" />

            {/* Liquid Blob 2 - Cyan / Deep Aquamarine Liquid Drifting */}
            <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-gradient-to-bl from-cyan-400/35 via-teal-500/30 to-emerald-600/35 blur-3xl liquid-blob-2" />

            {/* Liquid Blob 3 - Radiant Mint Highlight Pulse */}
            <div className="absolute top-1/3 left-1/4 w-56 h-56 bg-gradient-to-r from-sky-400/25 to-emerald-300/30 blur-2xl liquid-blob-3" />

            {/* Liquid Blob 4 - Warm Mint Floating Accent */}
            <div className="absolute top-1/2 -right-8 w-44 h-44 bg-teal-300/25 rounded-full blur-xl animate-pulse" />

            {/* Specular Diagonal Liquid Sheen Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-white/10 opacity-75 pointer-events-none" />

            {/* Micro Dot Texture for authentic physical glass caustics */}
            <div 
              className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)',
                backgroundSize: '16px 16px'
              }}
            />
          </div>

          {/* Liquid Glass Header */}
          <div className="bg-gradient-to-r from-emerald-800/80 via-brand-800/80 to-teal-800/80 backdrop-blur-2xl px-4 py-3 text-white flex items-center justify-between border-b border-white/20 shadow-xs shrink-0 relative overflow-hidden">
            {/* Top liquid specular shimmer line */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />

            <div className="flex items-center space-x-3">
              {/* Desktop Robot Head Avatar */}
              <div className="relative p-1 -m-1">
                <RobotAvatar 
                  size="md" 
                  mood={loading ? "thinking" : speakingId ? "speaking" : "idle"} 
                  currency={currency}
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-brand-900 shadow-xs animate-pulse" />
              </div>

              <div>
                <h3 className="text-sm font-bold tracking-tight text-white drop-shadow-xs flex items-center space-x-1.5">
                  <span>Xpenzic AI Assistant</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[9px] font-extrabold uppercase tracking-wider text-emerald-200">Live</span>
                </h3>
                <p className="text-[10px] text-teal-100/90 font-medium flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-emerald-200 font-semibold">
                    {loading ? "Analyzing ledger..." : speakingId ? "Reading aloud..." : "Online & Synchronized"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {/* Maximize / Minimize toggle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse View" : "Expand View"}
                className="hidden sm:flex p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md transition border border-white/10"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Clear chat */}
              <button
                onClick={handleClearChat}
                title="Clear Conversation"
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md transition border border-white/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md transition border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Clean Glass Capability Tabs */}
          <div className="px-3 pt-2 bg-white/30 backdrop-blur-xl border-b border-white/30 flex items-center space-x-1 text-[11px] font-bold text-slate-600 shrink-0">
            {[
              { id: 'popular', label: '🔥 Popular' },
              { id: 'categories', label: '🏷️ Categories' },
              { id: 'insights', label: '📊 Insights' },
              { id: 'runway', label: '💰 Runway' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-t-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/80 text-brand-800 shadow-xs border-t border-x border-white/80'
                    : 'hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Liquid Glass Quick Prompts Bar for Active Tab */}
          <div className="px-3 py-2 bg-white/15 backdrop-blur-xl border-b border-white/20 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {promptCategories[activeTab].map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s.label)}
                disabled={loading}
                className="shrink-0 flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-white/60 hover:bg-white/90 backdrop-blur-md border border-white/80 text-[11px] font-semibold text-slate-700 hover:text-emerald-900 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] active:scale-95"
              >
                <span>{s.icon}</span>
                <span className="whitespace-nowrap">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Liquid Frosted Message Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-white/10 backdrop-blur-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start space-x-2 group ${
                  m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`shrink-0 mt-0.5 ${
                    m.sender === 'user' 
                      ? 'w-7 h-7 rounded-xl flex items-center justify-center bg-slate-900/80 text-white border border-white/30 backdrop-blur-md shadow-xs' 
                      : 'w-7 h-7 flex items-center justify-center'
                  }`}
                >
                  {m.sender === 'user' ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <RobotAvatar 
                      size="xs" 
                      mood={getBotMessageMood(m.text)} 
                      currency={currency} 
                    />
                  )}
                </div>

                {/* Liquid Glass Message Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed transition-all relative ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-br from-emerald-600/90 via-teal-600/90 to-brand-700/95 backdrop-blur-xl text-white font-medium rounded-tr-xs border border-white/40 shadow-[0_8px_24px_rgba(16,185,129,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)]'
                      : 'bg-white/75 hover:bg-white/85 backdrop-blur-xl border border-white/90 text-slate-800 rounded-tl-xs shadow-[0_6px_22px_rgba(0,0,0,0.04),inset_0_1.5px_1.5px_rgba(255,255,255,0.9)] ring-1 ring-white/50'
                  }`}
                >
                  <div className="text-[12px] whitespace-pre-wrap">
                    {renderFormattedText(m.text)}
                  </div>

                  {/* Bubble Footer: Timestamp & Action Buttons (Copy + Speak) */}
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/40 text-[9px]">
                    {m.sender === 'bot' && (
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleCopy(m.id, m.text)}
                          title="Copy response"
                          className="flex items-center space-x-0.5 p-1 rounded-md hover:bg-white/60 text-slate-500 hover:text-slate-800 transition"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-[9px] text-emerald-600 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="text-[9px]">Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleSpeak(m.id, m.text)}
                          title={speakingId === m.id ? "Stop reading" : "Read aloud"}
                          className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-md transition ${
                            speakingId === m.id 
                              ? 'bg-emerald-100 text-emerald-800 font-bold'
                              : 'hover:bg-white/60 text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {speakingId === m.id ? (
                            <>
                              <VolumeX className="w-3 h-3 animate-pulse text-emerald-700" />
                              <span className="text-[9px]">Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span className="text-[9px]">Listen</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    <span
                      className={`font-medium ml-auto ${
                        m.sender === 'user' ? 'text-emerald-100/80' : 'text-slate-400'
                      }`}
                    >
                      {m.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Liquid Glass Loading Indicator */}
            {loading && (
              <div className="flex items-start space-x-2">
                <div className="w-7 h-7 flex items-center justify-center shrink-0 mt-0.5">
                  <RobotAvatar size="xs" mood="thinking" currency={currency} />
                </div>
                <div className="bg-white/70 backdrop-blur-xl border border-white/90 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center space-x-1.5 shadow-[0_4px_18px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-semibold text-slate-600 ml-2">Calculating live financial telemetry...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* High-Contrast Liquid Glass Input Bar */}
          <div className="p-3.5 bg-white/85 backdrop-blur-2xl border-t border-white/80 shadow-[0_-10px_35px_rgba(0,35,25,0.07),inset_0_1.5px_1px_rgba(255,255,255,0.95)] shrink-0">
            <div className="flex items-center space-x-2 bg-white/95 border-2 border-slate-300 hover:border-slate-400 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/15 rounded-2xl px-3 py-2 shadow-sm transition-all">
              <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type your question here (e.g. Where is my money gone mostly?)..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="flex-1 bg-transparent border-none outline-none text-xs text-slate-900 placeholder:text-slate-500 font-semibold"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className={`p-2 rounded-xl transition-all shadow-sm active:scale-95 shrink-0 ${
                  input.trim() && !loading
                    ? 'bg-gradient-to-r from-emerald-600 to-brand-700 hover:from-emerald-700 hover:to-brand-800 text-white shadow-emerald-700/30 cursor-pointer scale-105'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                }`}
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
