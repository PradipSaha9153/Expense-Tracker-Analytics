import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, Tag } from 'lucide-react';
import { api } from '../services/api';
import { CategoryBadge } from './CategoryIcon';

export default function TransactionModal({ isOpen, onClose, onSaveSuccess, transactionToEdit, categories, currency = '₹' }) {
  if (!isOpen) return null;

  const [type, setType] = useState('Expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().substring(0, 5));
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type || 'Expense');
      setAmount(transactionToEdit.amount ? transactionToEdit.amount.toString() : '');
      setCategory(transactionToEdit.category || '');
      setSubcategory(transactionToEdit.subcategory || '');
      setPaymentMethod(transactionToEdit.payment_method || 'UPI');
      setDate(transactionToEdit.date || new Date().toISOString().split('T')[0]);
      setTime(transactionToEdit.time || new Date().toTimeString().substring(0, 5));
      setDescription(transactionToEdit.description || '');
    } else {
      setType('Expense');
      setAmount('');
      setCategory(type === 'Expense' ? 'Food & Beverages' : 'Salary');
      setSubcategory('');
      setPaymentMethod('UPI');
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().substring(0, 5));
      setDescription('');
    }
    setError('');
  }, [transactionToEdit, isOpen]);

  // Update default category when type changes if not editing
  const handleTypeChange = (newType) => {
    setType(newType);
    if (!transactionToEdit) {
      setCategory(newType === 'Expense' ? 'Food & Beverages' : 'Salary');
    }
  };

  const paymentOptions = ['UPI', 'Card', 'Cash', 'Bank', 'Wallet'];
  const quickAmounts = [100, 500, 1000, 2500, 5000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!category) {
      setError('Please select a category.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        type,
        amount: parseFloat(amount),
        category,
        subcategory: subcategory || category,
        description,
        date,
        time,
        payment_method: paymentMethod
      };

      if (transactionToEdit && transactionToEdit.id) {
        await api.updateTransaction(transactionToEdit.id, payload);
      } else {
        await api.createTransaction(payload);
      }

      onSaveSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableCategories = (categories && categories.hierarchy && categories.hierarchy[type]) 
    ? Object.keys(categories.hierarchy[type]) 
    : (type === 'Expense' 
        ? ['Food & Beverages', 'Transport', 'Shopping', 'Entertainment', 'Home', 'Utility Bills', 'Health', 'Personal Development', 'Kids', 'Gifts & Donations', 'OtherExpense']
        : ['Salary', 'InvestmentIncome', 'Bonus', 'Side job', 'GiftsIncome', 'OtherIncome']
      );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-brand-700 to-brand-800 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">
              {transactionToEdit ? 'Edit Transaction' : 'Record Transaction'}
            </h3>
            <p className="text-xs text-brand-100">Xpenzic Personal Financial Ledger</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Segmented Type Switch */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTypeChange('Expense')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                type === 'Expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>EXPENSE</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('Income')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                type === 'Income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>INCOME</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Amount ({currency})</label>
            <div className="relative rounded-2xl border border-slate-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 overflow-hidden">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-xl">
                {currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 text-2xl font-bold text-slate-800 placeholder-slate-300 outline-none"
                required
              />
            </div>

            {/* Quick add chips */}
            <div className="flex items-center space-x-2 mt-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-medium text-slate-400">Quick:</span>
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount((prev) => (parseFloat(prev || 0) + q).toString())}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition"
                >
                  +{currency}{q}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label>
              <div className="flex items-center space-x-2">
                <CategoryBadge category={category} size="md" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:border-brand-500 outline-none"
                >
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subcategory / Tag</label>
              <input
                type="text"
                placeholder="e.g. Fuel, Dinner, SIP"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Payment Method</label>
            <div className="grid grid-cols-5 gap-2">
              {paymentOptions.map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPaymentMethod(pm)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition ${
                    paymentMethod === pm
                      ? 'bg-brand-50 border-brand-500 text-brand-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes / Description</label>
            <input
              type="text"
              placeholder="Add memo, vendor, or purpose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:border-brand-500 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-700/20 transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : transactionToEdit ? 'Save Changes' : 'Confirm Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

