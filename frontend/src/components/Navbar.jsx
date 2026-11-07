import React from 'react';
import xpenzicIcon from '../assets/xpenzic-icon.jpg';
import xpenzicWordmark from '../assets/xpenzic-wordmark.png';
import { 
  TrendingUp, 
  PlusCircle, 
  RefreshCw, 
  Coins, 
  Calendar, 
  Sparkles,
  BarChart3,
  Layers,
  CalendarDays,
  ReceiptText,
  Sliders
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currency, 
  setCurrency, 
  timeFilter, 
  setTimeFilter, 
  onOpenNewTransaction,
  onSeedData,
  isRefreshing
}) {
  const tabs = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: BarChart3 },
    { id: 'analytics', label: 'Deep Analytics Studio', icon: Sparkles },
    { id: 'visualizations', label: 'Visualizations Hub', icon: Layers },
    { id: 'calendar', label: 'Calendar Timeline', icon: CalendarDays },
    { id: 'transactions', label: 'Transaction Ledger', icon: ReceiptText },
    { id: 'settings', label: 'Budget & Control', icon: Sliders },
  ];

  const periods = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' },
  ];

  const currencies = [
    { code: 'INR', symbol: '₹', label: 'INR (₹)' },
    { code: 'USD', symbol: '$', label: 'USD ($)' },
    { code: 'EUR', symbol: '€', label: 'EUR (€)' },
    { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top brand & controls bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo & title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-xs border border-slate-200/90 bg-white p-1 shrink-0 flex items-center justify-center">
              <img 
                src={xpenzicIcon} 
                alt="Xpenzic Icon" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <img 
                  src={xpenzicWordmark} 
                  alt="Xpenzic" 
                  className="h-6 w-auto object-contain"
                />
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Data Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Financial Intelligence & Forecasting</p>
            </div>
          </div>

          {/* Quick period & currency controls */}
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto">
            {/* Period selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 whitespace-nowrap overflow-x-auto">
              {periods.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setTimeFilter(p.id)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                    timeFilter === p.id 
                      ? 'bg-white text-brand-700 font-bold shadow-sm' 
                      : 'hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Currency selector dropdown */}
            <div className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200/70 transition px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
              <Coins className="w-3.5 h-3.5 text-brand-600" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer pr-1"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.symbol}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Seed Dataset button */}
            <button
              onClick={onSeedData}
              title="Reload Realistic 6-Month Demo Dataset"
              className="hidden lg:flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-brand-500 text-xs font-semibold text-slate-700 hover:text-brand-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-brand-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Seed Data</span>
            </button>

            {/* New Transaction button */}
            <button
              onClick={onOpenNewTransaction}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-medium text-xs shadow-md shadow-brand-700/25 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Record</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex space-x-1 overflow-x-auto pb-1.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-800 border-b-2 border-brand-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

