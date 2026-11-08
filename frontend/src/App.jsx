import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import TransactionModal from './components/TransactionModal';
import DashboardView from './views/DashboardView';
import AnalyticsStudioView from './views/AnalyticsStudioView';
import VisualizationsView from './views/VisualizationsView';
import CalendarView from './views/CalendarView';
import TransactionsView from './views/TransactionsView';
import SettingsView from './views/SettingsView';
import FinancialAssistant from './components/FinancialAssistant';

import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currency, setCurrency] = useState('₹');
  const [timeFilter, setTimeFilter] = useState('all');
  const [breakdownType, setBreakdownType] = useState('Expense');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Shared Data States
  const [summary, setSummary] = useState({});
  const [categoriesData, setCategoriesData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoriesMeta, setCategoriesMeta] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => current === msg ? '' : current);
    }, 3500);
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  // Calculate start and end date for time filter
  const getDateRange = (filter) => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    if (filter === 'quarter') {
      const qStartMonth = Math.floor(m / 3) * 3;
      const start = `${y}-${String(qStartMonth + 1).padStart(2, '0')}-01`;
      const qEndMonth = qStartMonth + 2;
      const lastDay = new Date(y, qEndMonth + 1, 0).getDate();
      const end = `${y}-${String(qEndMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      return { start_date: start, end_date: end, time_filter: 'quarter' };
    }
    if (filter === 'year') {
      return { start_date: `${y}-01-01`, end_date: `${y}-12-31`, time_filter: 'year' };
    }
    if (filter === 'today') {
      const todayStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      return { start_date: todayStr, end_date: todayStr, time_filter: 'today' };
    }
    if (filter === 'week') {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const start = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
      return { start_date: start, time_filter: 'week' };
    }
    if (filter === 'month') {
      const start = `${y}-${String(m + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(y, m + 1, 0).getDate();
      const end = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      return { start_date: start, end_date: end, time_filter: 'month' };
    }
    return { time_filter: 'all' };
  };

  const activeDateParams = getDateRange(timeFilter);

  const fetchGlobalData = async () => {
    setIsRefreshing(true);
    try {
      const dateParams = getDateRange(timeFilter);

      const [sumRes, catRes, trendRes, txRes, metaRes] = await Promise.all([
        api.getSummary(dateParams),
        api.getCategoriesBreakdown({ ...dateParams, type: breakdownType }),
        api.getMonthlyTrends({ ...dateParams, time_filter: timeFilter }),
        api.getTransactions({ ...dateParams, limit: 12 }),
        api.getCategories()
      ]);

      setSummary(sumRes || {});
      setCategoriesData(catRes || []);
      setMonthlyTrends(trendRes || []);
      setRecentTransactions(txRes.data || []);
      setCategoriesMeta(metaRes || null);
    } catch (err) {
      console.error('Failed to load global data', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, [timeFilter, breakdownType]);

  const handleTimeFilterChange = (newFilter) => {
    setTimeFilter(newFilter);
    const labels = {
      all: 'All Time Records',
      today: "Today's Ledger",
      week: 'This Week',
      month: 'This Month',
      quarter: 'This Quarter',
      year: 'This Year'
    };
    showToast(`Time Filter applied: ${labels[newFilter] || newFilter}`);
  };

  const handleCurrencyChange = (newCurr) => {
    setCurrency(newCurr);
    const names = { '₹': 'INR (₹)', '$': 'USD ($)', '€': 'EUR (€)', '£': 'GBP (£)' };
    showToast(`Currency converted to ${names[newCurr] || newCurr} with live exchange rates`);
  };

  const handleOpenNew = () => {
    setTransactionToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (tx) => {
    setTransactionToEdit(tx);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await api.deleteTransaction(id);
        fetchGlobalData();
        showToast('Record deleted successfully');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSeedData = async () => {
    showToast('Populating 500+ multi-month realistic records through today...');
    try {
      await api.seedData();
      await fetchGlobalData();
      showToast('✅ Demo dataset loaded successfully with current date records!');
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to seed data');
    }
  };

  const handleResetData = async () => {
    try {
      await api.resetData();
      await fetchGlobalData();
      showToast('All transaction records cleared');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7F4] flex font-poppins selection:bg-brand-600 selection:text-white">
      {/* Left Sidebar for Main Navigation Modules */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Right Content Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <TopHeader
          timeFilter={timeFilter}
          setTimeFilter={handleTimeFilterChange}
          currency={currency}
          setCurrency={handleCurrencyChange}
          onOpenNewTransaction={handleOpenNew}
          onSeedData={handleSeedData}
          isRefreshing={isRefreshing}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Floating Real-time Feedback Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce">
            <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 border border-slate-700">
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Main Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            summary={summary}
            categoriesData={categoriesData}
            monthlyTrends={monthlyTrends}
            recentTransactions={recentTransactions}
            currency={currency}
            onOpenNewTransaction={handleOpenNew}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            breakdownType={breakdownType}
            setBreakdownType={setBreakdownType}
            timeFilter={timeFilter}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsStudioView
            currency={currency}
            timeFilter={timeFilter}
            dateParams={activeDateParams}
          />
        )}

        {activeTab === 'visualizations' && (
          <VisualizationsView
            currency={currency}
            monthlyTrends={monthlyTrends}
            timeFilter={timeFilter}
            dateParams={activeDateParams}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            currency={currency}
            onOpenNewTransaction={handleOpenNew}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            currency={currency}
            onOpenNewTransaction={handleOpenNew}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            categories={categoriesMeta}
            timeFilter={timeFilter}
            dateParams={activeDateParams}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            currency={currency}
            setCurrency={setCurrency}
            onSeedData={handleSeedData}
            onResetData={handleResetData}
          />
        )}
        </main>
      </div>

      {/* Create / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={fetchGlobalData}
        transactionToEdit={transactionToEdit}
        categories={categoriesMeta}
        currency={currency}
      />

      {/* Floating Smart Financial Assistant */}
      <FinancialAssistant currency={currency} timeFilter={timeFilter} />
    </div>
  );
}

