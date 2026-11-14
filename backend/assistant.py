import re
from datetime import datetime, timedelta
import pandas as pd
import analytics
from database import get_db

def format_curr(amount, currency="₹"):
    return f"{currency}{amount:,.2f}"

def answer_query(user_message, currency="₹", time_filter="all"):
    """
    Intelligent NLP & Financial Intelligence Assistant for Xpenzic.
    Analyzes queries regarding spending, top categories, budgets, savings, runway,
    affordability simulations, category drilldowns, and month-over-month comparisons.
    """
    msg = user_message.lower().strip()
    
    conn = get_db()
    df = pd.read_sql_query("SELECT * FROM transactions ORDER BY date DESC, time DESC", conn)
    budgets_df = pd.read_sql_query("SELECT * FROM budgets", conn)
    conn.close()

    if df.empty:
        return (
            "📭 **Your transaction ledger is currently empty.**\n\n"
            "Once you record some expenses and income (using the **+ Add Record** button), "
            "I will be able to analyze where your money goes, track budgets, and calculate your savings rate!"
        )

    df['date_dt'] = pd.to_datetime(df['date'])
    expense_df = df[df['type'] == 'Expense']
    income_df = df[df['type'] == 'Income']

    now = datetime.now()
    curr_year = now.year
    curr_month = now.month
    today_str = now.strftime('%Y-%m-%d')

    total_expense = float(expense_df['amount'].sum()) if not expense_df.empty else 0.0
    total_income = float(income_df['amount'].sum()) if not income_df.empty else 0.0
    net_savings = total_income - total_expense
    savings_rate = round((net_savings / total_income * 100), 1) if total_income > 0 else 0.0

    kpi = analytics.compute_kpi_summary(df)
    burn_rate = float(kpi.get('burn_rate_30d', 0.0))
    runway_mo = float(kpi.get('runway_months', 0.0))

    # 1. AFFORDABILITY SIMULATION: "Can I afford X?" / "Should I buy X?"
    if any(k in msg for k in ["afford", "can i buy", "should i buy", "if i spend"]):
        # Extract number using regex
        numbers = re.findall(r'[\d,]+(?:\.\d+)?', msg)
        clean_nums = []
        for n in numbers:
            try:
                val = float(n.replace(',', ''))
                if val > 0:
                    clean_nums.append(val)
            except ValueError:
                pass

        if clean_nums:
            target_amt = clean_nums[0]
            pct_of_savings = round((target_amt / net_savings * 100), 1) if net_savings > 0 else 100.0
            new_net = max(0.0, net_savings - target_amt)
            new_runway = round(new_net / burn_rate, 1) if burn_rate > 0 else 0.0

            if pct_of_savings <= 10.0:
                verdict = "🟢 **Safe & Highly Affordable**"
                advice = "This purchase represents a small fraction of your net reserves and will not meaningfully affect your financial runway."
            elif pct_of_savings <= 25.0:
                verdict = "🟡 **Manageable (Moderate Impact)**"
                advice = "You have sufficient buffer, but consider spacing out other discretionary outlays this month."
            else:
                verdict = "🔴 **High Impact (Caution Advised)**"
                advice = "This purchase exceeds 25% of your total net surplus and will noticeably compress your emergency runway."

            return (
                f"🧮 **Affordability Analysis for {format_curr(target_amt, currency)}:**\n\n"
                f"• **Verdict:** {verdict}\n"
                f"• **Net Savings Before:** {format_curr(net_savings, currency)}\n"
                f"• **Net Savings After:** {format_curr(new_net, currency)} (*-{pct_of_savings}% of reserve*)\n"
                f"• **Current Runway:** **{runway_mo} Mo** ➔ **{new_runway} Mo**\n"
                f"• **30-Day Burn Rate:** {format_curr(burn_rate, currency)}/mo\n\n"
                f"💡 **Recommendation:** {advice}"
            )
        else:
            return (
                f"💡 To check affordability, specify an amount! For example:\n"
                f"• *\"Can I afford a {currency}15,000 phone?\"*\n"
                f"• *\"Can I afford {currency}5,000 for vacation?\"*"
            )

    # 2. TOP SPENDING / "WHERE IS MY MONEY GONE MOSTLY?"
    if any(k in msg for k in [
        "where", "gone", "mostly", "top spend", "top expense", "most spend", 
        "highest spend", "where money", "where did my money", "spending most",
        "where is my money", "category spend", "main expense"
    ]):
        if expense_df.empty:
            return "You haven't recorded any expenses yet!"

        cat_summary = expense_df.groupby('category')['amount'].agg(['sum', 'count']).reset_index()
        cat_summary = cat_summary.sort_values(by='sum', ascending=False)
        cat_summary['pct'] = (cat_summary['sum'] / total_expense * 100).round(1)

        top_cat = cat_summary.iloc[0]
        top_name = top_cat['category']
        top_amt = top_cat['sum']
        top_pct = top_cat['pct']

        lines = [
            f"📊 **Here is where your money has mostly gone:**\n",
            f"Out of **{format_curr(total_expense, currency)}** in total expenses, your spending breakdown is:\n"
        ]

        medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"]
        for idx, row in cat_summary.head(5).iterrows():
            pos = len(lines) - 2
            icon = medals[pos] if pos < len(medals) else "•"
            lines.append(f"{icon} **{row['category']}**: {format_curr(row['sum'], currency)} (*{row['pct']}%* across {row['count']} transactions)")

        lines.append(
            f"\n💡 **Key Takeaway:** Your single biggest money sink is **{top_name}**, consuming **{top_pct}%** "
            f"({format_curr(top_amt, currency)}) of your total spending. Trimming even 10% from this category could save you "
            f"**{format_curr(top_amt * 0.10, currency)}**."
        )
        return "\n".join(lines)

    # 3. CATEGORY SPECIFIC DRILLDOWNS (Food, Shopping, Entertainment, Rent, Utilities, Transport, Health)
    category_map = {
        "food": "Food & Beverages",
        "beverage": "Food & Beverages",
        "dining": "Food & Beverages",
        "restaurant": "Food & Beverages",
        "grocery": "Food & Beverages",
        "groceries": "Food & Beverages",
        "shopping": "Shopping",
        "clothes": "Shopping",
        "clothing": "Shopping",
        "electronics": "Shopping",
        "entertainment": "Entertainment",
        "movies": "Entertainment",
        "games": "Entertainment",
        "rent": "Home",
        "home": "Home",
        "apartment": "Home",
        "housing": "Home",
        "utilities": "Utilities",
        "electricity": "Utilities",
        "wifi": "Utilities",
        "transport": "Transport",
        "travel": "Transport",
        "fuel": "Transport",
        "cab": "Transport",
        "uber": "Transport",
        "health": "Health",
        "medical": "Health",
        "doctor": "Health",
        "clinic": "Health",
        "education": "Education",
        "course": "Education",
        "books": "Education",
        "salary": "Salary",
        "bonus": "Bonus",
        "side job": "Side job",
        "freelance": "Side job",
        "investment": "InvestmentIncome",
    }

    is_income_query = any(k in msg for k in [
        "income", "inflow", "inflows", "earn", "earned", "earning", "earnings",
        "salary", "bonus", "side job", "revenue", "received"
    ])

    matched_cat = None
    for kw, target_cat in category_map.items():
        if re.search(r'\b' + re.escape(kw) + r'\b', msg):
            matched_cat = target_cat
            break

    if matched_cat and any(k in msg for k in ["how much", "spend", "spent", "earn", "earned", "get", "got", "cost", "total", "breakdown", "category"]):
        income_cats = {"Salary", "Bonus", "Side job", "InvestmentIncome", "GiftsIncome", "OtherIncome"}
        is_inc_cat = matched_cat in income_cats
        c_df = (income_df if is_inc_cat else expense_df)[(income_df if is_inc_cat else expense_df)['category'] == matched_cat]
        denom_total = total_income if is_inc_cat else total_expense
        noun_label = "income" if is_inc_cat else "expenses"
        action_label = "Total Earned" if is_inc_cat else "Total Spent"
        share_label = "Share of Total Income" if is_inc_cat else "Share of Total Spend"
        peak_label = "Peak Deposit" if is_inc_cat else "Peak Purchase"

        if c_df.empty:
            return f"🛒 You have recorded **{format_curr(0.0, currency)}** in {noun_label} under **{matched_cat}**."

        c_total = float(c_df['amount'].sum())
        c_count = len(c_df)
        c_pct = round((c_total / denom_total * 100), 1) if denom_total > 0 else 0.0
        c_avg = round(c_total / c_count, 2)
        top_c_tx = c_df.sort_values(by='amount', ascending=False).iloc[0]

        recent_txs = []
        for _, r in c_df.head(3).iterrows():
            recent_txs.append(f"• **{format_curr(r['amount'], currency)}** (*{r['description'] or 'General'}* on {r['date']})")

        return (
            f"🏷️ **Category Drilldown: {matched_cat}**\n\n"
            f"• **{action_label}:** **{format_curr(c_total, currency)}**\n"
            f"• **{share_label}:** **{c_pct}%**\n"
            f"• **Recorded Transactions:** {c_count}\n"
            f"• **Average per Transaction:** {format_curr(c_avg, currency)}\n"
            f"• **{peak_label}:** {format_curr(top_c_tx['amount'], currency)} (*\"{top_c_tx['description']}\"* on {top_c_tx['date']})\n\n"
            f"**Recent Entries in {matched_cat}:**\n" + "\n".join(recent_txs)
        )

    # 4. BIGGEST SINGLE PURCHASE OR INCOME SOURCE
    if any(k in msg for k in [
        "biggest purchase", "largest purchase", "highest expense", "biggest expense",
        "max spend", "highest transaction", "largest expense", "costliest",
        "biggest income", "largest income", "highest income", "max income"
    ]):
        target_df = income_df if is_income_query else expense_df
        noun = "income" if is_income_query else "expenses"
        header = "Your Largest Single Income Entry" if is_income_query else "Your Largest Single Expense"
        list_title = "Top 3 Largest Income Entries" if is_income_query else "Top 3 Largest Purchases"

        if target_df.empty:
            return f"No {noun} recorded yet."

        top_tx = target_df.sort_values(by='amount', ascending=False).iloc[0]
        amt = float(top_tx['amount'])
        desc = top_tx['description'] or 'No description'
        cat = top_tx['category']
        dt = top_tx['date']

        top_3 = target_df.sort_values(by='amount', ascending=False).head(3)
        top_3_lines = []
        for _, r in top_3.iterrows():
            top_3_lines.append(f"• **{format_curr(r['amount'], currency)}** — {r['category']} (*\"{r['description']}\"* on {r['date']})")

        return (
            f"🏆 **{header}:**\n\n"
            f"• **Amount:** **{format_curr(amt, currency)}**\n"
            f"• **Category:** {cat}\n"
            f"• **Memo:** {desc}\n"
            f"• **Date:** {dt}\n\n"
            f"**{list_title}:**\n" + "\n".join(top_3_lines)
        )

    # 5. MONTH-OVER-MONTH COMPARISON
    if any(k in msg for k in ["compare", "vs last month", "month over month", "mom", "trend"]):
        first_of_curr = now.replace(day=1)
        last_of_prev = first_of_curr - timedelta(days=1)
        prev_year, prev_month = last_of_prev.year, last_of_prev.month

        curr_month_name = now.strftime('%B %Y')
        curr_short_name = now.strftime('%b %Y')
        prev_month_name = last_of_prev.strftime('%B %Y')
        prev_short_name = last_of_prev.strftime('%b %Y')

        target_df = income_df if is_income_query else expense_df
        metric_noun = "Income" if is_income_query else "Spend"

        curr_df = target_df[(target_df['date_dt'].dt.year == curr_year) & (target_df['date_dt'].dt.month == curr_month)]
        prev_df = target_df[(target_df['date_dt'].dt.year == prev_year) & (target_df['date_dt'].dt.month == prev_month)]

        curr_val = float(curr_df['amount'].sum()) if not curr_df.empty else 0.0
        prev_val = float(prev_df['amount'].sum()) if not prev_df.empty else 0.0

        diff = curr_val - prev_val
        pct_diff = round((diff / prev_val * 100), 1) if prev_val > 0 else 0.0

        trend_icon = "📈" if diff >= 0 else "📉"
        trend_status = "increased" if diff >= 0 else "decreased"

        if is_income_query:
            note = "Great growth in earnings!" if diff >= 0 else "Monthly inflows are slightly lower than last month."
        else:
            note = "Keep an eye on discretionary leisure categories." if diff > 0 else "Excellent discipline keeping outlays down!"

        return (
            f"📊 **Month-over-Month {metric_noun} Comparison ({curr_short_name} vs {prev_short_name}):**\n\n"
            f"• **{prev_month_name} {metric_noun}:** {format_curr(prev_val, currency)}\n"
            f"• **{curr_month_name} {metric_noun}:** {format_curr(curr_val, currency)}\n"
            f"• **Variance:** {trend_icon} **{format_curr(abs(diff), currency)}** ({pct_diff}%)\n\n"
            f"💡 Your monthly {metric_noun.lower()} {trend_status} by **{abs(pct_diff)}%** compared to last month. {note}"
        )

    # 6. UNUSUAL TRANSACTIONS & ANOMALIES
    if any(k in msg for k in ["anomaly", "anomalies", "unusual", "suspicious", "spike", "outlier"]):
        anomalies = analytics.detect_anomalies(df)
        if not anomalies:
            return "🛡️ **No statistical anomalies detected!** All recorded expenses fall comfortably within expected Gaussian distributions."

        lines = [f"⚠️ **Detected {len(anomalies)} Statistical Outliers:**\n"]
        for a in anomalies[:4]:
            lines.append(f"• **{format_curr(a['amount'], currency)}** on {a['date']} — **{a['category']}** (*{a['description']}*)\n  Deviation: **{a['multiplier_of_avg']}x** category average (Severity: {a['severity']})")

        return "\n".join(lines)

    # 7. PAYMENT METHOD BREAKDOWN
    if any(k in msg for k in ["payment", "upi", "card", "credit card", "cash", "how do i pay"]):
        pm_summary = expense_df.groupby('payment_method')['amount'].agg(['sum', 'count']).reset_index()
        pm_summary = pm_summary.sort_values(by='sum', ascending=False)
        pm_summary['pct'] = (pm_summary['sum'] / total_expense * 100).round(1)

        lines = ["💳 **Payment Method Distribution:**\n"]
        for _, row in pm_summary.iterrows():
            lines.append(f"• **{row['payment_method']}**: {format_curr(row['sum'], currency)} (*{row['pct']}%* — {row['count']} transactions)")

        return "\n".join(lines)

    # 8. BUDGET OVERVIEW / AM I OVER BUDGET?
    if any(k in msg for k in ["budget", "over budget", "limit", "exceed", "discipline"]):
        if budgets_df.empty:
            return "No budget limits configured in Settings."

        curr_m_df = expense_df[(expense_df['date_dt'].dt.year == curr_year) & (expense_df['date_dt'].dt.month == curr_month)]
        curr_m_spent = curr_m_df.groupby('category')['amount'].sum().to_dict()

        over_budget = []
        compliant = []

        for _, b in budgets_df.iterrows():
            cat = b['category']
            limit = float(b['monthly_limit'])
            spent = float(curr_m_spent.get(cat, 0.0))
            pct = round((spent / limit * 100), 1) if limit > 0 else 0.0

            if spent > limit:
                over_budget.append(f"• 🚨 **{cat}**: Spent **{format_curr(spent, currency)}** / {format_curr(limit, currency)} (*{pct}%* — **+{format_curr(spent - limit, currency)} over limit!**)")
            else:
                compliant.append(f"• ✅ **{cat}**: Spent {format_curr(spent, currency)} / {format_curr(limit, currency)} (*{pct}%*)")

        result = [f"🎯 **Monthly Budget Performance ({now.strftime('%B %Y')}):**\n"]
        if over_budget:
            result.append("**Categories Exceeding Budget:**")
            result.extend(over_budget)
            result.append("")
        else:
            result.append("🎉 **Great news! None of your categories have exceeded their budget limits this month.**\n")

        if compliant:
            result.append("**Within Budget Limits:**")
            result.extend(compliant[:4])

        return "\n".join(result)

    # 9. SAVINGS RATE & FINANCIAL RUNWAY
    if any(k in msg for k in ["saving", "savings rate", "runway", "burn rate", "how long will my money last", "net balance", "surplus"]):
        status = "Safe" if runway_mo >= 3 else "Tight"
        
        return (
            f"💰 **Financial Health & Runway Analysis:**\n\n"
            f"• **Total Inflows:** {format_curr(total_income, currency)}\n"
            f"• **Total Outflows:** {format_curr(total_expense, currency)}\n"
            f"• **Net Savings:** **{format_curr(net_savings, currency)}**\n"
            f"• **Savings Rate:** **{savings_rate}%** {'(Target Met! 🎯)' if savings_rate >= 20 else '(Below 20% target ⚠️)'}\n"
            f"• **Monthly Burn Rate:** {format_curr(burn_rate, currency)} / month\n"
            f"• **Estimated Runway:** **{runway_mo} Months** ({status})\n\n"
            f"💡 At your current burn rate, your savings provide a financial cushion of **{runway_mo} months** without needing additional income."
        )

    # 10. HOW TO SAVE MORE MONEY / FINANCIAL ADVICE
    if any(k in msg for k in ["how to save", "save more", "tips", "advice", "cut expense", "reduce spend", "help me save"]):
        cat_summary = expense_df.groupby('category')['amount'].sum().sort_values(ascending=False)
        top_cats = cat_summary.head(2)
        top1_name = top_cats.index[0]
        top1_amt = top_cats.iloc[0]
        top2_name = top_cats.index[1] if len(top_cats) > 1 else "Discretionary"
        top2_amt = top_cats.iloc[1] if len(top_cats) > 1 else 0

        pot_savings = (top1_amt * 0.10) + (top2_amt * 0.10)

        return (
            f"💡 **Actionable Ways to Save More:**\n\n"
            f"1. **Target the Pareto 80/20 Rule:**\n"
            f"   Your two biggest spend categories are **{top1_name}** ({format_curr(top1_amt, currency)}) and "
            f"**{top2_name}** ({format_curr(top2_amt, currency)}). Trimming just 10% from these two areas alone will save you "
            f"**{format_curr(pot_savings, currency)}**!\n\n"
            f"2. **Implement a 48-Hour Cooling Rule:**\n"
            f"   Before buying non-essential items over {currency}1,000, wait 48 hours to eliminate impulse buys.\n\n"
            f"3. **Zero-Spend Days:**\n"
            f"   Try scheduling 1-2 zero-spend days every week where no discretionary payments occur."
        )

    # 11. WEEKEND VS WEEKDAY
    if any(k in msg for k in ["weekend", "weekday", "saturday", "sunday"]):
        insights = analytics.compute_behavioral_insights(df)
        mult = insights.get('weekday_vs_weekend', {}).get('weekend_multiplier', 1.0)
        return (
            f"🗓️ **Behavioral Weekend Analysis:**\n\n"
            f"• Your weekend spending velocity is **{mult}x** your average weekday spending.\n"
            f"• Most weekend outlays are driven by Dining, Shopping, and Entertainment.\n"
            f"• Setting a specific weekend allowance can help keep monthly burn rate in check!"
        )

    # 12. INCOME / SPENDING BY TIMEFRAME (Today, Week, Month, Year, All-Time)
    has_period_kw = bool(re.search(r'\b(today|week|month|year)\b', msg))
    has_spend_kw = bool(re.search(r'\b(spend|spending|spent|expense|expenses|expence|expences|outflow|outflows|cost)\b', msg))

    if is_income_query or has_period_kw or has_spend_kw:
        base_df = income_df if is_income_query else expense_df

        if "today" in msg:
            sub = base_df[base_df['date'] == today_str]
            period_label = f"Today ({now.strftime('%b %d, %Y')})"
        elif "week" in msg:
            week_start = now - timedelta(days=now.weekday())
            week_start_str = week_start.strftime('%Y-%m-%d')
            sub = base_df[(base_df['date'] >= week_start_str) & (base_df['date'] <= today_str)]
            period_label = f"This Week ({week_start.strftime('%b %d')} – {now.strftime('%b %d')})"
        elif "year" in msg:
            sub = base_df[base_df['date_dt'].dt.year == curr_year]
            period_label = f"This Year ({curr_year})"
        elif "month" in msg or not is_income_query:
            sub = base_df[(base_df['date_dt'].dt.year == curr_year) & (base_df['date_dt'].dt.month == curr_month)]
            period_label = f"This Month ({now.strftime('%B %Y')})"
        else:
            # General "income" / "total income" / "my income" query across all time
            sub = base_df
            period_label = "All Time"

        sub_total = float(sub['amount'].sum()) if not sub.empty else 0.0
        sub_count = len(sub)

        if sub.empty:
            noun = "income" if is_income_query else "expenses"
            return f"🗓️ You have **{format_curr(0.0, currency)}** in recorded {noun} for **{period_label}**."

        top_sub_cat = sub.groupby('category')['amount'].sum().sort_values(ascending=False)
        top_c_name = top_sub_cat.index[0]
        top_c_amt = top_sub_cat.iloc[0]

        if is_income_query:
            return (
                f"💵 **Income Summary for {period_label}:**\n\n"
                f"• **Total Inflow:** **{format_curr(sub_total, currency)}**\n"
                f"• **Total Entries:** {sub_count}\n"
                f"• **Top Income Source:** **{top_c_name}** ({format_curr(top_c_amt, currency)} or {round(top_c_amt/sub_total*100, 1)}%)\n"
                f"• **Average per entry:** {format_curr(sub_total / sub_count, currency)}"
            )

        return (
            f"💳 **Spending Summary for {period_label}:**\n\n"
            f"• **Total Outflow:** **{format_curr(sub_total, currency)}**\n"
            f"• **Total Transactions:** {sub_count}\n"
            f"• **Top Category:** **{top_c_name}** ({format_curr(top_c_amt, currency)} or {round(top_c_amt/sub_total*100, 1)}%)\n"
            f"• **Average per transaction:** {format_curr(sub_total / sub_count, currency)}"
        )

    # 13. GENERAL GREETING / FALLBACK
    return (
        f"👋 Hi! I'm your **Xpenzic Financial Assistant**.\n\n"
        f"Here is your current financial pulse:\n"
        f"• **Net Savings:** {format_curr(net_savings, currency)} ({savings_rate}% savings rate)\n"
        f"• **Total Expenses:** {format_curr(total_expense, currency)}\n"
        f"• **Total Inflows:** {format_curr(total_income, currency)}\n\n"
        f"**You can ask me questions like:**\n"
        f"• *\"Where is my money gone mostly?\"*\n"
        f"• *\"Can I afford a {currency}15,000 purchase?\"*\n"
        f"• *\"How much did I spend on Food?\"*\n"
        f"• *\"Compare this month vs last month\"*\n"
        f"• *\"Any unusual transaction anomalies?\"*\n"
        f"• *\"Am I over budget on anything?\"*"
    )
