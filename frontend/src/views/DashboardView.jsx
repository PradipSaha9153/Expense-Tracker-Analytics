import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  PiggyBank, 
  Flame, 
  Hourglass, 
  PieChart as PieIcon, 
  TrendingUp, 
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  CreditCard,
  DollarSign
} from 'lucide-react';
import KpiCard from '../components/KpiCard';
import { CategoryBadge, CategoryIcon } from '../components/CategoryIcon';
import { formatCurrency, formatDate, getCategoryColor } from '../utils/formatters';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardView({ 
  summary, 
  categoriesData, 
  monthlyTrends, 
  recentTransactions, 
  currency, 
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  breakdownType,
  setBreakdownType
}) {
  const [displayMode, setDisplayMode] = useState('amount'); // 'amount' or 'percentage'

  // Prepare Donut Chart Data
  const categoriesList = categoriesData || [];
  const donutLabels = categoriesList.map(c => c.category);
  const donutAmounts = categoriesList.map(c => c.total_amount);
  const donutColors = categoriesList.map(c => getCategoryColor(c.category));

  const totalBreakdownAmount = categoriesList.reduce((acc, cur) => acc + cur.total_amount, 0);

  const donutChartData = {
    labels: donutLabels,
    datasets: [
      {
        data: donutAmounts,
        backgroundColor: donutColors,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 8,
      }
    ]
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const pct = totalBreakdownAmount > 0 ? ((val / totalBreakdownAmount) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${formatCurrency(val, currency)} (${pct}%)`;
          }
        }
      }
    }
  };

  // Prepare Spline Area Monthly Cash Flow Chart Data
  const trendLabels = (monthlyTrends || []).map(m => m.month_label);
  const incomeData = (monthlyTrends || []).map(m => m.income);
  const expenseData = (monthlyTrends || []).map(m => m.expense);
  const netSavingsData = (monthlyTrends || []).map(m => m.net_savings);

  const cashFlowChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Expense',
        data: expenseData,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ef4444',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Net Savings',
        data: netSavingsData,
        borderColor: '#0284c7',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        tension: 0.3,
        pointBackgroundColor: '#0284c7',
        pointRadius: 3,
      }
    ]
  };

  const cashFlowOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { family: 'Poppins', size: 11, weight: '500' }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${formatCurrency(context.raw, currency)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Poppins', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: {
          font: { family: 'Poppins', size: 11 },
          callback: (value) => formatCurrency(value, currency)
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total Income"
          value={formatCurrency(summary.total_income, currency)}
          subtitle="All inflows"
          icon={ArrowUpRight}
          color="emerald"
          trend="up"
          badgeText="Inflow"
          badgeType="success"
        />
        <KpiCard
          title="Total Outflow"
          value={formatCurrency(summary.total_expense, currency)}
          subtitle={`Daily avg: ${formatCurrency(summary.daily_avg_expense, currency)}`}
          icon={ArrowDownLeft}
          color="rose"
          trend="down"
          badgeText="Spend"
          badgeType="danger"
        />
        <KpiCard
          title="Net Savings"
          value={formatCurrency(summary.net_balance, currency)}
          subtitle={`Rate: ${summary.savings_rate}%`}
          icon={PiggyBank}
          color={summary.net_balance >= 0 ? "emerald" : "rose"}
          trend={summary.net_balance >= 0 ? "up" : "down"}
          badgeText={summary.net_balance >= 0 ? "Surplus" : "Deficit"}
          badgeType={summary.net_balance >= 0 ? "success" : "danger"}
        />
        <KpiCard
          title="Savings Rate"
          value={`${summary.savings_rate}%`}
          subtitle="Of total income"
          icon={Wallet}
          color="brand"
          trend={summary.savings_rate > 20 ? "up" : "neutral"}
          badgeText={summary.savings_rate >= 20 ? "Target Met" : "Low"}
          badgeType={summary.savings_rate >= 20 ? "success" : "warning"}
        />
        <KpiCard
          title="30-Day Burn Rate"
          value={formatCurrency(summary.burn_rate_30d, currency)}
          subtitle="Last 30 days outlay"
          icon={Flame}
          color="amber"
          badgeText="Monthly"
          badgeType="warning"
        />
        <KpiCard
          title="Financial Runway"
          value={`${summary.runway_months} Mo`}
          subtitle="Buffer @ burn rate"
          icon={Hourglass}
          color="indigo"
          badgeText={summary.runway_months >= 3 ? "Safe" : "Tight"}
          badgeType={summary.runway_months >= 3 ? "success" : "danger"}
        />
      </div>

      {/* Main Charts Row: Cash Flow Stream & Donut Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Cash Flow & Trend Analysis */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-brand-50 text-brand-700">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-800">Monthly Cash Flow Trajectory</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Historical comparison of Inflows, Outflows, and Net Savings reserve</p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Income</span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 ml-2"></span>
              <span>Expense</span>
            </div>
          </div>

          <div className="h-72 w-full mt-2">
            <Line data={cashFlowChartData} options={cashFlowOptions} />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[11px] font-medium text-slate-500">Monthly Avg Spend</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{formatCurrency(summary.monthly_avg_expense, currency)}</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[11px] font-medium text-slate-500">Income / Expense Ratio</span>
              <p className="text-sm font-bold text-brand-700 mt-0.5">{summary.income_expense_ratio}x</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[11px] font-medium text-slate-500">Top Spend Driver</span>
              <p className="text-sm font-bold text-rose-600 mt-0.5 truncate">{summary.top_expense_category} ({summary.top_expense_pct}%)</p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Donut Breakdown (Matches Spendrym Android ChartPie) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          {/* Header Area: Title on top, Option Pills side-by-side below */}
          <div className="mb-3">
            <div className="flex items-center space-x-2 mb-2.5">
              <span className="p-2 rounded-xl bg-brand-50 text-brand-700 shrink-0">
                <PieIcon className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-800">
                {breakdownType === 'Expense' ? 'Expense Breakdown' : 'Income Breakdown'}
              </h3>
            </div>

            {/* Below Title: Expense/Income & Amount/Percentage Side-by-Side */}
            <div className="flex items-center justify-between sm:justify-start gap-2 overflow-x-auto pt-0.5">
              {/* Expense / Income switcher */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setBreakdownType('Expense')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    breakdownType === 'Expense' ? 'bg-rose-500 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Expense
                </button>
                <button
                  onClick={() => setBreakdownType('Income')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    breakdownType === 'Income' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Income
                </button>
              </div>

              {/* Amount / Percentage Toggle pill */}
              <div className="inline-flex bg-brand-50 p-0.5 rounded-xl text-xs font-semibold text-brand-800">
                <button
                  onClick={() => setDisplayMode('amount')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    displayMode === 'amount' ? 'bg-brand-600 text-white shadow-xs font-bold' : 'text-brand-800 hover:text-brand-900'
                  }`}
                >
                  Amount
                </button>
                <button
                  onClick={() => setDisplayMode('percentage')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    displayMode === 'percentage' ? 'bg-brand-600 text-white shadow-xs font-bold' : 'text-brand-800 hover:text-brand-900'
                  }`}
                >
                  Percentage
                </button>
              </div>
            </div>
          </div>

          {/* Donut Chart with Center Annotation matching Spendrym */}
          <div className="relative h-60 w-full flex items-center justify-center">
            {categoriesList.length > 0 ? (
              <>
                <Doughnut data={donutChartData} options={donutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[11px] uppercase font-bold text-slate-400">Total</span>
                  <span className="text-lg font-extrabold text-slate-800 tracking-tight">
                    {formatCurrency(totalBreakdownAmount, currency)}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {breakdownType === 'Expense' ? 'Expenses' : 'Income'}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400 text-xs italic">
                No recorded {breakdownType.toLowerCase()} data for this timeframe
              </div>
            )}
          </div>

          {/* Mini Top Categories list */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 max-h-36 overflow-y-auto pr-1">
            {categoriesList.slice(0, 4).map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <CategoryBadge category={cat.category} size="xs" />
                  <span className="font-medium text-slate-700 truncate max-w-[120px]">{cat.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800">
                    {displayMode === 'amount' ? formatCurrency(cat.total_amount, currency) : `${cat.percentage}%`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                    {cat.transaction_count} tx
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Wise Ranked Cards Grid (Replicating CategoryWiseCard from analysis.dart) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Category Wise Expense Distribution</h3>
            <p className="text-xs text-slate-500">Ranked by total spending allocation and relative share</p>
          </div>
          <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-xl">
            {categoriesList.length} Categories Analyzed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesList.map((item) => {
            const catColor = getCategoryColor(item.category);
            return (
              <div 
                key={item.category}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-brand-200/80 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CategoryBadge category={item.category} size="lg" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 truncate max-w-[130px]">{item.category}</h4>
                      <p className="text-[11px] text-slate-400">{item.transaction_count} transactions</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-extrabold text-slate-800">
                      {formatCurrency(item.total_amount, currency)}
                    </p>
                    <span 
                      className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: `${catColor}18`, color: catColor }}
                    >
                      {item.percentage}% of total
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: catColor }}
                  />
                </div>

                {/* Subcategories pill tags with mini icons */}
                {item.subcategories && item.subcategories.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {item.subcategories.slice(0, 3).map((sub) => (
                      <span key={sub.name} className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-600 font-medium flex items-center space-x-1">
                        <CategoryIcon category={sub.name} className="w-2.5 h-2.5 text-slate-400" />
                        <span>{sub.name}: {formatCurrency(sub.amount, currency)}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Ledger Preview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Transactions Feed</h3>
            <p className="text-xs text-slate-500">Live operational ledger records and instant controls</p>
          </div>
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center space-x-1 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transaction</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Category</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Date & Time</th>
                <th className="pb-3">Method</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(recentTransactions || []).slice(0, 8).map((tx) => {
                const isIncome = tx.type === 'Income';
                const catColor = getCategoryColor(tx.category);

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pl-2">
                      <div className="flex items-center space-x-2.5">
                        <CategoryBadge category={tx.category} size="sm" />
                        <div>
                          <span className="font-bold text-slate-800">{tx.category}</span>
                          {tx.subcategory && tx.subcategory !== tx.category && (
                            <span className="block text-[10px] text-slate-400">{tx.subcategory}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 font-medium max-w-[200px] truncate">
                      {tx.description || 'No notes provided'}
                    </td>
                    <td className="py-3 text-slate-500 whitespace-nowrap">
                      {formatDate(tx.date)} <span className="text-slate-400 ml-1 text-[11px]">{tx.time}</span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {tx.payment_method || 'UPI'}
                      </span>
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <span className={`font-bold text-sm ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          title="Edit Transaction"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-700 hover:bg-brand-50 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          title="Delete Transaction"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

