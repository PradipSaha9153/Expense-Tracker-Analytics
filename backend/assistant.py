import re
import pandas as pd
import sqlite3
from datetime import datetime
import analytics
from database import get_db

def format_curr(amount, currency="₹"):
    return f"{currency}{amount:,.2f}"

def answer_query(user_message, currency="₹", time_filter="all"):
    """
    Intelligent NLP & Financial Intelligence Assistant for Xpenzic.
    Analyzes queries regarding spending, top categories, budgets, savings, and runway.
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

    total_expense = float(expense_df['amount'].sum()) if not expense_df.empty else 0.0
    total_income = float(income_df['amount'].sum()) if not income_df.empty else 0.0
    net_savings = total_income - total_expense
    savings_rate = round((net_savings / total_income * 100), 1) if total_income > 0 else 0.0

    # 1. TOP SPENDING / "WHERE IS MY MONEY GONE MOSTLY?"
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

    # 2. BIGGEST SINGLE PURCHASE / OUTLIER
    if any(k in msg for k in [
        "biggest purchase", "largest purchase", "highest expense", "biggest expense",
        "max spend", "highest transaction", "largest expense", "costliest"
    ]):
        if expense_df.empty:
            return "No expenses recorded yet."

        top_tx = expense_df.sort_values(by='amount', ascending=False).iloc[0]
        amt = float(top_tx['amount'])
        desc = top_tx['description'] or 'No description'
        cat = top_tx['category']
        dt = top_tx['date']

        top_3 = expense_df.sort_values(by='amount', ascending=False).head(3)
        top_3_lines = []
        for _, r in top_3.iterrows():
            top_3_lines.append(f"• **{format_curr(r['amount'], currency)}** — {r['category']} (*\"{r['description']}\"* on {r['date']})")

        return (
            f"🏆 **Your Largest Single Expense:**\n\n"
            f"• **Amount:** **{format_curr(amt, currency)}**\n"
            f"• **Category:** {cat}\n"
            f"• **Memo:** {desc}\n"
            f"• **Date:** {dt}\n\n"
            f"**Top 3 Largest Purchases:**\n" + "\n".join(top_3_lines)
        )

    # 3. SPENDING IN A SPECIFIC TIMEFRAME (Today, Week, Month, Year)
    if any(k in msg for k in ["today", "this month", "this week", "this year", "how much did i spend", "how much i spent", "spent"]):
        # Determine timeframe
        today_str = "2026-11-08"
        
        if "today" in msg:
            sub = expense_df[expense_df['date'] == today_str]
            period_label = "Today (Nov 08, 2026)"
        elif "week" in msg:
            sub = expense_df[(expense_df['date'] >= '2026-11-02') & (expense_df['date'] <= today_str)]
            period_label = "This Week (Nov 02 – Nov 08)"
        elif "year" in msg:
            sub = expense_df[expense_df['date_dt'].dt.year == 2026]
            period_label = "This Year (2026)"
        else: # Month (default November)
            sub = expense_df[(expense_df['date_dt'].dt.year == 2026) & (expense_df['date_dt'].dt.month == 11)]
            period_label = "This Month (November 2026)"

        sub_total = float(sub['amount'].sum()) if not sub.empty else 0.0
        sub_count = len(sub)
        
        if sub.empty:
            return f"🗓️ You have **₹0.00** in recorded expenses for **{period_label}**."

        top_sub_cat = sub.groupby('category')['amount'].sum().sort_values(ascending=False)
        top_c_name = top_sub_cat.index[0]
        top_c_amt = top_sub_cat.iloc[0]

        return (
            f"💳 **Spending Summary for {period_label}:**\n\n"
            f"• **Total Outflow:** **{format_curr(sub_total, currency)}**\n"
            f"• **Total Transactions:** {sub_count}\n"
            f"• **Top Category:** **{top_c_name}** ({format_curr(top_c_amt, currency)} or {round(top_c_amt/sub_total*100, 1)}%)\n"
            f"• **Average per transaction:** {format_curr(sub_total / sub_count, currency)}"
        )

    # 4. BUDGET OVERVIEW / AM I OVER BUDGET?
    if any(k in msg for k in ["budget", "over budget", "limit", "exceed", "discipline"]):
        if budgets_df.empty:
            return "No budget limits configured in Settings."

        # Calculate current month (Nov 2026) spend per category
        nov_df = expense_df[(expense_df['date_dt'].dt.year == 2026) & (expense_df['date_dt'].dt.month == 11)]
        nov_spent = nov_df.groupby('category')['amount'].sum().to_dict()

        over_budget = []
        compliant = []

        for _, b in budgets_df.iterrows():
            cat = b['category']
            limit = float(b['monthly_limit'])
            spent = float(nov_spent.get(cat, 0.0))
            pct = round((spent / limit * 100), 1) if limit > 0 else 0.0

            if spent > limit:
                over_budget.append(f"• 🚨 **{cat}**: Spent **{format_curr(spent, currency)}** / {format_curr(limit, currency)} (*{pct}%* — **+{format_curr(spent - limit, currency)} over limit!**)")
            else:
                compliant.append(f"• ✅ **{cat}**: Spent {format_curr(spent, currency)} / {format_curr(limit, currency)} (*{pct}%*)")

        result = ["🎯 **Monthly Budget Performance (November 2026):**\n"]
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

    # 5. SAVINGS RATE & FINANCIAL RUNWAY
    if any(k in msg for k in ["saving", "savings rate", "runway", "burn rate", "how long will my money last", "net balance", "surplus"]):
        kpi = analytics.compute_kpi_summary(df)
        burn_rate = float(kpi.get('burn_rate_30d', 0.0))
        runway_mo = float(kpi.get('runway_months', 0.0))
        
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

    # 6. HOW TO SAVE MORE MONEY / FINANCIAL ADVICE
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

    # 7. WEEKEND VS WEEKDAY
    if any(k in msg for k in ["weekend", "weekday", "saturday", "sunday"]):
        insights = analytics.compute_behavioral_insights(df)
        mult = insights.get('weekday_vs_weekend', {}).get('weekend_multiplier', 1.0)
        return (
            f"🗓️ **Behavioral Weekend Analysis:**\n\n"
            f"• Your weekend spending velocity is **{mult}x** your average weekday spending.\n"
            f"• Most weekend outlays are driven by Dining, Shopping, and Entertainment.\n"
            f"• Setting a specific weekend allowance can help keep monthly burn rate in check!"
        )

    # 8. GENERAL GREETING / FALLBACK
    return (
        f"👋 Hi! I'm your **Xpenzic Financial Assistant**.\n\n"
        f"Here is your current financial pulse:\n"
        f"• **Net Savings:** {format_curr(net_savings, currency)} ({savings_rate}% savings rate)\n"
        f"• **Total Expenses:** {format_curr(total_expense, currency)}\n"
        f"• **Total Inflows:** {format_curr(total_income, currency)}\n\n"
        f"**You can ask me questions like:**\n"
        f"• *\"Where is my money gone mostly?\"*\n"
        f"• *\"How much did I spend this month?\"*\n"
        f"• *\"What was my biggest expense?\"*\n"
        f"• *\"Am I over budget on anything?\"*\n"
        f"• *\"What is my savings rate and runway?\"*\n"
        f"• *\"How can I save more money?\"*"
    )
