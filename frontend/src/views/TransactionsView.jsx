import React, { useState, useEffect } from 'react';
import { 
  ReceiptText, 
  Search, 
  Download, 
  Plus, 
  Trash2, 
  Edit2, 
  Filter, 
  RefreshCw,
  ArrowUpDown
} from 'lucide-react';
import { api } from '../services/api';
import { CategoryBadge } from '../components/CategoryIcon';
import { formatCurrency, formatDate, getCategoryColor } from '../utils/formatters';

export default function TransactionsView({ 
  currency, 
  onOpenNewTransaction, 
  onEditTransaction, 
  onDeleteTransaction,
  categories,
  timeFilter,
  dateParams
}) {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [sortField, setSortField] = useState('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = { ...(dateParams || {}) };
      if (typeFilter !== 'All') params.type = typeFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (methodFilter !== 'All') params.payment_method = methodFilter;
      if (search) params.search = search;

      const res = await api.getTransactions(params);
      setTransactions(res.data || []);
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, categoryFilter, methodFilter, search, timeFilter]);

  // Client-side sorting
  const sortedTransactions = [...transactions].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sortField === 'category') {
      comparison = a.category.localeCompare(b.category);
    } else {
      // date
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return sortAsc ? comparison : -comparison;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExport = () => {
    const url = api.getExportUrl({
      type: typeFilter !== 'All' ? typeFilter : undefined,
      category: categoryFilter !== 'All' ? categoryFilter : undefined,
      payment_method: methodFilter !== 'All' ? methodFilter : undefined,
      search: search || undefined
    });
    window.open(url, '_blank');
  };

  const categoryOptions = categories?.flat ? Array.from(new Set(categories.flat.map(c => c.name))) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-brand-50 text-brand-700">
              <ReceiptText className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-800">Financial Ledger & Data Export</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {timeFilter === 'today'
              ? "Displaying ledger entries logged today with multi-parametric filtering, live search, and CSV export"
              : timeFilter === 'week'
              ? "Displaying ledger entries logged this week with multi-parametric filtering, live search, and CSV export"
              : timeFilter === 'month'
              ? "Displaying ledger entries recorded this month with multi-parametric filtering, live search, and CSV export"
              : timeFilter === 'quarter'
              ? "Displaying ledger entries recorded in Q4 with multi-parametric filtering, live search, and CSV export"
              : timeFilter === 'year'
              ? "Displaying ledger entries recorded across 2026 with multi-parametric filtering, live search, and CSV export"
              : "Complete transaction records with multi-parametric filtering, live search, and CSV export for external Data Analytics"}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:border-brand-500 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5 text-brand-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenNewTransaction}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-700/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Record Entry</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search memo, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 focus:bg-white focus:border-brand-500 outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="All">All Types (Income & Expense)</option>
            <option value="Expense">Expense Only</option>
            <option value="Income">Income Only</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categoryOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="All">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
            <option value="Bank">Bank Transfer</option>
            <option value="Wallet">Wallet</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
          <span>Showing {sortedTransactions.length} matching transactions</span>
          <button 
            onClick={() => { setSearch(''); setTypeFilter('All'); setCategoryFilter('All'); setMethodFilter('All'); }}
            className="text-brand-700 hover:underline font-semibold"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th 
                  onClick={() => handleSort('category')}
                  className="py-3.5 pl-6 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center space-x-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Description</th>
                <th 
                  onClick={() => handleSort('date')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center space-x-1">
                    <span>Date & Time</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Method</th>
                <th 
                  onClick={() => handleSort('amount')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTransactions.length > 0 ? (
                sortedTransactions.map((tx) => {
                  const isIncome = tx.type === 'Income';
                  const catColor = getCategoryColor(tx.category);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pl-6">
                        <div className="flex items-center space-x-3">
                          <CategoryBadge category={tx.category} size="md" />
                          <div>
                            <span className="font-bold text-slate-800">{tx.category}</span>
                            {tx.subcategory && tx.subcategory !== tx.category && (
                              <span className="block text-[10px] text-slate-400 font-medium">{tx.subcategory}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium max-w-[240px] truncate">
                        {tx.description || <span className="text-slate-300 italic">No notes</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <span className="font-medium text-slate-700">{formatDate(tx.date)}</span>
                        <span className="text-slate-400 text-[11px] ml-1.5">{tx.time}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {tx.payment_method || 'UPI'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className={`font-extrabold text-sm ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                        </span>
                      </td>
                      <td className="py-3.5 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Edit Record"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-700 hover:bg-brand-50 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            title="Delete Record"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs italic">
                    No transactions match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

