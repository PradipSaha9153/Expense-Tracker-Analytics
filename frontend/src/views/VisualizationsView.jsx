import React, { useState, useEffect } from 'react';
import { Layers, Calendar, BarChart2, PieChart, ShieldAlert, CheckCircle, AlertCircle } from 'lucide-react';
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
import { Bar, Doughnut } from 'react-chartjs-2';

export default function VisualizationsView({ currency, monthlyTrends, timeFilter, dateParams }) {
  const [heatmapData, setHeatmapData] = useState({});
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [hData, bData] = await Promise.all([
          api.getHeatmap(dateParams || {}),
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
  }, [timeFilter]);

  // 1. Prepare 365-day calendar heatmap grid
  // We generate the last 180 or 365 days
  const today = new Date();
  const dayBoxes = [];
  const daysToShow = 140; // 20 weeks of daily heatmap
  
  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const info = heatmapData[dateStr] || { expense: 0, income: 0, count: 0, intensity: 0 };
    dayBoxes.push({
      date: dateStr,
      ...info
    });
  }

  // Intensity color map
  const getIntensityClass = (level) => {
    switch (level) {
      case 1: return 'bg-emerald-200 hover:ring-2 hover:ring-emerald-400';
      case 2: return 'bg-emerald-400 hover:ring-2 hover:ring-emerald-600';
      case 3: return 'bg-brand-600 hover:ring-2 hover:ring-brand-800';
      case 4: return 'bg-rose-500 hover:ring-2 hover:ring-rose-700'; // High spend spike!
      default: return 'bg-slate-100 hover:ring-2 hover:ring-slate-300';
    }
  };

  // 2. Budget vs Actual Comparison Chart Data
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
      {/* Visualizations Header */}
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
      </div>

      {/* 1. Daily Spending Density Heatmap Matrix */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Calendar className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-800">Daily Spending Heatmap Matrix (Last 20 Weeks)</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cell color intensity maps to daily transaction density and cash outflow volume
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
            <span>Less</span>
            <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200"></span>
            <span className="w-3.5 h-3.5 rounded bg-emerald-200"></span>
            <span className="w-3.5 h-3.5 rounded bg-emerald-400"></span>
            <span className="w-3.5 h-3.5 rounded bg-brand-600"></span>
            <span className="w-3.5 h-3.5 rounded bg-rose-500" title="Heavy Outflow Spike"></span>
            <span>More / Spike</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 overflow-x-auto">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max">
            {dayBoxes.map((box) => (
              <div
                key={box.date}
                title={`${box.date}\nOutflow: ${formatCurrency(box.expense, currency)}\nInflow: ${formatCurrency(box.income, currency)}\n${box.count} transactions`}
                className={`w-4 h-4 rounded-md transition-all cursor-pointer ${getIntensityClass(box.intensity)}`}
              />
            ))}
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mt-3 px-1">
            <span>20 Weeks Ago</span>
            <span>10 Weeks Ago</span>
            <span>Current Week</span>
          </div>
        </div>
      </div>

      {/* 2. Budget vs Actual Variance Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
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
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
            Current Month Cycle
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

