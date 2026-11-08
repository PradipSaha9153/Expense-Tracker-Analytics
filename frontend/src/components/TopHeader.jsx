import React from 'react';
import { 
  Menu, 
  Coins, 
  RefreshCw, 
  PlusCircle, 
  Calendar 
} from 'lucide-react';

export default function TopHeader({ 
  timeFilter, 
  setTimeFilter, 
  currency, 
  setCurrency, 
  onOpenNewTransaction, 
  onSeedData, 
  isRefreshing,
  setIsMobileOpen
}) {
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
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center justify-between gap-3 shadow-xs">
      {/* LEFT SIDE: Mobile Menu Toggle + Period Filter Selector */}
      <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition shrink-0"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Time Period Filter Pills on LEFT SIDE */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 whitespace-nowrap overflow-x-auto scrollbar-none border border-slate-200/60">
          {periods.map((p) => {
            const isSelected = timeFilter === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setTimeFilter(p.id)}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 select-none ${
                  isSelected 
                    ? 'bg-gradient-to-r from-emerald-600 to-brand-700 text-white font-bold shadow-md shadow-emerald-700/25 scale-[1.02]' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 font-semibold'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDE: Currency Selector + Seed Data + Add Record */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
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
          className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-brand-500 text-xs font-semibold text-slate-700 hover:text-brand-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-brand-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Seed Data</span>
        </button>

        {/* New Transaction button */}
        <button
          onClick={onOpenNewTransaction}
          className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-medium text-xs shadow-md shadow-brand-700/25 transition active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden xs:inline">Add Record</span>
          <span className="xs:hidden">Add</span>
        </button>
      </div>
    </header>
  );
}

