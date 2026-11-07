import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function KpiCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendLabel, 
  color = 'brand',
  badgeText,
  badgeType = 'neutral'
}) {
  const colorSchemes = {
    brand: {
      bg: 'bg-brand-50',
      text: 'text-brand-700',
      border: 'border-brand-200/60',
      iconBg: 'bg-brand-100 text-brand-700'
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      text: 'text-emerald-700',
      border: 'border-emerald-200/60',
      iconBg: 'bg-emerald-100 text-emerald-700'
    },
    rose: {
      bg: 'bg-rose-50/70',
      text: 'text-rose-700',
      border: 'border-rose-200/60',
      iconBg: 'bg-rose-100 text-rose-700'
    },
    amber: {
      bg: 'bg-amber-50/70',
      text: 'text-amber-700',
      border: 'border-amber-200/60',
      iconBg: 'bg-amber-100 text-amber-700'
    },
    indigo: {
      bg: 'bg-indigo-50/70',
      text: 'text-indigo-700',
      border: 'border-indigo-200/60',
      iconBg: 'bg-indigo-100 text-indigo-700'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.brand;

  const badgeStyles = {
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-rose-100 text-rose-800',
    neutral: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-4.5 2xl:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center justify-between gap-1.5">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 truncate" title={title}>
            {title}
          </p>
          {Icon && (
            <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 flex items-center justify-center ${scheme.iconBg}`}>
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          )}
        </div>
        <div className="mt-2">
          <h3 className="text-lg sm:text-xl 2xl:text-2xl font-extrabold text-slate-900 tracking-tight truncate" title={value}>
            {value}
          </h3>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs gap-1.5">
        <div className="flex items-center space-x-1.5 font-medium min-w-0 truncate">
          {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
          {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
          {trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
          <span className="text-slate-600 truncate">{subtitle}</span>
        </div>

        {badgeText && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold shrink-0 ${badgeStyles[badgeType] || badgeStyles.neutral}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}

