import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import calendar

def get_empty_summary():
    return {
        "total_income": 0.0,
        "total_expense": 0.0,
        "net_balance": 0.0,
        "savings_rate": 0.0,
        "daily_avg_expense": 0.0,
        "monthly_avg_expense": 0.0,
        "burn_rate_30d": 0.0,
        "runway_months": 0.0,
        "transaction_count": 0,
        "top_expense_category": "None",
        "top_expense_amount": 0.0,
        "top_expense_pct": 0.0,
        "income_expense_ratio": 0.0
    }

def compute_kpi_summary(df):
    if df.empty:
        return get_empty_summary()

    df = df.copy()
    df['date_dt'] = pd.to_datetime(df['date'])
    income_df = df[df['type'] == 'Income']
    expense_df = df[df['type'] == 'Expense']

    total_income = float(income_df['amount'].sum()) if not income_df.empty else 0.0
    total_expense = float(expense_df['amount'].sum()) if not expense_df.empty else 0.0
    net_balance = total_income - total_expense

    savings_rate = round((net_balance / total_income * 100), 2) if total_income > 0 else 0.0

    min_date = df['date_dt'].min()
    max_date = df['date_dt'].max()
    num_days = max((max_date - min_date).days + 1, 1)

    daily_avg_expense = round(total_expense / num_days, 2)
    monthly_avg_expense = round(daily_avg_expense * 30.416, 2)

    # 30-day burn rate (last 30 days)
    cutoff_30d = max_date - timedelta(days=30)
    last_30d_expenses = expense_df[expense_df['date_dt'] >= cutoff_30d]
    burn_rate_30d = float(last_30d_expenses['amount'].sum()) if not last_30d_expenses.empty else monthly_avg_expense
    daily_burn_30d = burn_rate_30d / 30.0

    runway_months = round(net_balance / burn_rate_30d, 1) if (burn_rate_30d > 0 and net_balance > 0) else 0.0

    # Top expense category
    top_cat = "None"
    top_cat_amt = 0.0
    top_cat_pct = 0.0
    if not expense_df.empty:
        cat_grouped = expense_df.groupby('category')['amount'].sum().sort_values(ascending=False)
        top_cat = cat_grouped.index[0]
        top_cat_amt = float(cat_grouped.iloc[0])
        top_cat_pct = round((top_cat_amt / total_expense * 100), 1) if total_expense > 0 else 0.0

    ratio = round(total_income / total_expense, 2) if total_expense > 0 else 999.0

    return {
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "net_balance": round(net_balance, 2),
        "savings_rate": savings_rate,
        "daily_avg_expense": daily_avg_expense,
        "monthly_avg_expense": monthly_avg_expense,
        "burn_rate_30d": round(burn_rate_30d, 2),
        "runway_months": runway_months,
        "transaction_count": len(df),
        "top_expense_category": top_cat,
        "top_expense_amount": round(top_cat_amt, 2),
        "top_expense_pct": top_cat_pct,
        "income_expense_ratio": ratio
    }

def compute_category_breakdown(df, trans_type='Expense'):
    subset = df[df['type'] == trans_type]
    if subset.empty:
        return []

    total_amount = subset['amount'].sum()
    grouped = subset.groupby('category').agg(
        total_amount=('amount', 'sum'),
        transaction_count=('amount', 'count'),
        avg_amount=('amount', 'mean'),
        min_amount=('amount', 'min'),
        max_amount=('amount', 'max')
    ).reset_index()

    grouped['percentage'] = (grouped['total_amount'] / total_amount * 100).round(2)
    grouped['total_amount'] = grouped['total_amount'].round(2)
    grouped['avg_amount'] = grouped['avg_amount'].round(2)
    grouped['min_amount'] = grouped['min_amount'].round(2)
    grouped['max_amount'] = grouped['max_amount'].round(2)
    grouped = grouped.sort_values(by='total_amount', ascending=False)

    # Subcategory breakdown
    results = []
    for _, row in grouped.iterrows():
        cat = row['category']
        cat_sub = subset[subset['category'] == cat]
        sub_group = cat_sub.groupby('subcategory')['amount'].sum().reset_index()
        sub_list = [
            {"name": r['subcategory'] or cat, "amount": round(float(r['amount']), 2)}
            for _, r in sub_group.iterrows()
        ]
        results.append({
            "category": cat,
            "total_amount": float(row['total_amount']),
            "transaction_count": int(row['transaction_count']),
            "avg_amount": float(row['avg_amount']),
            "min_amount": float(row['min_amount']),
            "max_amount": float(row['max_amount']),
            "percentage": float(row['percentage']),
            "subcategories": sub_list
        })

    return results

def compute_monthly_trends(df, time_filter=None, start_date=None, end_date=None):
    if df.empty and not start_date and not time_filter:
        return []

    # If df is empty but time_filter is 'month' or start_date is supplied, generate zero-filled days
    if df.empty:
        if time_filter == 'month' or start_date:
            try:
                s_dt = datetime.strptime(start_date, '%Y-%m-%d') if start_date else datetime.now()
            except Exception:
                s_dt = datetime.now()
            num_days = calendar.monthrange(s_dt.year, s_dt.month)[1]
            month_abbr = calendar.month_abbr[s_dt.month]
            return [{
                "month_key": f"{s_dt.year:04d}-{s_dt.month:02d}-{d:02d}",
                "month_label": f"{month_abbr} {d:02d}",
                "day_number": d,
                "total_days": num_days,
                "income": 0.0,
                "expense": 0.0,
                "net_savings": 0.0,
                "cumulative_savings": 0.0,
                "savings_rate": 0.0,
                "mom_expense_growth_pct": 0.0
            } for d in range(1, num_days + 1)]
        return []

    df = df.copy()
    df['date_dt'] = pd.to_datetime(df['date'])
    df['month_year'] = df['date_dt'].dt.strftime('%Y-%m')
    df['month_label'] = df['date_dt'].dt.strftime('%b %Y')

    months = sorted(df['month_year'].unique())

    # Case 0: "Today" -> Show timeline across today's hours
    if time_filter == 'today':
        target_date = start_date or datetime.now().strftime('%Y-%m-%d')
        day_df = df[df['date'] == target_date] if not df.empty else df

        slots = [
            ("08:00", "00:00", "08:00"),
            ("11:00", "08:01", "11:00"),
            ("14:00", "11:01", "14:00"),
            ("17:00", "14:01", "17:00"),
            ("20:00", "17:01", "20:00"),
            ("23:00", "20:01", "23:59")
        ]
        trend_data = []
        cum_savings = 0.0

        for label, start_t, end_t in slots:
            if not day_df.empty:
                slot_df = day_df[(day_df['time'] >= start_t) & (day_df['time'] <= end_t)]
                inc = float(slot_df[slot_df['type'] == 'Income']['amount'].sum()) if not slot_df.empty else 0.0
                exp = float(slot_df[slot_df['type'] == 'Expense']['amount'].sum()) if not slot_df.empty else 0.0
            else:
                inc = 0.0
                exp = 0.0

            net = inc - exp
            cum_savings += net

            trend_data.append({
                "month_key": f"{target_date} {label}",
                "month_label": label,
                "income": round(inc, 2),
                "expense": round(exp, 2),
                "net_savings": round(net, 2),
                "cumulative_savings": round(cum_savings, 2),
                "savings_rate": round((net / inc * 100), 2) if inc > 0 else 0.0,
                "mom_expense_growth_pct": 0.0
            })

        return trend_data

    # Case 1: "This Month" selected OR dataset contains only 1 single month -> Show 28, 29, 30, or 31 days!
    if time_filter == 'month' or (len(months) == 1 and not time_filter):
        if start_date:
            try:
                s_dt = datetime.strptime(start_date, '%Y-%m-%d')
                year = s_dt.year
                month = s_dt.month
            except Exception:
                ref_dt = df['date_dt'].max()
                year = ref_dt.year
                month = ref_dt.month
        else:
            ref_dt = df['date_dt'].max()
            year = ref_dt.year
            month = ref_dt.month

        num_days = calendar.monthrange(year, month)[1] # 28, 29, 30, or 31 days
        month_abbr = calendar.month_abbr[month]

        # Filter strictly for this year and month
        m_df = df[(df['date_dt'].dt.year == year) & (df['date_dt'].dt.month == month)]
        inc_df = m_df[m_df['type'] == 'Income']
        exp_df = m_df[m_df['type'] == 'Expense']

        daily_inc = inc_df.groupby(inc_df['date_dt'].dt.day)['amount'].sum().to_dict()
        daily_exp = exp_df.groupby(exp_df['date_dt'].dt.day)['amount'].sum().to_dict()

        trend_data = []
        cum_savings = 0.0

        for day in range(1, num_days + 1):
            date_key = f"{year:04d}-{month:02d}-{day:02d}"
            label = f"{month_abbr} {day:02d}"
            inc = float(daily_inc.get(day, 0.0))
            exp = float(daily_exp.get(day, 0.0))
            net = inc - exp
            cum_savings += net

            trend_data.append({
                "month_key": date_key,
                "month_label": label,
                "day_number": day,
                "total_days": num_days,
                "income": round(inc, 2),
                "expense": round(exp, 2),
                "net_savings": round(net, 2),
                "cumulative_savings": round(cum_savings, 2),
                "savings_rate": round((net / inc * 100), 2) if inc > 0 else 0.0,
                "mom_expense_growth_pct": 0.0
            })

        return trend_data

    # Case 2: "This Week" -> Show 7 days (Monday to Sunday)
    elif time_filter == 'week':
        if start_date:
            try:
                base_dt = datetime.strptime(start_date, '%Y-%m-%d')
            except Exception:
                base_dt = df['date_dt'].min()
        else:
            base_dt = df['date_dt'].min()

        trend_data = []
        cum_savings = 0.0

        for i in range(7):
            curr_dt = base_dt + timedelta(days=i)
            d_key = curr_dt.strftime('%Y-%m-%d')
            d_label = curr_dt.strftime('%a, %b %d')
            day_df = df[df['date_dt'].dt.strftime('%Y-%m-%d') == d_key]
            inc = float(day_df[day_df['type'] == 'Income']['amount'].sum()) if not day_df.empty else 0.0
            exp = float(day_df[day_df['type'] == 'Expense']['amount'].sum()) if not day_df.empty else 0.0
            net = inc - exp
            cum_savings += net

            trend_data.append({
                "month_key": d_key,
                "month_label": d_label,
                "income": round(inc, 2),
                "expense": round(exp, 2),
                "net_savings": round(net, 2),
                "cumulative_savings": round(cum_savings, 2),
                "savings_rate": round((net / inc * 100), 2) if inc > 0 else 0.0,
                "mom_expense_growth_pct": 0.0
            })

        return trend_data

    # Case 3: Multiple months (All Time, This Quarter, This Year) -> Group by Month
    trend_data = []
    cum_savings = 0.0
    prev_expense = None

    for m in months:
        m_df = df[df['month_year'] == m]
        inc = float(m_df[m_df['type'] == 'Income']['amount'].sum())
        exp = float(m_df[m_df['type'] == 'Expense']['amount'].sum())
        net = inc - exp
        cum_savings += net

        mom_growth = 0.0
        if prev_expense is not None and prev_expense > 0:
            mom_growth = round(((exp - prev_expense) / prev_expense) * 100, 2)
        prev_expense = exp

        savings_rate = round((net / inc * 100), 2) if inc > 0 else 0.0

        label = m_df['month_label'].iloc[0]
        trend_data.append({
            "month_key": m,
            "month_label": label,
            "income": round(inc, 2),
            "expense": round(exp, 2),
            "net_savings": round(net, 2),
            "cumulative_savings": round(cum_savings, 2),
            "savings_rate": savings_rate,
            "mom_expense_growth_pct": mom_growth
        })

    return trend_data

def compute_predictive_forecast(df, days_ahead=30):
    expense_df = df[df['type'] == 'Expense'].copy()
    if expense_df.empty or len(expense_df) < 5:
        return {"historical": [], "forecast": [], "model_metrics": {}}

    expense_df['date_dt'] = pd.to_datetime(expense_df['date'])
    daily_spend = expense_df.groupby('date_dt')['amount'].sum().reset_index().sort_values('date_dt')

    min_date = daily_spend['date_dt'].min()
    daily_spend['day_idx'] = (daily_spend['date_dt'] - min_date).dt.days

    X = daily_spend['day_idx'].values
    y = daily_spend['amount'].values

    # Fit linear regression using numpy polyfit
    slope, intercept = np.polyfit(X, y, 1)

    # Calculate residuals and standard error of estimate
    y_pred_hist = slope * X + intercept
    residuals = y - y_pred_hist
    std_err = np.std(residuals) if len(residuals) > 1 else 50.0

    # R-squared
    ss_tot = np.sum((y - np.mean(y)) ** 2)
    ss_res = np.sum(residuals ** 2)
    r_squared = round(1 - (ss_res / ss_tot), 4) if ss_tot > 0 else 0.0

    historical = [
        {
            "date": row['date_dt'].strftime('%Y-%m-%d'),
            "actual": round(float(row['amount']), 2),
            "trend": round(float(slope * row['day_idx'] + intercept), 2)
        }
        for _, row in daily_spend.iterrows()
    ]

    last_day_idx = int(X[-1])
    last_date = daily_spend['date_dt'].max()

    forecast = []
    projected_total = 0.0

    for i in range(1, days_ahead + 1):
        target_idx = last_day_idx + i
        target_date = (last_date + timedelta(days=i)).strftime('%Y-%m-%d')
        pred = max(slope * target_idx + intercept, 0.0)
        upper_bound = round(pred + 1.96 * std_err, 2)
        lower_bound = round(max(pred - 1.96 * std_err, 0.0), 2)

        projected_total += pred
        forecast.append({
            "date": target_date,
            "forecast": round(float(pred), 2),
            "upper_bound": round(float(upper_bound), 2),
            "lower_bound": round(float(lower_bound), 2)
        })

    model_metrics = {
        "slope": round(float(slope), 2),
        "intercept": round(float(intercept), 2),
        "r_squared": float(r_squared),
        "std_error": round(float(std_err), 2),
        "trend_direction": "Increasing" if slope > 0.5 else ("Decreasing" if slope < -0.5 else "Stable"),
        "projected_30d_total": round(float(projected_total), 2)
    }

    return {
        "historical": historical[-30:], # last 30 historical days for visualization
        "forecast": forecast,
        "model_metrics": model_metrics
    }

def detect_anomalies(df):
    expense_df = df[df['type'] == 'Expense'].copy()
    if expense_df.empty or len(expense_df) < 10:
        return []

    anomalies = []
    
    # Category-based Z-score and IQR anomaly detection
    for cat, group in expense_df.groupby('category'):
        if len(group) < 3:
            continue
        
        amounts = group['amount'].values
        mean = np.mean(amounts)
        std = np.std(amounts)
        q25, q75 = np.percentile(amounts, [25, 75])
        iqr = q75 - q25
        upper_whisker = q75 + 1.5 * iqr

        for _, row in group.iterrows():
            amt = float(row['amount'])
            z_score = (amt - mean) / std if std > 0 else 0.0
            
            # Outlier criteria: Z > 2.2 OR Amount > upper_whisker
            if (z_score > 2.2 or amt > upper_whisker) and amt > 1000:
                severity = "Critical" if z_score > 3.5 else "Moderate"
                anomalies.append({
                    "id": int(row['id']),
                    "date": row['date'],
                    "category": cat,
                    "subcategory": row.get('subcategory', ''),
                    "description": row.get('description', ''),
                    "amount": round(amt, 2),
                    "category_mean": round(float(mean), 2),
                    "z_score": round(float(z_score), 2),
                    "multiplier_of_avg": round(amt / mean, 1) if mean > 0 else 1.0,
                    "severity": severity,
                    "payment_method": row.get('payment_method', 'UPI')
                })

    anomalies = sorted(anomalies, key=lambda x: x['amount'], reverse=True)
    return anomalies

def compute_pareto_analysis(df):
    expense_df = df[df['type'] == 'Expense']
    if expense_df.empty:
        return []

    cat_totals = expense_df.groupby('category')['amount'].sum().reset_index()
    cat_totals = cat_totals.sort_values('amount', ascending=False)
    
    total_expense = cat_totals['amount'].sum()
    cat_totals['cumulative_amount'] = cat_totals['amount'].cumsum()
    cat_totals['cumulative_percentage'] = (cat_totals['cumulative_amount'] / total_expense * 100).round(2)
    cat_totals['percentage'] = (cat_totals['amount'] / total_expense * 100).round(2)

    pareto_results = []
    is_in_80 = True

    for _, row in cat_totals.iterrows():
        cum_pct = float(row['cumulative_percentage'])
        pareto_results.append({
            "category": row['category'],
            "amount": round(float(row['amount']), 2),
            "percentage": float(row['percentage']),
            "cumulative_percentage": cum_pct,
            "is_top_driver": is_in_80
        })
        if cum_pct >= 80.0:
            is_in_80 = False

    return pareto_results

def compute_behavioral_insights(df):
    expense_df = df[df['type'] == 'Expense'].copy()
    if expense_df.empty:
        return {}

    expense_df['date_dt'] = pd.to_datetime(expense_df['date'])
    expense_df['day_name'] = expense_df['date_dt'].dt.day_name()
    expense_df['is_weekend'] = expense_df['date_dt'].dt.weekday >= 5

    # Weekday vs Weekend
    weekday_df = expense_df[~expense_df['is_weekend']]
    weekend_df = expense_df[expense_df['is_weekend']]

    total_weekday = float(weekday_df['amount'].sum())
    total_weekend = float(weekend_df['amount'].sum())

    unique_weekdays = max(len(weekday_df['date_dt'].unique()), 1)
    unique_weekends = max(len(weekend_df['date_dt'].unique()), 1)

    avg_weekday_daily = round(total_weekday / unique_weekdays, 2)
    avg_weekend_daily = round(total_weekend / unique_weekends, 2)

    weekend_premium_pct = round(((avg_weekend_daily - avg_weekday_daily) / avg_weekday_daily * 100), 1) if avg_weekday_daily > 0 else 0.0

    # Day of week breakdown
    days_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    dow_grouped = expense_df.groupby('day_name').agg(
        total=('amount', 'sum'),
        count=('amount', 'count'),
        avg=('amount', 'mean')
    ).reindex(days_order).fillna(0).reset_index()

    dow_list = [
        {
            "day": row['day_name'],
            "total_amount": round(float(row['total']), 2),
            "count": int(row['count']),
            "avg_per_transaction": round(float(row['avg']), 2)
        }
        for _, row in dow_grouped.iterrows()
    ]

    # Payment Methods breakdown
    pm_grouped = expense_df.groupby('payment_method').agg(
        total=('amount', 'sum'),
        count=('amount', 'count')
    ).reset_index()
    total_exp = expense_df['amount'].sum()
    pm_list = [
        {
            "method": row['payment_method'],
            "amount": round(float(row['total']), 2),
            "count": int(row['count']),
            "percentage": round((float(row['total']) / total_exp * 100), 1) if total_exp > 0 else 0.0
        }
        for _, row in pm_grouped.iterrows()
    ]

    return {
        "weekday_vs_weekend": {
            "total_weekday": round(total_weekday, 2),
            "total_weekend": round(total_weekend, 2),
            "avg_weekday_daily": avg_weekday_daily,
            "avg_weekend_daily": avg_weekend_daily,
            "weekend_multiplier": round(avg_weekend_daily / avg_weekday_daily, 2) if avg_weekday_daily > 0 else 1.0,
            "weekend_premium_pct": weekend_premium_pct
        },
        "day_of_week": dow_list,
        "payment_methods": pm_list
    }

def compute_calendar_heatmap(df):
    if df.empty:
        return {}

    daily = df.groupby(['date', 'type'])['amount'].sum().unstack(fill_value=0).reset_index()
    if 'Expense' not in daily.columns:
        daily['Expense'] = 0.0
    if 'Income' not in daily.columns:
        daily['Income'] = 0.0

    counts = df.groupby('date')['id'].count().to_dict()

    max_expense = daily['Expense'].max()
    heatmap = {}

    for _, row in daily.iterrows():
        d = row['date']
        exp = float(row['Expense'])
        inc = float(row['Income'])
        
        # Calculate intensity 0-4
        if exp == 0:
            intensity = 0
        elif exp < 500:
            intensity = 1
        elif exp < 1500:
            intensity = 2
        elif exp < 3500:
            intensity = 3
        else:
            intensity = 4

        heatmap[d] = {
            "expense": round(exp, 2),
            "income": round(inc, 2),
            "count": counts.get(d, 0),
            "intensity": intensity
        }

    return heatmap

def compute_monte_carlo_runway(df, num_simulations=500, days_ahead=180):
    income_df = df[df['type'] == 'Income']
    expense_df = df[df['type'] == 'Expense']

    current_balance = float(income_df['amount'].sum() - expense_df['amount'].sum()) if not df.empty else 50000.0

    # Empirical daily aggregates
    df_copy = df.copy()
    df_copy['date_dt'] = pd.to_datetime(df_copy['date'])
    daily_net = df_copy.groupby(['date_dt', 'type'])['amount'].sum().unstack(fill_value=0)
    if 'Expense' not in daily_net.columns:
        daily_net['Expense'] = 0.0
    if 'Income' not in daily_net.columns:
        daily_net['Income'] = 0.0

    daily_net['net'] = daily_net['Income'] - daily_net['Expense']
    historical_net = daily_net['net'].values

    if len(historical_net) == 0:
        historical_net = np.array([200.0, -500.0, -1200.0, 3000.0])

    # Simulation engine
    simulated_trajectories = np.zeros((num_simulations, days_ahead))

    for sim in range(num_simulations):
        sampled_daily_flows = np.random.choice(historical_net, size=days_ahead, replace=True)
        # Add random economic variance (+/- 10%)
        noise = np.random.normal(1.0, 0.08, size=days_ahead)
        simulated_trajectories[sim, :] = current_balance + np.cumsum(sampled_daily_flows * noise)

    # Calculate percentiles across time steps
    # We sample every 15 days for clean chart rendering
    step = 15
    timeline = []
    start_date = datetime.now()

    for d in range(0, days_ahead, step):
        dt_str = (start_date + timedelta(days=d)).strftime('%b %Y') if d % 30 == 0 else f"+{d}d"
        p10 = float(np.percentile(simulated_trajectories[:, d], 10))
        p50 = float(np.percentile(simulated_trajectories[:, d], 50))
        p90 = float(np.percentile(simulated_trajectories[:, d], 90))

        timeline.append({
            "step_day": d,
            "label": dt_str,
            "conservative_p10": round(p10, 2),
            "median_p50": round(p50, 2),
            "optimistic_p90": round(p90, 2)
        })

    positive_probability = round(float(np.mean(simulated_trajectories[:, -1] > 0) * 100), 1)

    return {
        "current_balance": round(current_balance, 2),
        "days_simulated": days_ahead,
        "positive_probability": positive_probability,
        "projections": timeline
    }
