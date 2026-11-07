import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Calendar, 
  Sliders, 
  CreditCard, 
  Activity,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Percent,
  CheckCircle2,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { CategoryBadge } from '../components/CategoryIcon';
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
import { Line, Bar } from 'react-chartjs-2';

export default function AnalyticsStudioView({ currency, timeFilter, dateParams }) {
  const [forecastDays, setForecastDays] = useState(30);
  const [forecastData, setForecastData] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [paretoData, setParetoData] = useState([]);
  const [behavioralData, setBehavioralData] = useState(null);
  const [monteCarloData, setMonteCarloData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = dateParams || {};
      const [fData, aData, pData, bData, mcData] = await Promise.all([
        api.getPredictiveForecast(forecastDays, params),
        api.getAnomalies(params),
        api.getPareto(params),
        api.getBehavioral(params),
        api.getMonteCarlo(params)
      ]);
      setForecastData(fData);
      setAnomalies(aData || []);
      setParetoData(pData || []);
      setBehavioralData(bData);
      setMonteCarloData(mcData);
    } catch (err) {
      console.error('Failed to load analytics data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [forecastDays, timeFilter]);

  // 1. Prepare Predictive Forecast Chart Data (Historical + Forecast + Confidence Band)
  const hist = forecastData?.historical || [];
  const fore = forecastData?.forecast || [];
  const allDates = [...hist.map(h => h.date), ...fore.map(f => f.date)];
  
  const actualValues = [...hist.map(h => h.actual), ...fore.map(() => null)];
  const trendValues = [...hist.map(h => h.trend), ...fore.map(f => f.forecast)];
  const upperBounds = [...hist.map(() => null), ...fore.map(f => f.upper_bound)];
  const lowerBounds = [...hist.map(() => null), ...fore.map(f => f.lower_bound)];

  const forecastChartData = {
    labels: allDates.map(d => d.substring(5)), // MM-DD
    datasets: [
      {
        label: 'Historical Daily Spend',
        data: actualValues,
        borderColor: '#94a3b8',
        backgroundColor: '#94a3b8',
        pointRadius: 3,
        showLine: false,
      },
      {
        label: 'Fitted Trend & Forecast',
        data: trendValues,
        borderColor: '#00897b',
        borderWidth: 2.5,
        tension: 0.2,
        pointRadius: 0,
        fill: false,
      },
      {
        label: '95% Confidence Upper Bound',
        data: upperBounds,
        borderColor: 'rgba(0, 137, 123, 0.3)',
        borderDash: [4, 4],
        pointRadius: 0,
        fill: '+1',
        backgroundColor: 'rgba(0, 137, 123, 0.08)',
      },
      {
        label: '95% Confidence Lower Bound',
        data: lowerBounds,
        borderColor: 'rgba(0, 137, 123, 0.3)',
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      }
    ]
  };

  const forecastChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { family: 'Poppins', size: 11 }, usePointStyle: true }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (ctx.raw === null || ctx.raw === undefined) return null;
            return ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw, currency)}`;
          }
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Poppins', size: 10 } } },
      y: {
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: {
          font: { family: 'Poppins', size: 10 },
          callback: (v) => formatCurrency(v, currency)
        }
      }
    }
  };

  // 2. Prepare Pareto Chart Data
  const paretoLabels = paretoData.map(p => p.category);
  const paretoBars = paretoData.map(p => p.amount);
  const paretoLines = paretoData.map(p => p.cumulative_percentage);

  const paretoChartData = {
    labels: paretoLabels,
    datasets: [
      {
        type: 'bar',
        label: 'Category Outflow',
        data: paretoBars,
        backgroundColor: paretoData.map(p => p.is_top_driver ? '#ef4444' : '#cbd5e1'),
        borderRadius: 8,
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Cumulative % Share',
        data: paretoLines,
        borderColor: '#0284c7',
        borderWidth: 2.5,
        pointBackgroundColor: '#0284c7',
        pointRadius: 4,
        tension: 0.3,
        yAxisID: 'y1',
      }
    ]
  };

  const paretoChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'Poppins', size: 11 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (ctx.dataset.type === 'bar') {
              return ` Outflow: ${formatCurrency(ctx.raw, currency)}`;
            }
            return ` Cumulative Share: ${ctx.raw}%`;
          }
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Poppins', size: 11 } } },
      y: {
        type: 'linear',
        position: 'left',
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: { callback: (v) => formatCurrency(v, currency), font: { family: 'Poppins', size: 10 } }
      },
      y1: {
        type: 'linear',
        position: 'right',
        min: 0,
        max: 100,
        grid: { display: false },
        ticks: { callback: (v) => `${v}%`, font: { family: 'Poppins', size: 10 } }
      }
    }
  };

  // 3. Prepare Day of Week Spending Chart Data
  const dowList = behavioralData?.day_of_week || [];
  const dowChartData = {
    labels: dowList.map(d => d.day),
    datasets: [
      {
        label: 'Total Spent',
        data: dowList.map(d => d.total_amount),
        backgroundColor: dowList.map((d, i) => i >= 5 ? '#f43f5e' : '#00897b'),
        borderRadius: 8,
      }
    ]
  };

  // 4. Prepare Monte Carlo Runway Projection Chart Data
  const mcTimeline = monteCarloData?.projections || [];
  const mcChartData = {
    labels: mcTimeline.map(m => m.label),
    datasets: [
      {
        label: 'Optimistic (90th Percentile)',
        data: mcTimeline.map(m => m.optimistic_p90),
        borderColor: '#10b981',
        borderDash: [5, 5],
        fill: false,
        tension: 0.3,
        pointRadius: 3
      },
      {
        label: 'Expected Median (50th Percentile)',
        data: mcTimeline.map(m => m.median_p50),
        borderColor: '#0284c7',
        borderWidth: 3,
        fill: false,
        tension: 0.3,
        pointRadius: 4
      },
      {
        label: 'Conservative (10th Percentile)',
        data: mcTimeline.map(m => m.conservative_p10),
        borderColor: '#f59e0b',
        borderDash: [5, 5],
        fill: false,
        tension: 0.3,
        pointRadius: 3
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-brand-800 via-brand-700 to-teal-700 rounded-3xl p-6 text-white shadow-lg shadow-brand-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </span>
            <h2 className="text-xl font-extrabold tracking-tight">Financial Intelligence & Data Science Studio</h2>
          </div>
          <p className="text-xs text-teal-100/90 mt-1.5 max-w-2xl">
            Applying Ordinary Least Squares (OLS) regression, modified Z-Score anomaly detectors, Pareto 80/20 distribution modeling, and Monte Carlo stochastic reserve simulations.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 text-xs font-semibold">
          <Activity className="w-4 h-4 text-emerald-300 animate-pulse" />
          <span>Active Analytical Pipeline</span>
        </div>
      </div>

      {/* Module 1: Predictive 30-Day Spending Forecast (OLS Regression) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-teal-50 text-brand-700 font-bold text-xs">OLS</span>
              <h3 className="text-base font-bold text-slate-800">Time-Series Predictive Spending Forecast</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Linear trend modeling with 95% Confidence Interval error bands (t-distribution)
            </p>
          </div>

          {/* Days ahead switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {[15, 30, 60].map((d) => (
              <button
                key={d}
                onClick={() => setForecastDays(d)}
                className={`px-3 py-1 rounded-lg transition ${
                  forecastDays === d ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d} Days Ahead
              </button>
            ))}
          </div>
        </div>

        {/* Forecast Metrics Bar */}
        {forecastData?.model_metrics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 mb-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Trend Slope (m)</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                {forecastData.model_metrics.slope > 0 ? '+' : ''}{forecastData.model_metrics.slope} {currency}/day
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Trajectory</span>
              <p className={`font-bold text-sm mt-0.5 ${forecastData.model_metrics.trend_direction === 'Increasing' ? 'text-rose-600' : 'text-emerald-600'}`}>
                {forecastData.model_metrics.trend_direction}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Fit Goodness (R²)</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{forecastData.model_metrics.r_squared}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Std Error (σ)</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{formatCurrency(forecastData.model_metrics.std_error, currency)}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Projected Outlay</span>
              <p className="font-bold text-brand-700 text-sm mt-0.5">{formatCurrency(forecastData.model_metrics.projected_30d_total, currency)}</p>
            </div>
          </div>
        )}

        {/* Forecast Chart */}
        <div className="h-72 w-full">
          <Line data={forecastChartData} options={forecastChartOptions} />
        </div>
      </div>

      {/* Module 2: Pareto 80/20 Analysis & Behavioral Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pareto 80/20 Distribution Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-sky-50 text-sky-700">
                  <Target className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-800">Pareto 80/20 Expense Drivers</h3>
              </div>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                80% Core Outlay
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Identifies the vital 20% of category drivers responsible for 80% of aggregate spending
            </p>

            <div className="h-64 w-full">
              <Bar data={paretoChartData} options={paretoChartOptions} />
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start space-x-3 text-xs text-sky-900">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <p>
              <span className="font-bold">Optimization Target:</span> Top drivers{' '}
              <span className="font-semibold text-rose-700">
                {paretoData.filter(p => p.is_top_driver).map(p => p.category).join(', ')}
              </span>{' '}
              account for over 80% of total outlay. Trimming even 10% from these yields significant monthly savings.
            </p>
          </div>
        </div>

        {/* Behavioral Analysis: Weekday vs Weekend & Day of Week */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
                  <Calendar className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-800">Behavioral Spending by Day</h3>
              </div>
              {behavioralData?.weekday_vs_weekend && (
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                  Weekend Spend: {behavioralData.weekday_vs_weekend.weekend_multiplier}x Weekday
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Discretionary weekend leisure spikes versus weekday routine living expenses
            </p>

            <div className="h-64 w-full">
              <Bar 
                data={dowChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { family: 'Poppins', size: 10 } } },
                    y: { 
                      grid: { color: 'rgba(226, 232, 240, 0.6)' },
                      ticks: { callback: (v) => formatCurrency(v, currency), font: { family: 'Poppins', size: 10 } } 
                    }
                  }
                }} 
              />
            </div>
          </div>

          {/* Payment Method Preferences pills */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-2">Payment Method Distribution:</span>
            <div className="flex flex-wrap gap-2">
              {(behavioralData?.payment_methods || []).map((pm) => (
                <div key={pm.method} className="px-2.5 py-1 rounded-xl bg-slate-100 flex items-center space-x-1.5 text-xs">
                  <CreditCard className="w-3 h-3 text-slate-500" />
                  <span className="font-bold text-slate-700">{pm.method}</span>
                  <span className="text-slate-400 font-medium">{pm.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Module 3: Statistical Anomaly Detection (Modified Z-Score & IQR) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-800">Statistical Anomaly & Outlier Detection</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies transactions exceeding 2.2 standard deviations or above Q3 + 1.5×IQR from historical category averages
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            {anomalies.length} Flagged Anomalies
          </span>
        </div>

        {anomalies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="pb-3 pl-2">Severity</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-right">Category Mean</th>
                  <th className="pb-3 text-right">Deviation (Z)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {anomalies.map((ano) => (
                  <tr key={ano.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3 pl-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ano.severity === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ano.severity}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 font-medium whitespace-nowrap">{formatDate(ano.date)}</td>
                    <td className="py-3 font-bold text-slate-800">
                      <div className="flex items-center space-x-2">
                        <CategoryBadge category={ano.category} size="xs" />
                        <span>{ano.category}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 max-w-[220px] truncate">{ano.description}</td>
                    <td className="py-3 text-right font-extrabold text-rose-600">{formatCurrency(ano.amount, currency)}</td>
                    <td className="py-3 text-right text-slate-500">{formatCurrency(ano.category_mean, currency)}</td>
                    <td className="py-3 text-right font-bold text-slate-800">{ano.multiplier_of_avg}x avg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No statistical outliers detected. All expenses remain within standard bounds.
          </div>
        )}
      </div>

      {/* Module 4: Monte Carlo Financial Runway & Solvency Simulator */}
      {monteCarloData && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-800">Monte Carlo 180-Day Financial Runway Simulator</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                500 stochastic trials based on empirical cash flow distribution modeling future net balance scenarios
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-xs">
                <span className="text-emerald-700 font-medium">Solvency Probability: </span>
                <span className="font-extrabold text-emerald-800">{monteCarloData.positive_probability}%</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <Line 
              data={mcChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top', labels: { font: { family: 'Poppins', size: 11 }, usePointStyle: true } },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw, currency)}`
                    }
                  }
                },
                scales: {
                  x: { grid: { display: false }, ticks: { font: { family: 'Poppins', size: 11 } } },
                  y: {
                    grid: { color: 'rgba(226, 232, 240, 0.6)' },
                    ticks: { callback: (v) => formatCurrency(v, currency), font: { family: 'Poppins', size: 10 } }
                  }
                }
              }} 
            />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50">
              <span className="text-slate-500 font-medium">Conservative P10 (Worst Case)</span>
              <p className="font-extrabold text-amber-700 text-sm mt-0.5">
                {formatCurrency(monteCarloData.projections[monteCarloData.projections.length - 1]?.conservative_p10, currency)}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">10% chance of dipping below this reserve</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50">
              <span className="text-slate-500 font-medium">Median P50 (Expected Reality)</span>
              <p className="font-extrabold text-brand-700 text-sm mt-0.5">
                {formatCurrency(monteCarloData.projections[monteCarloData.projections.length - 1]?.median_p50, currency)}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Most probable outcome under current behavior</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50">
              <span className="text-slate-500 font-medium">Optimistic P90 (Bull Case)</span>
              <p className="font-extrabold text-emerald-700 text-sm mt-0.5">
                {formatCurrency(monteCarloData.projections[monteCarloData.projections.length - 1]?.optimistic_p90, currency)}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">10% upside potential with disciplined spend</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

