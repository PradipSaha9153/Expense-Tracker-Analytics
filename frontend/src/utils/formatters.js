// Currency conversion rates relative to base INR
export const CURRENCY_RATES = {
  '₹': 1,
  '$': 1 / 86.5,
  '€': 1 / 93.0,
  '£': 1 / 110.0,
  '¥': 1 / 0.58,
  '₫': 295.0
};

// Currency formatting helper with live conversion
export const formatCurrency = (amount, currencySymbol = '₹') => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${currencySymbol}0.00`;
  }
  const rate = CURRENCY_RATES[currencySymbol] || 1;
  const converted = amount * rate;
  const locale = currencySymbol === '₹' ? 'en-IN' : 'en-US';
  const formatted = Math.abs(converted).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return converted < 0 ? `-${currencySymbol}${formatted}` : `${currencySymbol}${formatted}`;
};

export const formatCompactNumber = (number) => {
  if (number === undefined || number === null || isNaN(number)) return '0';
  if (Math.abs(number) >= 10000000) {
    return (number / 10000000).toFixed(2) + ' Cr';
  }
  if (Math.abs(number) >= 100000) {
    return (number / 100000).toFixed(2) + ' L';
  }
  if (Math.abs(number) >= 1000) {
    return (number / 1000).toFixed(1) + ' k';
  }
  return number.toLocaleString();
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const getCategoryColor = (category) => {
  const colorMap = {
    'Food & Beverages': '#FF5252',
    'Food': '#FF7043',
    'Beverages': '#FF8A65',
    'Daily Necessities': '#FFA726',
    'Restaurant': '#E64A19',
    'Transport': '#29B6F6',
    'Fuel': '#0288D1',
    'Parking': '#039BE5',
    'Services & Maintenance': '#0277BD',
    'Taxi': '#01579B',
    'Personal Development': '#AB47BC',
    'Education': '#8E24AA',
    'Business': '#7B1FA2',
    'InvestmentExpense': '#6A1B9A',
    'Shopping': '#EC407A',
    'Clothes': '#D81B60',
    'Accessories': '#C2185B',
    'Electronic Devices': '#AD1457',
    'Entertainment': '#7E57C2',
    'Movies': '#5E35B1',
    'Games': '#512DA8',
    'Music': '#4527A0',
    'Travel': '#311B92',
    'Home': '#26A69A',
    'Furnishings': '#00897B',
    'Home Services': '#00796B',
    'Pets': '#00695C',
    'Mortgage & Rent': '#004D40',
    'Utility Bills': '#FFA726',
    'Electricity': '#FB8C00',
    'Internet': '#F57C00',
    'Mobile Phone': '#EF6C00',
    'Water': '#E65100',
    'Health': '#EF5350',
    'Doctor': '#E53935',
    'Medicine': '#D32F2F',
    'Health Insurance': '#C62828',
    'Sports': '#B71C1C',
    'Gifts & Donations': '#8D6E63',
    'GiftsExpense': '#795548',
    'Wedding': '#6D4C41',
    'Charity': '#5D4037',
    'Kids': '#26C6DA',
    'Tuition': '#00ACC1',
    'Pocket Money': '#0097A7',
    'Baby Products': '#00838F',
    'Salary': '#4CAF50',
    'InvestmentIncome': '#2E7D32',
    'Bonus': '#81C784',
    'Side job': '#66BB6A',
    'GiftsIncome': '#A5D6A7',
    'OtherIncome': '#388E3C',
    'OtherExpense': '#78909C'
  };
  return colorMap[category] || '#00695C';
};

export const formatLocalYMD = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

