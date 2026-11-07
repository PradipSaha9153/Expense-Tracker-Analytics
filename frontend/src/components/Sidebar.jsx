import React, { useState } from 'react';
import xpenzicIcon from '../assets/xpenzic-icon.jpg';
import xpenzicWordmark from '../assets/xpenzic-wordmark.png';
import { 
  TrendingUp, 
  BarChart3, 
  Sparkles, 
  Layers, 
  CalendarDays, 
  ReceiptText, 
  Sliders, 
  Activity,
  X
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isMobileOpen, 
  setIsMobileOpen 
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Expanded on hover on desktop, or when mobile drawer is triggered
  const isExpanded = isHovered || isMobileOpen;

  const tabs = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: BarChart3 },
    { id: 'analytics', label: 'Deep Analytics Studio', icon: Sparkles },
    { id: 'visualizations', label: 'Visualizations Hub', icon: Layers },
    { id: 'calendar', label: 'Calendar Timeline', icon: CalendarDays },
    { id: 'transactions', label: 'Transaction Ledger', icon: ReceiptText },
    { id: 'settings', label: 'Budget & Control', icon: Sliders },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Desktop Layout Placeholder: Keeps main document width stable when sidebar expands */}
      <div className="hidden lg:block w-20 shrink-0 transition-all duration-300" />

      {/* Left Sidebar Container: Icon-only (w-20) by default, expands to w-64 on hover */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 h-screen z-50 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 ease-in-out select-none ${
          isMobileOpen
            ? 'w-64 translate-x-0 shadow-2xl'
            : '-translate-x-full lg:translate-x-0'
        } ${
          !isMobileOpen ? (isHovered ? 'w-64 shadow-2xl' : 'w-20 shadow-xs') : ''
        }`}
      >
        <div className="overflow-x-hidden">
          {/* Brand Logo & Title */}
          <div className="h-16 flex items-center px-3.5 border-b border-slate-100 overflow-hidden">
            <div className={`flex items-center w-full ${isExpanded ? 'justify-start' : 'justify-center'}`}>
              {/* Logo Mark (New Xpenzic Icon) */}
              <div className={`w-11 h-11 rounded-2xl overflow-hidden shadow-xs border border-slate-200/90 bg-white p-1 flex items-center justify-center shrink-0 transition-all duration-300 ${
                isExpanded ? 'mr-3' : 'mx-auto'
              }`}>
                <img 
                  src={xpenzicIcon} 
                  alt="Xpenzic Icon" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Brand wordmark & subtitle revealed on hover */}
              <div className={`transition-all duration-300 overflow-hidden ${
                isExpanded ? 'opacity-100 max-w-[175px]' : 'opacity-0 max-w-0 pointer-events-none'
              }`}>
                <div className="flex items-center space-x-2">
                  <img 
                    src={xpenzicWordmark} 
                    alt="Xpenzic" 
                    className="h-6 w-auto object-contain"
                  />
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                    Analytics
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap mt-0.5">Financial Intelligence</p>
              </div>
            </div>

            {/* Mobile close button */}
            {isMobileOpen && (
              <button
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden ml-auto p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Menu (Left Side Options) */}
          <div className="py-4 px-3">
            {/* Section Label: hidden in collapsed mode, fades in on hover */}
            <div className={`px-2 mb-2 transition-all duration-300 overflow-hidden ${
              isExpanded ? 'opacity-100 max-h-6' : 'opacity-0 max-h-0'
            }`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                Analytics Modules
              </p>
            </div>

            <nav className="space-y-1.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`group relative flex items-center rounded-2xl transition-all duration-200 ${
                      isExpanded 
                        ? 'w-full px-3.5 py-3 space-x-3 justify-start' 
                        : 'w-12 h-12 justify-center mx-auto'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-md shadow-brand-700/25 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-semibold'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'
                    }`} />
                    
                    {/* Navigation Label revealed on hover */}
                    <span className={`text-xs whitespace-nowrap transition-all duration-200 ${
                      isExpanded 
                        ? 'opacity-100 max-w-[170px]' 
                        : 'opacity-0 max-w-0 pointer-events-none'
                    }`}>
                      {tab.label}
                    </span>

                    {/* Floating Tooltip in collapsed icon mode */}
                    {!isExpanded && (
                      <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-medium rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap">
                        {tab.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Info Card */}
        <div className="p-3 border-t border-slate-100 overflow-hidden">
          {isExpanded ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 transition-all duration-300">
              <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-700 mb-1">
                <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse shrink-0" />
                <span className="whitespace-nowrap">Data Pipeline Active</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed whitespace-nowrap">
                Python 3.15 • Pandas • OLS Regression
              </p>
            </div>
          ) : (
            <div 
              title="Data Pipeline Active: Python 3.15 • Pandas • OLS Regression • SQLite"
              className="w-12 h-12 mx-auto rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-emerald-500 hover:bg-emerald-50/60 transition cursor-help"
            >
              <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
