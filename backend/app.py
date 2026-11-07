from flask import Flask, request, jsonify, make_response, send_from_directory
import pandas as pd
import sqlite3
import os
import io
import csv

from database import get_db, init_db
from seed_data import seed_database
import analytics

# Locate frontend dist directory if built
DIST_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))

if os.path.exists(DIST_FOLDER):
    app = Flask(__name__, static_folder=DIST_FOLDER, static_url_path='')
else:
    app = Flask(__name__)

# Ensure DB initialized on startup
init_db()

# Enable CORS for all routes without requiring external packages
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Xpenzic Data Analytics API",
        "version": "1.0.0"
    })

def get_filtered_df(request_args):
    conn = get_db()
    query = "SELECT * FROM transactions WHERE 1=1"
    params = []

    type_filter = request_args.get('type')
    if type_filter and type_filter in ['Expense', 'Income']:
        query += " AND type = ?"
        params.append(type_filter)

    category = request_args.get('category')
    if category and category != 'All':
        query += " AND category = ?"
        params.append(category)

    payment_method = request_args.get('payment_method')
    if payment_method and payment_method != 'All':
        query += " AND payment_method = ?"
        params.append(payment_method)

    start_date = request_args.get('start_date')
    if start_date:
        query += " AND date >= ?"
        params.append(start_date)

    end_date = request_args.get('end_date')
    if end_date:
        query += " AND date <= ?"
        params.append(end_date)

    search = request_args.get('search')
    if search:
        query += " AND (description LIKE ? OR category LIKE ? OR subcategory LIKE ?)"
        s = f"%{search}%"
        params.extend([s, s, s])

    query += " ORDER BY date DESC, time DESC"

    df = pd.read_sql_query(query, conn, params=params)
    conn.close()
    return df

# ----------------- TRANSACTIONS CRUD ----------------- #

@app.route('/api/transactions', methods=['GET', 'OPTIONS'])
def list_transactions():
    if request.method == 'OPTIONS':
        return make_response(), 200

    df = get_filtered_df(request.args)
    records = df.to_dict(orient='records')
    return jsonify({
        "total": len(records),
        "data": records
    })

@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    data = request.get_json() or {}
    t_type = data.get('type', 'Expense')
    amount = float(data.get('amount', 0.0))
    category = data.get('category', 'OtherExpense')
    subcategory = data.get('subcategory', category)
    description = data.get('description', '')
    date_val = data.get('date') or pd.Timestamp.now().strftime('%Y-%m-%d')
    time_val = data.get('time') or pd.Timestamp.now().strftime('%H:%M')
    payment_method = data.get('payment_method', 'UPI')

    if amount <= 0:
        return jsonify({"error": "Amount must be greater than zero"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO transactions (type, amount, category, subcategory, description, date, time, payment_method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (t_type, amount, category, subcategory, description, date_val, time_val, payment_method))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({"status": "created", "id": new_id}), 201

@app.route('/api/transactions/<int:t_id>', methods=['PUT', 'OPTIONS'])
def update_transaction(t_id):
    if request.method == 'OPTIONS':
        return make_response(), 200

    data = request.get_json() or {}
    t_type = data.get('type')
    amount = data.get('amount')
    category = data.get('category')
    subcategory = data.get('subcategory')
    description = data.get('description')
    date_val = data.get('date')
    time_val = data.get('time')
    payment_method = data.get('payment_method')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
    UPDATE transactions SET
        type = COALESCE(?, type),
        amount = COALESCE(?, amount),
        category = COALESCE(?, category),
        subcategory = COALESCE(?, subcategory),
        description = COALESCE(?, description),
        date = COALESCE(?, date),
        time = COALESCE(?, time),
        payment_method = COALESCE(?, payment_method)
    WHERE id = ?
    ''', (t_type, amount, category, subcategory, description, date_val, time_val, payment_method, t_id))
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({"error": "Transaction not found"}), 404

    conn.commit()
    conn.close()
    return jsonify({"status": "updated", "id": t_id})

@app.route('/api/transactions/<int:t_id>', methods=['DELETE', 'OPTIONS'])
def delete_transaction(t_id):
    if request.method == 'OPTIONS':
        return make_response(), 200

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM transactions WHERE id = ?", (t_id,))
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({"error": "Transaction not found"}), 404

    conn.commit()
    conn.close()
    return jsonify({"status": "deleted", "id": t_id})

# ----------------- DATA SEED & RESET ----------------- #

@app.route('/api/transactions/seed', methods=['POST', 'OPTIONS'])
def seed_data():
    if request.method == 'OPTIONS':
        return make_response(), 200

    seed_database(clear_first=True)
    return jsonify({"status": "seeded", "message": "6 months of realistic transaction data seeded successfully."})

@app.route('/api/transactions/reset', methods=['POST', 'OPTIONS'])
def reset_data():
    if request.method == 'OPTIONS':
        return make_response(), 200

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM transactions")
    conn.commit()
    conn.close()
    return jsonify({"status": "reset", "message": "All transaction data deleted."})

# ----------------- ANALYTICS ENDPOINTS ----------------- #

@app.route('/api/analytics/summary', methods=['GET', 'OPTIONS'])
def get_analytics_summary():
    if request.method == 'OPTIONS':
        return make_response(), 200

    df = get_filtered_df(request.args)
    summary = analytics.compute_kpi_summary(df)
    return jsonify(summary)

@app.route('/api/analytics/categories', methods=['GET', 'OPTIONS'])
def get_categories_breakdown():
    if request.method == 'OPTIONS':
        return make_response(), 200

    trans_type = request.args.get('type', 'Expense')
    df = get_filtered_df(request.args)
    breakdown = analytics.compute_category_breakdown(df, trans_type=trans_type)
    return jsonify(breakdown)

@app.route('/api/analytics/monthly-trends', methods=['GET', 'OPTIONS'])
def get_monthly_trends():
    if request.method == 'OPTIONS':
        return make_response(), 200

    time_filter = request.args.get('time_filter')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    df = get_filtered_df(request.args)
    trends = analytics.compute_monthly_trends(df, time_filter=time_filter, start_date=start_date, end_date=end_date)
    return jsonify(trends)

@app.route('/api/analytics/predictive-forecast', methods=['GET', 'OPTIONS'])
def get_predictive_forecast():
    if request.method == 'OPTIONS':
        return make_response(), 200

    days = int(request.args.get('days', 30))
    df = get_filtered_df(request.args)
    forecast = analytics.compute_predictive_forecast(df, days_ahead=days)
    return jsonify(forecast)

@app.route('/api/analytics/anomalies', methods=['GET', 'OPTIONS'])
def get_anomalies():
    if request.method == 'OPTIONS':
        return make_response(), 200

    df = get_filtered_df(request.args)
    anomalies = analytics.detect_anomalies(df)
    return jsonify(anomalies)

@app.route('/api/analytics/pareto', methods=['GET', 'OPTIONS'])
def get_pareto():
    if request.method == 'OPTIONS':
        return make_response(), 200

    df = get_filtered_df(request.args)
    pareto_data = analytics.compute_pareto_analysis(df)
    return jsonify(pareto_data)

@app.route('/api/analytics/behavioral', methods=['GET', 'OPTIONS'])
def get_behavioral():
    if request.method == 'OPTIONS':
        return make_response(), 200

    df = get_filtered_df(request.args)
    insights = analytics.compute_behavioral_insights(df)
    return jsonify(insights)

@app.route('/api/analytics/heatmap', methods=['GET', 'OPTIONS'])
def get_heatmap():
    if request.method == 'OPTIONS':
        return make_response(), 200

    df = get_filtered_df(request.args)
    heatmap = analytics.compute_calendar_heatmap(df)
    return jsonify(heatmap)

@app.route('/api/analytics/monte-carlo', methods=['GET', 'OPTIONS'])
def get_monte_carlo():
    if request.method == 'OPTIONS':
        return make_response(), 200

    df = get_filtered_df(request.args)
    sims = analytics.compute_monte_carlo_runway(df)
    return jsonify(sims)

# ----------------- CATEGORIES & BUDGETS ----------------- #

@app.route('/api/categories', methods=['GET', 'OPTIONS'])
def get_categories():
    if request.method == 'OPTIONS':
        return make_response(), 200

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM categories ORDER BY type, parent_name, name")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    # Group into hierarchy
    hierarchy = {"Expense": {}, "Income": {}}
    for r in rows:
        t = r['type']
        p = r['parent_name'] or r['name']
        if p not in hierarchy[t]:
            hierarchy[t][p] = {
                "parent": p,
                "color": r['color'],
                "icon": r['icon'],
                "items": []
            }
        hierarchy[t][p]['items'].append(r)

    return jsonify({
        "flat": rows,
        "hierarchy": hierarchy
    })

@app.route('/api/budgets', methods=['GET', 'POST', 'OPTIONS'])
def manage_budgets():
    if request.method == 'OPTIONS':
        return make_response(), 200

    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        data = request.get_json() or {}
        category = data.get('category')
        monthly_limit = float(data.get('monthly_limit', 0))

        cursor.execute('''
        INSERT INTO budgets (category, monthly_limit)
        VALUES (?, ?)
        ON CONFLICT(category) DO UPDATE SET monthly_limit = excluded.monthly_limit
        ''', (category, monthly_limit))
        conn.commit()

    # Join budgets with actual current month spending
    current_month = pd.Timestamp.now().strftime('%Y-%m')
    cursor.execute('''
    SELECT 
        b.id,
        b.category,
        b.monthly_limit,
        COALESCE(SUM(t.amount), 0) AS current_spent
    FROM budgets b
    LEFT JOIN transactions t 
        ON b.category = t.category 
        AND t.type = 'Expense' 
        AND strftime('%Y-%m', t.date) = ?
    GROUP BY b.id, b.category, b.monthly_limit
    ORDER BY b.monthly_limit DESC
    ''', (current_month,))

    rows = []
    for r in cursor.fetchall():
        spent = float(r['current_spent'])
        limit = float(r['monthly_limit'])
        pct = round((spent / limit * 100), 1) if limit > 0 else 0.0
        rows.append({
            "id": r['id'],
            "category": r['category'],
            "monthly_limit": limit,
            "current_spent": spent,
            "utilization_pct": pct,
            "status": "Exceeded" if spent > limit else ("Warning" if spent > 0.8 * limit else "Normal")
        })

    conn.close()
    return jsonify(rows)

@app.route('/api/export/csv', methods=['GET', 'OPTIONS'])
def export_csv():
    if request.method == 'OPTIONS':
        return make_response(), 200

    df = get_filtered_df(request.args)
    output = io.StringIO()
    df.to_csv(output, index=False)
    
    response = make_response(output.getvalue())
    response.headers["Content-Disposition"] = "attachment; filename=xpenzic_transactions_export.csv"
    response.headers["Content-type"] = "text/csv"
    return response

# Serve Frontend SPA from Flask if dist exists
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if os.path.exists(DIST_FOLDER):
        if path != "" and os.path.exists(os.path.join(DIST_FOLDER, path)):
            return send_from_directory(DIST_FOLDER, path)
        else:
            return send_from_directory(DIST_FOLDER, 'index.html')
    return jsonify({
        "message": "Xpenzic Analytics API running. Frontend dist not found. Run Vite frontend on port 3000."
    })

if __name__ == '__main__':
    # Initialize DB and seed if empty
    conn = get_db()
    count = conn.cursor().execute("SELECT count(*) FROM transactions").fetchone()[0]
    conn.close()
    if count == 0:
        seed_database()

    print("Starting Xpenzic Data Analytics Python Backend on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=False)
