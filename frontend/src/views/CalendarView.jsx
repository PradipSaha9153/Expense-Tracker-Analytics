import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Trash2 
} from 'lucide-react';
import { api } from '../services/api';
import { CategoryBadge } from '../components/CategoryIcon';
import { formatCurrency, formatDate, getCategoryColor } from '../utils/formatters';

export default function CalendarView({ currency, onOpenNewTransaction, onEditTransaction, onDeleteTransaction }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState(new Date().toISOString().split('T')[0]);
  const [monthTransactions, setMonthTransactions] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [loading, setLoading] = useState(true);

  // Load transactions for the currently viewed month
  const fetchMonthData = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const start_date = `${year}-${month}-01`;
      
      // End date of month
      const lastDay = new Date(year, currentDate.getMonth() + 1, 0).getDate();
      const end_date = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

      const res = await api.getTransactions({ start_date, end_date });
      setMonthTransactions(res.data || []);
    } catch (err) {
      console.error('Failed to load calendar transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthData();
  }, [currentDate]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun
  // Adjust so Monday is 0
  const startDayOffset = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1);
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Group month transactions by date
  const txByDate = {};
  const categoriesSet = new Set(['All Categories']);

  monthTransactions.forEach(tx => {
    if (!txByDate[tx.date]) {
      txByDate[tx.date] = [];
    }
    txByDate[tx.date].push(tx);
    if (tx.category) categoriesSet.add(tx.category);
  });

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Selected Day Calculations
  const selectedDayEvents = (txByDate[selectedDayStr] || []).filter(tx => {
    if (categoryFilter === 'All Categories') return true;
    return tx.category === categoryFilter;
  });

  let dayIncome = 0;
  let dayExpense = 0;
  (txByDate[selectedDayStr] || []).forEach(tx => {
    if (tx.type === 'Income') dayIncome += tx.amount;
    else dayExpense += tx.amount;
  });
  const dayBalance = dayIncome - dayExpense;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Calendar Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-brand-50 text-brand-700">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-800">Spending Calendar & Day-by-Day Timeline</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Replicating Spendrym's interactive calendar with day markers, daily summary cards, and category filtering
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-4 py-2 rounded-xl bg-brand-50 text-brand-800 text-sm font-bold min-w-[150px] text-center">
            {monthNames[month]} {year}
          </div>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: The Interactive Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => (
              <div 
                key={dayName} 
                className={`text-xs font-bold py-1 ${idx >= 5 ? 'text-rose-500' : 'text-slate-400'}`}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank offset spaces for start of month */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`blank-${i}`} className="h-20 rounded-2xl bg-slate-50/50 border border-transparent" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: totalDaysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const events = txByDate[dateStr] || [];
              const isSelected = selectedDayStr === dateStr;

              let hasIncome = false;
              let hasExpense = false;
              let dayTotalExpense = 0;

              events.forEach(e => {
                if (e.type === 'Income') hasIncome = true;
                else {
                  hasExpense = true;
                  dayTotalExpense += e.amount;
                }
              });

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDayStr(dateStr)}
                  className={`h-20 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/70 shadow-md ring-2 ring-brand-500/20'
                      : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected ? 'text-brand-800' : 'text-slate-700'}`}>
                      {dayNum}
                    </span>
                    {events.length > 0 && (
                      <span className="text-[10px] font-semibold text-slate-400">
                        {events.length}
                      </span>
                    )}
                  </div>

                  {/* Daily Outflow Indicator */}
                  {dayTotalExpense > 0 && (
                    <div className="text-[10px] font-bold text-rose-600 truncate">
                      -{formatCurrency(dayTotalExpense, currency)}
                    </div>
                  )}

                  {/* Event indicator dots */}
                  <div className="flex items-center space-x-1">
                    {hasIncome && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Income recorded"></span>}
                    {hasExpense && <span className="w-2 h-2 rounded-full bg-rose-500" title="Expense recorded"></span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Daily Summary Card & Day Transactions List */}
        <div className="space-y-4">
          {/* Daily Summary Card (Matching Spendrym DailySummaryCard) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Daily Summary</span>
                <h3 className="text-base font-extrabold text-slate-800">{formatDate(selectedDayStr)}</h3>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
                {selectedDayEvents.length} Records
              </span>
            </div>

            {/* Income, Expense, Balance 3-Way Grid */}
            <div className="grid grid-cols-3 gap-2 pt-3 text-center">
              <div className="p-2.5 rounded-xl bg-emerald-50">
                <span className="text-[10px] font-semibold text-emerald-700">Income</span>
                <p className="text-xs font-extrabold text-emerald-800 mt-0.5">{formatCurrency(dayIncome, currency)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50">
                <span className="text-[10px] font-semibold text-rose-700">Expense</span>
                <p className="text-xs font-extrabold text-rose-800 mt-0.5">{formatCurrency(dayExpense, currency)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-brand-50">
                <span className="text-[10px] font-semibold text-brand-700">Net</span>
                <p className={`text-xs font-extrabold mt-0.5 ${dayBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatCurrency(dayBalance, currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Transactions for this Day with Filter */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Day Ledger</h4>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-100 border-none outline-none rounded-xl px-2 py-1 text-slate-700 cursor-pointer"
              >
                {Array.from(categoriesSet).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* List */}
            {selectedDayEvents.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {selectedDayEvents.map(tx => {
                  const isIncome = tx.type === 'Income';
                  const catColor = getCategoryColor(tx.category);

                  return (
                    <div 
                      key={tx.id}
                      className="p-3 rounded-2xl border border-slate-100 hover:border-brand-200 bg-slate-50/50 hover:bg-white transition flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5">
                        <CategoryBadge category={tx.category} size="md" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{tx.category}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{tx.description || tx.subcategory || 'Transaction'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className={`text-xs font-extrabold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                          </p>
                          <span className="text-[10px] text-slate-400 font-semibold">{tx.time}</span>
                        </div>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 rounded-lg text-slate-300 hover:text-rose-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs italic">
                No recorded transactions on this day.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

