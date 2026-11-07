import sys
import os

from database import init_db, get_db
from seed_data import seed_database
import analytics
import pandas as pd

def run_tests():
    print("1. Initializing DB and Seeding...")
    seed_database(clear_first=True)
    
    conn = get_db()
    df = pd.read_sql_query("SELECT * FROM transactions", conn)
    conn.close()
    
    print(f"Total transactions loaded: {len(df)}")
    
    print("\n2. KPI Summary:")
    summary = analytics.compute_kpi_summary(df)
    for k, v in summary.items():
        print(f"  {k}: {v}")
        
    print("\n3. Category Breakdown (Expense):")
    cats = analytics.compute_category_breakdown(df, 'Expense')
    print(f"  Found {len(cats)} categories. Top: {cats[0]['category']} ({cats[0]['percentage']}%)")
    
    print("\n4. Monthly Trends:")
    trends = analytics.compute_monthly_trends(df)
    print(f"  Found {len(trends)} months of data.")
    for t in trends[:3]:
        print(f"  {t['month_label']}: Inc={t['income']}, Exp={t['expense']}, Net={t['net_savings']}")
        
    print("\n5. Predictive Forecast:")
    forecast = analytics.compute_predictive_forecast(df, days_ahead=15)
    print(f"  Forecast metrics: {forecast['model_metrics']}")
    print(f"  First 3 forecast days: {forecast['forecast'][:3]}")
    
    print("\n6. Anomaly Detection:")
    anomalies = analytics.detect_anomalies(df)
    print(f"  Detected {len(anomalies)} anomalies. Top outlier: {anomalies[0]['description']} - ₹{anomalies[0]['amount']}")
    
    print("\n7. Pareto Analysis:")
    pareto = analytics.compute_pareto_analysis(df)
    top_drivers = [p['category'] for p in pareto if p['is_top_driver']]
    print(f"  Pareto 80% drivers: {', '.join(top_drivers)}")
    
    print("\n8. Behavioral Insights:")
    behavior = analytics.compute_behavioral_insights(df)
    print(f"  Weekday avg: ₹{behavior['weekday_vs_weekend']['avg_weekday_daily']} vs Weekend avg: ₹{behavior['weekday_vs_weekend']['avg_weekend_daily']}")
    print(f"  Weekend multiplier: {behavior['weekday_vs_weekend']['weekend_multiplier']}x")
    
    print("\n9. Monte Carlo Runway:")
    sims = analytics.compute_monte_carlo_runway(df)
    print(f"  Positive Runway probability: {sims['positive_probability']}%")
    print(f"  6-month median projection: ₹{sims['projections'][-1]['median_p50']}")
    
    print("\nALL BACKEND ANALYTICS TESTS PASSED!")

if __name__ == '__main__':
    run_tests()

