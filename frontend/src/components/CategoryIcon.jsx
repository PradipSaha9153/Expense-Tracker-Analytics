import React, { useState } from 'react';
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

// Map categories to high-resolution 3D clay icons matching the 50 Essential 3D Icons Pack
export const CATEGORY_3D_MAP = {
  // Main Expense Categories
  'Home': '/icons/3d/home.png',
  'Food & Beverages': '/icons/3d/food.png',
  'Shopping': '/icons/3d/shopping.png',
  'Transport': '/icons/3d/transport.png',
  'Entertainment': '/icons/3d/entertainment.png',
  'Utility Bills': '/icons/3d/utility.png',
  'Health': '/icons/3d/health.png',
  'Personal Development': '/icons/3d/education.png',
  'Gifts & Donations': '/icons/3d/gift.png',
  'Kids': '/icons/3d/kids.png',
  'OtherExpense': '/icons/3d/package.png',

  // Main Income Categories
  'Salary': '/icons/3d/salary.png',
  'InvestmentIncome': '/icons/3d/investment.png',
  'Investment': '/icons/3d/investment.png',
  'Bonus': '/icons/3d/bonus.png',
  'Side job': '/icons/3d/laptop.png',
  'GiftsIncome': '/icons/3d/gift.png',
  'OtherIncome': '/icons/3d/coins.png',

  // Subcategories
  'Food': '/icons/3d/food.png',
  'Beverages': '/icons/3d/food.png',
  'Daily Necessities': '/icons/3d/shopping.png',
  'Restaurant': '/icons/3d/food.png',
  'Fuel': '/icons/3d/fuel.png',
  'Parking': '/icons/3d/transport.png',
  'Taxi': '/icons/3d/transport.png',
  'Services & Maintenance': '/icons/3d/package.png',
  'Furnishings': '/icons/3d/home.png',
  'Home Services': '/icons/3d/home.png',
  'Pets': '/icons/3d/kids.png',
  'Mortgage & Rent': '/icons/3d/home.png',
  'Clothes': '/icons/3d/shopping.png',
  'Accessories': '/icons/3d/shopping.png',
  'Electronic Devices': '/icons/3d/laptop.png',
  'Movies': '/icons/3d/movies.png',
  'Games': '/icons/3d/entertainment.png',
  'Music': '/icons/3d/entertainment.png',
  'Travel': '/icons/3d/travel.png',
  'Electricity': '/icons/3d/utility.png',
  'Internet': '/icons/3d/laptop.png',
  'Mobile Phone': '/icons/3d/laptop.png',
  'Water': '/icons/3d/utility.png',
  'Doctor': '/icons/3d/health.png',
  'Medicine': '/icons/3d/health.png',
  'Health Insurance': '/icons/3d/health.png',
  'Sports': '/icons/3d/entertainment.png',
  'Education': '/icons/3d/education.png',
  'Business': '/icons/3d/salary.png',
  'InvestmentExpense': '/icons/3d/investment.png',
  'Wedding': '/icons/3d/gift.png',
  'Charity': '/icons/3d/gift.png',
  'Tuition': '/icons/3d/education.png',
  'Pocket Money': '/icons/3d/coins.png',
  'Baby Products': '/icons/3d/kids.png'
};

export function get3DIconPath(category) {
  if (!category) return '/icons/3d/package.png';
  return CATEGORY_3D_MAP[category] || '/icons/3d/package.png';
}

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
  const IconComponent = getCategoryIcon(category);
  const catColor = getCategoryColor(category);

  const sizeClasses = {
    xs: { box: "w-6 h-6 rounded-lg", icon: "w-3.5 h-3.5" },
    sm: { box: "w-8 h-8 rounded-xl", icon: "w-4 h-4" },
    md: { box: "w-9 h-9 sm:w-10 sm:h-10 rounded-xl", icon: "w-4.5 h-4.5 sm:w-5 sm:h-5" },
    lg: { box: "w-12 h-12 rounded-2xl", icon: "w-6 h-6" },
    xl: { box: "w-14 h-14 rounded-2xl", icon: "w-7 h-7" }
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`${selectedSize.box} flex items-center justify-center shrink-0 border transition-all duration-200 select-none hover:scale-105 shadow-xs ${className}`}
      style={{
        backgroundColor: `${catColor}14`,
        borderColor: `${catColor}35`,
        ...style
      }}
      title={category}
    >
      <IconComponent 
        className={`${selectedSize.icon} transition-transform duration-200`} 
        style={{ color: catColor }} 
        strokeWidth={2.4} 
      />
    </div>
  );
}

export default CategoryIcon;
