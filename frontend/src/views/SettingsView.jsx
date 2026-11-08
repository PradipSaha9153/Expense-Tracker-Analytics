import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Coins, 
  Database, 
  Trash2, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle, 
  ExternalLink,
  Save,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { CategoryBadge } from '../components/CategoryIcon';
import { formatCurrency, getCategoryColor } from '../utils/formatters';

export default function SettingsView({ currency, setCurrency, onSeedData, onResetData }) {
  const [budgets, setBudgets] = useState([]);
  const [editingBudget, setEditingBudget] = useState({});
  const [savedSuccess, setSavedSuccess] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchBudgets = async () => {
    try {
      const data = await api.getBudgets();
      setBudgets(data || []);
      const initial = {};
      (data || []).forEach(b => { initial[b.category] = b.monthly_limit; });
      setEditingBudget(initial);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSaveBudget = async (category) => {
    const limit = parseFloat(editingBudget[category] || 0);
    try {
      await api.updateBudget(category, limit);
      setSavedSuccess(`Updated budget for ${category}`);
      fetchBudgets();
      setTimeout(() => setSavedSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    await onSeedData();
    await fetchBudgets();
    setIsSeeding(false);
  };

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to delete all transaction records? This action cannot be undone.")) {
      setIsResetting(true);
      await onResetData();
      await fetchBudgets();
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-brand-50 text-brand-700">
              <Sliders className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-800">Budget Controls & System Settings</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure fiscal targets, currency display, database seeding, and inspect project data science specifications
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* 1. Category Monthly Budgets Configuration */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Category Monthly Budget Limits</h3>
            <p className="text-xs text-slate-500 mt-0.5">Define spending caps to monitor real-time utilization variance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const catColor = getCategoryColor(b.category);
            return (
              <div 
                key={b.category} 
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <CategoryBadge category={b.category} size="md" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 truncate max-w-[130px]">{b.category}</h4>
                    <span className="text-[10px] text-slate-400">Current spent: {formatCurrency(b.current_spent, currency)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                      {currency}
                    </span>
                    <input
                      type="number"
                      value={editingBudget[b.category] !== undefined ? editingBudget[b.category] : b.monthly_limit}
                      onChange={(e) => setEditingBudget({ ...editingBudget, [b.category]: e.target.value })}
                      className="w-28 pl-6 pr-2 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-brand-500"
                    />
                  </div>
                  <button
                    onClick={() => handleSaveBudget(b.category)}
                    className="p-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 transition"
                    title="Save Budget"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Data Lifecycle Controls (Seed & Reset) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-1">Dataset Management & Synchronization</h3>
        <p className="text-xs text-slate-500 mb-4">
          Populate realistic demo records to demonstrate ML analytics algorithms, or reset to a blank slate
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start justify-between">
            <div>
              <h4 className="text-xs font-bold text-emerald-900">Seed Multi-Month Demo Data</h4>
              <p className="text-[11px] text-emerald-700 mt-1 max-w-xs">
                Generates 500+ realistic multi-month transactions with salaries, rent, groceries, weekend spikes, and statistical outliers.
              </p>
              <button
                onClick={handleSeed}
                disabled={isSeeding}
                className="mt-3 flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                <span>{isSeeding ? 'Seeding...' : 'Populate Demo Dataset'}</span>
              </button>
            </div>
            <Database className="w-8 h-8 text-emerald-600/30" />
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-start justify-between">
            <div>
              <h4 className="text-xs font-bold text-rose-900">Purge Transaction Records</h4>
              <p className="text-[11px] text-rose-700 mt-1 max-w-xs">
                Permanently clears all transactions from SQLite database to start tracking from scratch.
              </p>
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="mt-3 flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isResetting ? 'Deleting...' : 'Purge All Records'}</span>
              </button>
            </div>
            <Trash2 className="w-8 h-8 text-rose-600/30" />
          </div>
        </div>
      </div>
    </div>
  );
}

