import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Calendar, 
  BarChart2, 
  Clock 
} from 'lucide-react';
import { api } from '../services/api';
import { CategoryBadge } from '../components/CategoryIcon';
import { formatCurrency, getCategoryColor } from '../utils/formatters';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

export default function VisualizationsView({ currency, monthlyTrends = [], timeFilter = 'all', dateParams = {} }) {
  const [heatmapData, setHeatmapData] = useState({});
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAllTimeYear, setSelectedAllTimeYear] = useState(2026);
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const queryParams = { ...(dateParams || {}) };
        if (timeFilter === 'all') {
          queryParams.year = selectedAllTimeYear;
        }
        const [hData, bData] = await Promise.all([
          api.getHeatmap(queryParams),
          api.getBudgets()
        ]);
        setHeatmapData(hData || {});
        setBudgets(bData || []);
      } catch (err) {
        console.error('Failed to load visual data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeFilter, selectedAllTimeYear, JSON.stringify(dateParams)]);

  // Intensity color map
  const getIntensityClass = (level, isFuture = false) => {
    if (isFuture) {
      return 'bg-slate-100/50 border border-dashed border-slate-200/80 cursor-default';
    }
    switch (level) {
      case 1: return 'bg-emerald-200 hover:ring-2 hover:ring-emerald-400';
      case 2: return 'bg-emerald-400 hover:ring-2 hover:ring-emerald-600';
      case 3: return 'bg-brand-600 hover:ring-2 hover:ring-brand-800 text-white';
      case 4: return 'bg-rose-500 hover:ring-2 hover:ring-rose-700 text-white shadow-xs'; // High spend spike!
      default: return 'bg-slate-100 hover:ring-2 hover:ring-slate-300';
    }
  };

  // Dynamic Headings & Subtitles based on active timeFilter
  const getHeatmapHeaderInfo = () => {
    switch (timeFilter) {
      case 'today':
        return {
          title: "Today's Spending Intensity & Timeline Matrix",
          subtitle: "Chronological hourly outflow intensity and transaction velocity throughout today",
          cycleBadge: "Today's Active Ledger"
        };
      case 'week':
        return {
          title: "Weekly Spending Intensity Matrix (This Week)",
          subtitle: "Day-by-day cash outflow volume and transaction frequency across this week (Monday – Sunday)",
          cycleBadge: "7-Day Weekly Window"
        };
      case 'month':
        return {
          title: "Monthly Spending Heatmap Matrix (November 2026)",
          subtitle: "Daily spending intensity and transaction volume across all 30 calendar days of November 2026",
          cycleBadge: "November 2026 Cycle"
        };
      case 'quarter':
        return {
          title: "Quarterly Spending Heatmap Matrix (Q4: Oct – Dec 2026)",
          subtitle: "Daily spending distribution and outflow intensity across the 13 weeks of Q4",
          cycleBadge: "Q4 2026 Fiscal Cycle"
        };
      case 'year':
        return {
          title: "Annual Spending Heatmap Matrix (2026 Calendar Year)",
          subtitle: "Daily cash outflow density and spending spikes across all 52 weeks of 2026",
          cycleBadge: "Full 2026 Annual Cycle"
        };
      case 'all':
      default:
        return {
          title: selectedAllTimeYear === 2025 
            ? "All-Time Spending Heatmap Matrix (2025 Historical Archive)" 
            : "All-Time Spending Heatmap Matrix (2026 Active Ledger)",
          subtitle: "Historical multi-year daily spending density. Toggle between 2025 and 2026 below.",
          cycleBadge: `All-Time Archive (${selectedAllTimeYear})`
        };
    }
  };

  const headerInfo = getHeatmapHeaderInfo();

  // Dynamic Budget badge based on active timeFilter
  const getBudgetCycleBadge = () => {
    switch (timeFilter) {
      case 'today': return "Today's Budget Pace";
      case 'week': return "Weekly Budget Pace";
      case 'month': return "Current Month Cycle";
      case 'quarter': return "Quarterly Budget Allocation";
      case 'year': return "Annual 2026 Consumption";
      case 'all': return "All-Time Budget vs Actual";
      default: return "Current Month Cycle";
    }
  };

  // -------------------------------------------------------------
  // CALENDAR DATA GENERATORS
  // -------------------------------------------------------------
  const todayObj = new Date('2026-11-08T00:00:00');
  const todayStr = '2026-11-08';

  // 1. Full 52/53-week GitHub style generator for Year / All Time
  const generateYearMatrix = (year) => {
    const jan1 = new Date(year, 0, 1);
    const startDay = jan1.getDay(); // 0 is Sun
    const startDate = new Date(year, 0, 1 - startDay);

    const dec31 = new Date(year, 11, 31);
    const endDay = dec31.getDay();
    const endDate = new Date(year, 11, 31 + (6 - endDay));

    const weeks = [];
    let curr = new Date(startDate);
    let currentWeek = [];
    let lastMonth = -1;

    let totalOutflow = 0;
    let totalInflow = 0;
    let activeDaysCount = 0;
    let maxSpend = 0;
    let peakDayStr = '';

    while (curr <= endDate) {
      const dateStr = curr.toISOString().split('T')[0];
      const isCurrentYear = curr.getFullYear() === year;
      const isFuture = year === 2026 && dateStr > todayStr;
      const isToday = dateStr === todayStr;

      const info = heatmapData[dateStr] || { expense: 0, income: 0, count: 0, intensity: 0 };

      if (isCurrentYear && !isFuture) {
        totalOutflow += info.expense;
        totalInflow += info.income;
        if (info.expense > 0) activeDaysCount++;
        if (info.expense > maxSpend) {
          maxSpend = info.expense;
          peakDayStr = dateStr;
        }
      }

      currentWeek.push({
        date: dateStr,
        dayOfWeek: curr.getDay(),
        dayOfMonth: curr.getDate(),
        month: curr.getMonth(),
        year: curr.getFullYear(),
        isCurrentYear,
        isFuture,
        isToday,
        ...info
      });

      if (currentWeek.length === 7) {
        // Determine if a month starts in this week column
        const firstOfMonthDay = currentWeek.find(d => d.isCurrentYear && d.dayOfMonth <= 7 && d.month !== lastMonth);
        let monthLabel = null;
        if (firstOfMonthDay) {
          lastMonth = firstOfMonthDay.month;
          monthLabel = new Date(year, firstOfMonthDay.month, 1).toLocaleString('default', { month: 'short' });
        }

        weeks.push({
          monthLabel,
          days: currentWeek
        });
        currentWeek = [];
      }

      curr.setDate(curr.getDate() + 1);
    }

    return { weeks, totalOutflow, totalInflow, activeDaysCount, maxSpend, peakDayStr };
  };

  // 2. Q4 (14 Weeks) Generator for Quarter
  const generateQuarterMatrix = () => {
    const qYear = 2026;
    // Oct 1 to Dec 31
    const oct1 = new Date(qYear, 9, 1);
    const startDay = oct1.getDay();
    const startDate = new Date(qYear, 9, 1 - startDay);

    const dec31 = new Date(qYear, 11, 31);
    const endDay = dec31.getDay();
    const endDate = new Date(qYear, 11, 31 + (6 - endDay));

    const weeks = [];
    let curr = new Date(startDate);
    let currentWeek = [];
    let lastMonth = -1;

    let totalOutflow = 0;
    let totalInflow = 0;
    let activeDaysCount = 0;
    let maxSpend = 0;
    let peakDayStr = '';

    while (curr <= endDate) {
      const dateStr = curr.toISOString().split('T')[0];
      const isQ4 = curr.getMonth() >= 9 && curr.getMonth() <= 11 && curr.getFullYear() === qYear;
      const isFuture = dateStr > todayStr;
      const isToday = dateStr === todayStr;

      const info = heatmapData[dateStr] || { expense: 0, income: 0, count: 0, intensity: 0 };

      if (isQ4 && !isFuture) {
        totalOutflow += info.expense;
        totalInflow += info.income;
        if (info.expense > 0) activeDaysCount++;
        if (info.expense > maxSpend) {
          maxSpend = info.expense;
          peakDayStr = dateStr;
        }
      }

      currentWeek.push({
        date: dateStr,
        dayOfWeek: curr.getDay(),
        dayOfMonth: curr.getDate(),
        month: curr.getMonth(),
        isQ4,
        isFuture,
        isToday,
        ...info
      });

      if (currentWeek.length === 7) {
        const firstOfMonthDay = currentWeek.find(d => d.isQ4 && d.dayOfMonth <= 7 && d.month !== lastMonth);
        let monthLabel = null;
        if (firstOfMonthDay) {
          lastMonth = firstOfMonthDay.month;
          monthLabel = new Date(qYear, firstOfMonthDay.month, 1).toLocaleString('default', { month: 'long' });
        }

        weeks.push({
          monthLabel,
          days: currentWeek
        });
        currentWeek = [];
      }

      curr.setDate(curr.getDate() + 1);
    }

    return { weeks, totalOutflow, totalInflow, activeDaysCount, maxSpend, peakDayStr };
  };

  // 3. Month Matrix (November 2026 Calendar Grid)
  const generateMonthDays = () => {
    const year = 2026;
    const month = 10; // 0-indexed: 10 is Nov
    const totalDays = 30;
    const days = [];

    let totalOutflow = 0;
    let totalInflow = 0;
    let activeDaysCount = 0;
    let maxSpend = 0;
    let peakDayStr = '';

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isFuture = dateStr > todayStr;
      const isToday = dateStr === todayStr;
      const info = heatmapData[dateStr] || { expense: 0, income: 0, count: 0, intensity: 0 };

      if (!isFuture) {
        totalOutflow += info.expense;
        totalInflow += info.income;
        if (info.expense > 0) activeDaysCount++;
        if (info.expense > maxSpend) {
          maxSpend = info.expense;
          peakDayStr = dateStr;
        }
      }

      const dObj = new Date(year, month, day);
      days.push({
        date: dateStr,
        dayNumber: day,
        dayName: dObj.toLocaleDateString('default', { weekday: 'short' }),
        dayOfWeek: dObj.getDay(),
        isFuture,
        isToday,
        ...info
      });
    }

    return { days, totalOutflow, totalInflow, activeDaysCount, maxSpend, peakDayStr };
  };

  // 4. Week Matrix (Nov 02 to Nov 08, 2026)
  const generateWeekDays = () => {
    const weekDates = [
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
      '2026-11-05',
      '2026-11-06',
      '2026-11-07',
      '2026-11-08'
    ];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let totalOutflow = 0;
    let totalInflow = 0;
    let activeDaysCount = 0;
    let maxSpend = 0;
    let peakDayStr = '';

    const days = weekDates.map((dateStr, idx) => {
      const info = heatmapData[dateStr] || { expense: 0, income: 0, count: 0, intensity: 0 };
      const isToday = dateStr === todayStr;
      totalOutflow += info.expense;
      totalInflow += info.income;
      if (info.expense > 0) activeDaysCount++;
      if (info.expense > maxSpend) {
        maxSpend = info.expense;
        peakDayStr = dateStr;
      }

      return {
        date: dateStr,
        dayName: dayNames[idx],
        shortDay: dayNames[idx].substring(0, 3),
        isToday,
        ...info
      };
    });

    return { days, totalOutflow, totalInflow, activeDaysCount, maxSpend, peakDayStr };
  };

  // 5. Today's Hourly Slots (derived from monthlyTrends or seeded today data)
  const generateTodaySlots = () => {
    const slots = [
      { time: '08:00', label: 'Early Morning', window: '00:00 – 08:00', expense: 0, income: 0, count: 0, intensity: 0 },
      { time: '11:00', label: 'Late Morning', window: '08:01 – 11:00', expense: 620, income: 0, count: 1, intensity: 2 },
      { time: '14:00', label: 'Afternoon', window: '11:01 – 14:00', expense: 340, income: 0, count: 1, intensity: 1 },
      { time: '17:00', label: 'Late Afternoon', window: '14:01 – 17:00', expense: 0, income: 0, count: 0, intensity: 0 },
      { time: '20:00', label: 'Evening', window: '17:01 – 20:00', expense: 0, income: 0, count: 0, intensity: 0 },
      { time: '23:00', label: 'Night', window: '20:01 – 23:59', expense: 0, income: 0, count: 0, intensity: 0 },
    ];

    let totalOutflow = 960;
    let totalInflow = 0;
    let activeDaysCount = 1;
    let maxSpend = 620;
    let peakDayStr = '11:00 (Health Clinic)';

    return { slots, totalOutflow, totalInflow, activeDaysCount, maxSpend, peakDayStr };
  };

  // Select appropriate matrix based on timeFilter
  const activeYear = timeFilter === 'all' ? selectedAllTimeYear : 2026;
  const yearData = (timeFilter === 'year' || timeFilter === 'all') ? generateYearMatrix(activeYear) : null;
  const quarterData = timeFilter === 'quarter' ? generateQuarterMatrix() : null;
  const monthData = timeFilter === 'month' ? generateMonthDays() : null;
  const weekData = timeFilter === 'week' ? generateWeekDays() : null;
  const todayData = timeFilter === 'today' ? generateTodaySlots() : null;

  const currentSummary = yearData || quarterData || monthData || weekData || todayData || {
    totalOutflow: 0,
    totalInflow: 0,
    activeDaysCount: 0,
    maxSpend: 0,
    peakDayStr: ''
  };

  // -------------------------------------------------------------
  // BUDGET CHART CONFIGURATION
  // -------------------------------------------------------------
  const budgetLabels = budgets.map(b => b.category);
  const budgetLimits = budgets.map(b => b.monthly_limit);
  const actualSpents = budgets.map(b => b.current_spent);

  const budgetChartData = {
    labels: budgetLabels,
    datasets: [
      {
        label: 'Monthly Budget Limit',
        data: budgetLimits,
        backgroundColor: '#cbd5e1',
        borderRadius: 8,
      },
      {
        label: 'Current Month Spent',
        data: actualSpents,
        backgroundColor: budgets.map(b => b.current_spent > b.monthly_limit ? '#ef4444' : '#00897b'),
        borderRadius: 8,
      }
    ]
  };

  const budgetChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'Poppins', size: 11 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw, currency)}`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Poppins', size: 10 } } },
      y: {
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: { callback: (v) => formatCurrency(v, currency), font: { family: 'Poppins', size: 10 } }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Visualizations Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-brand-50 text-brand-700">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-800">Visual Analytics & Matrix Hub</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Multi-dimensional data matrices: Calendar density heatmap, Budget variance, and allocation models
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200/60 px-3.5 py-1.5 rounded-2xl">
            {headerInfo.cycleBadge}
          </span>
        </div>
      </div>

      {/* 1. Daily Spending Density Heatmap Matrix */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        {/* Heatmap Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Calendar className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-800">{headerInfo.title}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {headerInfo.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Year Switcher when All Time is selected */}
            {timeFilter === 'all' && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSelectedAllTimeYear(2026)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    selectedAllTimeYear === 2026 
                      ? 'bg-gradient-to-r from-emerald-600 to-brand-700 text-white font-bold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2026 (Active)
                </button>
                <button
                  onClick={() => setSelectedAllTimeYear(2025)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    selectedAllTimeYear === 2025 
                      ? 'bg-gradient-to-r from-emerald-600 to-brand-700 text-white font-bold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2025 (Historical)
                </button>
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
              <span>Less</span>
              <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200" title="Zero spend"></span>
              <span className="w-3.5 h-3.5 rounded bg-emerald-200" title="Level 1: < ₹500"></span>
              <span className="w-3.5 h-3.5 rounded bg-emerald-400" title="Level 2: ₹500 – ₹1,500"></span>
              <span className="w-3.5 h-3.5 rounded bg-brand-600" title="Level 3: ₹1,500 – ₹3,500"></span>
              <span className="w-3.5 h-3.5 rounded bg-rose-500 shadow-xs" title="Level 4: > ₹3,500 Spike"></span>
              <span>More / Spike</span>
            </div>
          </div>
        </div>

        {/* Dynamic Period Summary Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 mb-5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Period Total Outflow</span>
            <p className="font-extrabold text-slate-800 text-sm mt-0.5">
              {formatCurrency(currentSummary.totalOutflow, currency)}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Period Total Inflow</span>
            <p className="font-extrabold text-emerald-600 text-sm mt-0.5">
              {formatCurrency(currentSummary.totalInflow, currency)}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Active Spending Days</span>
            <p className="font-extrabold text-brand-700 text-sm mt-0.5">
              {currentSummary.activeDaysCount} Days
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Peak Single-Day Outflow</span>
            <p className="font-extrabold text-rose-600 text-sm mt-0.5">
              {formatCurrency(currentSummary.maxSpend, currency)}
            </p>
          </div>
        </div>

        {/* -------------------------------------------------------- */}
        {/* VIEW 1: FULL 53-WEEK CALENDAR MATRIX (This Year / All Time) */}
        {/* -------------------------------------------------------- */}
        {(timeFilter === 'year' || timeFilter === 'all') && yearData && (
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Month Labels Header Row */}
              <div className="flex ml-8 text-[11px] font-semibold text-slate-400 mb-2">
                {yearData.weeks.map((week, idx) => (
                  <div key={idx} className="w-[17px] text-left shrink-0">
                    {week.monthLabel ? (
                      <span className="text-slate-600 font-bold -ml-1">{week.monthLabel}</span>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Grid: Day labels on left + 53 columns x 7 rows */}
              <div className="flex items-start">
                {/* Left Day of Week Labels */}
                <div className="flex flex-col justify-between h-[116px] text-[10px] font-semibold text-slate-400 pr-2 shrink-0 select-none">
                  <span className="h-3.5 leading-3.5">Mon</span>
                  <span className="h-3.5 leading-3.5">Wed</span>
                  <span className="h-3.5 leading-3.5">Fri</span>
                </div>

                {/* 53 Columns */}
                <div className="flex gap-[3px]">
                  {yearData.weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-[3px]">
                      {week.days.map((day) => {
                        const cellTooltip = `${day.date}${day.isToday ? ' (TODAY)' : ''}\nOutflow: ${formatCurrency(day.expense, currency)}\nInflow: ${formatCurrency(day.income, currency)}\nTransactions: ${day.count}`;
                        return (
                          <div
                            key={day.date}
                            title={cellTooltip}
                            onMouseEnter={() => setHoveredCell(day)}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`w-3.5 h-3.5 rounded-[3px] transition-all cursor-pointer ${
                              day.isToday ? 'ring-2 ring-emerald-500 ring-offset-1 z-10' : ''
                            } ${getIntensityClass(day.intensity, day.isFuture)}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hover Details Preview Footer */}
              <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-700">
                    {hoveredCell ? hoveredCell.date : 'Hover over any calendar cell to inspect daily totals'}
                  </span>
                  {hoveredCell && hoveredCell.isToday && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Today</span>
                  )}
                </div>

                {hoveredCell ? (
                  <div className="flex items-center space-x-4 font-medium">
                    <span>Outflow: <strong className="text-rose-600">{formatCurrency(hoveredCell.expense, currency)}</strong></span>
                    <span>Inflow: <strong className="text-emerald-600">{formatCurrency(hoveredCell.income, currency)}</strong></span>
                    <span>Tx: <strong className="text-slate-800">{hoveredCell.count}</strong></span>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Displaying full 52-week calendar matrix ({activeYear})
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* VIEW 2: QUARTERLY 14-WEEK CALENDAR MATRIX (This Quarter)  */}
        {/* -------------------------------------------------------- */}
        {timeFilter === 'quarter' && quarterData && (
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Month Labels Header Row */}
              <div className="flex ml-10 text-xs font-bold text-brand-800 mb-2.5">
                {quarterData.weeks.map((week, idx) => (
                  <div key={idx} className="w-[38px] text-left shrink-0">
                    {week.monthLabel ? (
                      <span className="bg-brand-50 border border-brand-200/70 px-2 py-0.5 rounded-md text-[11px]">{week.monthLabel}</span>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Grid: Day labels on left + 14 columns x 7 rows */}
              <div className="flex items-start">
                <div className="flex flex-col justify-between h-[155px] text-xs font-semibold text-slate-400 pr-3 shrink-0 select-none">
                  <span className="h-5 leading-5">Mon</span>
                  <span className="h-5 leading-5">Wed</span>
                  <span className="h-5 leading-5">Fri</span>
                </div>

                <div className="flex gap-2">
                  {quarterData.weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-2">
                      {week.days.map((day) => {
                        const cellTooltip = `${day.date}${day.isToday ? ' (TODAY)' : ''}\nOutflow: ${formatCurrency(day.expense, currency)}\nInflow: ${formatCurrency(day.income, currency)}\nTransactions: ${day.count}`;
                        return (
                          <div
                            key={day.date}
                            title={cellTooltip}
                            onMouseEnter={() => setHoveredCell(day)}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`w-5 h-5 rounded-md transition-all cursor-pointer ${
                              day.isToday ? 'ring-2 ring-emerald-500 ring-offset-1 z-10' : ''
                            } ${getIntensityClass(day.intensity, day.isFuture)}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  {hoveredCell ? hoveredCell.date : 'Q4 Fiscal Matrix: October, November, December 2026'}
                </span>
                {hoveredCell && (
                  <div className="flex items-center space-x-4 font-medium">
                    <span>Outflow: <strong className="text-rose-600">{formatCurrency(hoveredCell.expense, currency)}</strong></span>
                    <span>Inflow: <strong className="text-emerald-600">{formatCurrency(hoveredCell.income, currency)}</strong></span>
                    <span>Tx: <strong className="text-slate-800">{hoveredCell.count}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* VIEW 3: MONTHLY 30-DAY CALENDAR MATRIX (This Month)       */}
        {/* -------------------------------------------------------- */}
        {timeFilter === 'month' && monthData && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {monthData.days.map((day) => (
                <div
                  key={day.date}
                  className={`p-3 rounded-2xl border transition-all ${
                    day.isToday 
                      ? 'border-emerald-500 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/20' 
                      : day.isFuture 
                      ? 'border-slate-100 bg-slate-50/40 opacity-60' 
                      : day.expense > 0 
                      ? 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-xs' 
                      : 'border-slate-100 bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800">Nov {day.dayNumber}</span>
                    <span className="text-[10px] font-semibold text-slate-400">{day.dayName}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Outflow:</span>
                      <span className={`font-extrabold ${day.expense > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {formatCurrency(day.expense, currency)}
                      </span>
                    </div>

                    {day.income > 0 && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Inflow:</span>
                        <span className="font-extrabold text-emerald-600">{formatCurrency(day.income, currency)}</span>
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{day.count} tx</span>
                      {day.isToday && (
                        <span className="px-1.5 py-0.2 bg-emerald-600 text-white font-bold rounded">TODAY</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* VIEW 4: WEEKLY 7-DAY INTENSITY CARDS (This Week)          */}
        {/* -------------------------------------------------------- */}
        {timeFilter === 'week' && weekData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {weekData.days.map((day) => (
              <div
                key={day.date}
                className={`p-4 rounded-2xl border transition-all ${
                  day.isToday 
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20' 
                    : 'border-slate-200/90 bg-white hover:border-brand-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-slate-800">{day.dayName}</span>
                  {day.isToday && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">Today</span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 block mb-3">{day.date}</span>

                <div className="space-y-1.5">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Outflow</span>
                    <p className={`font-extrabold text-sm ${day.expense > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                      {formatCurrency(day.expense, currency)}
                    </p>
                  </div>

                  {day.income > 0 && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Inflow</span>
                      <p className="font-extrabold text-emerald-600 text-xs">
                        {formatCurrency(day.income, currency)}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{day.count} transaction{day.count !== 1 ? 's' : ''}</span>
                    <span className={`w-3 h-3 rounded-full ${getIntensityClass(day.intensity)}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* VIEW 5: TODAY'S HOURLY TIMELINE (Today)                   */}
        {/* -------------------------------------------------------- */}
        {timeFilter === 'today' && todayData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {todayData.slots.map((slot) => (
              <div
                key={slot.time}
                className={`p-4 rounded-2xl border transition-all ${
                  slot.expense > 0 
                    ? 'border-brand-200 bg-brand-50/30 shadow-xs' 
                    : 'border-slate-200/80 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    <span className="text-xs font-bold text-slate-800">{slot.time}</span>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${getIntensityClass(slot.intensity)}`} />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 block mb-2">{slot.label}</span>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">Total Outflow</span>
                  <p className={`font-extrabold text-sm ${slot.expense > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    {formatCurrency(slot.expense, currency)}
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-1">{slot.count} recorded entry</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Budget vs Actual Variance Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <BarChart2 className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-800">Monthly Budget Limits vs Actual Consumption</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluating fiscal discipline: identifying over-budget categories (red) vs compliant allocations (teal)
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200/60 px-3 py-1 rounded-xl">
            {getBudgetCycleBadge()}
          </span>
        </div>

        <div className="h-72 w-full">
          <Bar data={budgetChartData} options={budgetChartOptions} />
        </div>

        {/* Budget Status Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {budgets.slice(0, 4).map((b) => {
            const isExceeded = b.current_spent > b.monthly_limit;
            return (
              <div 
                key={b.category} 
                className={`p-3.5 rounded-2xl border ${isExceeded ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-100'} text-xs`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0">
                    <CategoryBadge category={b.category} size="xs" />
                    <span className="font-bold text-slate-800 truncate max-w-[120px]">{b.category}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isExceeded ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'}`}>
                    {b.utilization_pct}%
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-[11px] text-slate-500">Spent:</span>
                  <span className="font-extrabold text-slate-900">{formatCurrency(b.current_spent, currency)}</span>
                </div>
                <div className="flex items-baseline justify-between text-[11px] text-slate-400">
                  <span>Limit:</span>
                  <span>{formatCurrency(b.monthly_limit, currency)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
