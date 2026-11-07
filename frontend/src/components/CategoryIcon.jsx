import React from 'react';
import {
  Home,
  Utensils,
  ShoppingBag,
  Car,
  Gamepad2,
  Zap,
  HeartPulse,
  GraduationCap,
  Gift,
  Baby,
  Banknote,
  TrendingUp,
  Award,
  Laptop,
  PiggyBank,
  Fuel,
  Wifi,
  Film,
  Music,
  Pill,
  Shirt,
  Smartphone,
  Coins,
  Plane,
  Dumbbell,
  Wrench,
  Key,
  PackageCheck,
  Droplets,
  Stethoscope,
  ShieldPlus,
  HeartHandshake,
  Briefcase,
  Layers,
  MoreHorizontal,
  Coffee,
  CircleDollarSign,
  HelpCircle
} from 'lucide-react';
import { getCategoryColor } from '../utils/formatters';

export const CATEGORY_ICON_MAP = {
  // Main Expense Categories
  'Home': Home,
  'Food & Beverages': Utensils,
  'Shopping': ShoppingBag,
  'Transport': Car,
  'Entertainment': Gamepad2,
  'Utility Bills': Zap,
  'Health': HeartPulse,
  'Personal Development': GraduationCap,
  'Gifts & Donations': Gift,
  'Kids': Baby,
  'OtherExpense': MoreHorizontal,

  // Main Income Categories
  'Salary': Banknote,
  'InvestmentIncome': TrendingUp,
  'Investment': TrendingUp,
  'Bonus': Award,
  'Side job': Laptop,
  'GiftsIncome': Gift,
  'OtherIncome': PiggyBank,

  // Subcategories
  'Food': Utensils,
  'Beverages': Coffee,
  'Daily Necessities': PackageCheck,
  'Restaurant': Utensils,
  'Fuel': Fuel,
  'Parking': Car,
  'Taxi': Car,
  'Services & Maintenance': Wrench,
  'Furnishings': Home,
  'Home Services': Wrench,
  'Pets': HeartPulse,
  'Mortgage & Rent': Key,
  'Clothes': Shirt,
  'Accessories': ShoppingBag,
  'Electronic Devices': Smartphone,
  'Movies': Film,
  'Games': Gamepad2,
  'Music': Music,
  'Travel': Plane,
  'Electricity': Zap,
  'Internet': Wifi,
  'Mobile Phone': Smartphone,
  'Water': Droplets,
  'Doctor': Stethoscope,
  'Medicine': Pill,
  'Health Insurance': ShieldPlus,
  'Sports': Dumbbell,
  'Education': GraduationCap,
  'Business': Briefcase,
  'InvestmentExpense': TrendingUp,
  'Wedding': HeartHandshake,
  'Charity': HeartHandshake,
  'Tuition': GraduationCap,
  'Pocket Money': Coins,
  'Baby Products': Baby
};

export function getCategoryIcon(category) {
  if (!category) return HelpCircle;
  return CATEGORY_ICON_MAP[category] || CircleDollarSign;
}

export function CategoryIcon({ category, className = "w-4 h-4", ...props }) {
  const IconComponent = getCategoryIcon(category);
  return <IconComponent className={className} {...props} />;
}

export function CategoryBadge({ category, size = "md", className = "", style = {} }) {
  const catColor = getCategoryColor(category);
  
  const sizeClasses = {
    xs: { box: "w-5 h-5 rounded-md", icon: "w-3 h-3" },
    sm: { box: "w-7 h-7 rounded-lg", icon: "w-3.5 h-3.5" },
    md: { box: "w-8 h-8 rounded-xl", icon: "w-4 h-4" },
    lg: { box: "w-10 h-10 rounded-xl shadow-xs", icon: "w-5 h-5" },
    xl: { box: "w-12 h-12 rounded-2xl shadow-sm", icon: "w-6 h-6" }
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`${selectedSize.box} flex items-center justify-center font-bold text-white shrink-0 ${className}`}
      style={{ backgroundColor: catColor, ...style }}
      title={category}
    >
      <CategoryIcon category={category} className={`${selectedSize.icon} text-white`} />
    </div>
  );
}

export default CategoryIcon;
