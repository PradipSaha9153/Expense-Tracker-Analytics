import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Database, 
  Trash2, 
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

      {/* 2. Transaction Records Management (Purge Records) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-1">Transaction Records Management</h3>
        <p className="text-xs text-slate-500 mb-4">
          Permanently delete existing transaction records from the database whenever you want to reset and start logging fresh data.
        </p>

        <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <span className="p-2.5 rounded-xl bg-rose-100 text-rose-600 shrink-0 mt-0.5">
              <Trash2 className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-rose-900">Purge All Transaction Records</h4>
              <p className="text-xs text-rose-700/90 mt-0.5 max-w-xl">
                Permanently deletes all expenses and income entries from the SQLite database. Your budgets and category limits remain intact so you can immediately begin recording fresh transactions.
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm hover:shadow-md disabled:opacity-50 shrink-0 active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isResetting ? 'Deleting...' : 'Purge All Records'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

