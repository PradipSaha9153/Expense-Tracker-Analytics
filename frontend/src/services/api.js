const BASE_URL = '/api';

export const api = {
  // Health
  checkHealth: async () => {
    const res = await fetch(`${BASE_URL}/health`);
    return res.json();
  },

  // Transactions
  getTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/transactions?${query}`);
    return res.json();
  },

  createTransaction: async (data) => {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateTransaction: async (id, data) => {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteTransaction: async (id) => {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Seed & Reset
  seedData: async () => {
    const res = await fetch(`${BASE_URL}/transactions/seed`, {
      method: 'POST'
    });
    return res.json();
  },

  resetData: async () => {
    const res = await fetch(`${BASE_URL}/transactions/reset`, {
      method: 'POST'
    });
    return res.json();
  },

  // Analytics
  getSummary: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/analytics/summary?${query}`);
    return res.json();
  },

  getCategoriesBreakdown: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/analytics/categories?${query}`);
    return res.json();
  },

  getMonthlyTrends: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/analytics/monthly-trends?${query}`);
    return res.json();
  },

  getPredictiveForecast: async (days = 30, params = {}) => {
    const query = new URLSearchParams({ days, ...params }).toString();
    const res = await fetch(`${BASE_URL}/analytics/predictive-forecast?${query}`);
    return res.json();
  },

  getAnomalies: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/analytics/anomalies?${query}`);
    return res.json();
  },

  getPareto: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/analytics/pareto?${query}`);
    return res.json();
  },

  getBehavioral: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/analytics/behavioral?${query}`);
    return res.json();
  },

  getHeatmap: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/analytics/heatmap?${query}`);
    return res.json();
  },

  getMonteCarlo: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/analytics/monte-carlo?${query}`);
    return res.json();
  },

  // Categories & Budgets
  getCategories: async () => {
    const res = await fetch(`${BASE_URL}/categories`);
    return res.json();
  },

  getBudgets: async () => {
    const res = await fetch(`${BASE_URL}/budgets`);
    return res.json();
  },

  updateBudget: async (category, limit) => {
    const res = await fetch(`${BASE_URL}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, monthly_limit: limit })
    });
    return res.json();
  },

  getExportUrl: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return `${BASE_URL}/export/csv?${query}`;
  },

  // Financial Assistant
  askAssistant: async (message, currency = '₹', timeFilter = 'all') => {
    const res = await fetch(`${BASE_URL}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, currency, time_filter: timeFilter })
    });
    return res.json();
  }
};

