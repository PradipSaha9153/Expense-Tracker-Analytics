import sqlite3
from datetime import datetime, timedelta
from database import get_db, init_db

def seed_database(clear_first=True):
    init_db()
    conn = get_db()
    cursor = conn.cursor()

    if clear_first:
        cursor.execute("DELETE FROM transactions")
        conn.commit()

    now = datetime.now()
    y = now.year
    m = now.month
    
    curr_m_str = f"{y:04d}-{m:02d}"
    last_m_year = y if m > 1 else y - 1
    last_m_month = m - 1 if m > 1 else 12
    last_m_str = f"{last_m_year:04d}-{last_m_month:02d}"

    today_str = now.strftime('%Y-%m-%d')
    yesterday_str = (now - timedelta(days=1)).strftime('%Y-%m-%d')
    days_ago_2 = (now - timedelta(days=2)).strftime('%Y-%m-%d')
    days_ago_3 = (now - timedelta(days=3)).strftime('%Y-%m-%d')
    days_ago_4 = (now - timedelta(days=4)).strftime('%Y-%m-%d')
    days_ago_6 = (now - timedelta(days=6)).strftime('%Y-%m-%d')

    test_transactions = [
        # ==========================================
        # 2025 TRANSACTIONS (Visible only in "All Time")
        # ==========================================
        ('Income', 75000.0, 'Salary', 'Salary', 'Monthly Professional Salary (2025)', '2025-03-01', '09:30', 'Bank'),
        ('Expense', 20000.0, 'Home', 'Mortgage & Rent', 'Apartment Rent (2025)', '2025-03-03', '10:00', 'Bank'),
        ('Expense', 4200.0, 'Food & Beverages', 'Food', 'Monthly Grocery Provisions', '2025-03-15', '18:30', 'UPI'),
        
        ('Income', 75000.0, 'Salary', 'Salary', 'Monthly Professional Salary (2025)', '2025-06-01', '09:30', 'Bank'),
        ('Expense', 32000.0, 'Shopping', 'Electronic Devices', 'Ergonomic Desk & Monitor Setup', '2025-06-18', '16:00', 'Card'),
        
        ('Income', 75000.0, 'Salary', 'Salary', 'Monthly Professional Salary (2025)', '2025-08-01', '09:30', 'Bank'),
        ('Income', 30000.0, 'Bonus', 'Bonus', 'Mid-Year Performance Incentive', '2025-08-15', '11:00', 'Bank'),
        ('Expense', 18500.0, 'Entertainment', 'Travel', 'Summer Vacation Flights & Hotel', '2025-08-20', '14:20', 'Card'),

        ('Income', 75000.0, 'Salary', 'Salary', 'Monthly Professional Salary (2025)', '2025-11-01', '09:30', 'Bank'),
        ('Expense', 20000.0, 'Home', 'Mortgage & Rent', 'Apartment Rent (2025)', '2025-11-03', '10:00', 'Bank'),
        ('Expense', 2800.0, 'Food & Beverages', 'Restaurant', 'Team Dinner & Celebration', '2025-11-20', '20:15', 'Card'),
        ('Expense', 5600.0, 'Gifts & Donations', 'GiftsExpense', 'Holiday Festival Gifts & Family Shopping', '2025-12-24', '15:45', 'UPI'),

        # ==========================================
        # 2026 - Q1 (January - March) (Visible in "This Year" and "All Time")
        # ==========================================
        ('Income', 85000.0, 'Salary', 'Salary', 'Monthly Professional Salary', f"{y}-01-01", '09:30', 'Bank'),
        ('Expense', 22000.0, 'Home', 'Mortgage & Rent', 'Apartment Monthly Rent', f"{y}-01-03", '10:00', 'Bank'),
        ('Expense', 12000.0, 'Health', 'Sports', 'Annual Fitness Club Membership', f"{y}-01-18", '11:00', 'Card'),
        ('Expense', 4500.0, 'Shopping', 'Accessories', 'Wristwatch & Accessories', f"{y}-02-14", '19:30', 'Card'),

        # ==========================================
        # 2026 - Q2 (April - June) (Visible in "This Year" and "All Time")
        # ==========================================
        ('Income', 85000.0, 'Salary', 'Salary', 'Monthly Professional Salary', f"{y}-04-01", '09:30', 'Bank'),
        ('Expense', 22000.0, 'Home', 'Mortgage & Rent', 'Apartment Monthly Rent', f"{y}-04-03", '10:00', 'Bank'),
        ('Expense', 3500.0, 'Home', 'Home Services', 'Air Conditioning Service & Maintenance', f"{y}-04-20", '14:00', 'UPI'),
        ('Income', 18000.0, 'Side job', 'Freelance', 'Design & Frontend Consulting Contract', f"{y}-05-15", '17:30', 'Bank'),
        ('Expense', 6800.0, 'Shopping', 'Clothes', 'Summer Apparel & Footwear', f"{y}-05-25", '18:15', 'Card'),

        # ==========================================
        # 2026 - Q3 (July - September) (Visible in "This Year" and "All Time")
        # ==========================================
        ('Income', 85000.0, 'Salary', 'Salary', 'Monthly Professional Salary', f"{y}-07-01", '09:30', 'Bank'),
        ('Expense', 22000.0, 'Home', 'Mortgage & Rent', 'Apartment Monthly Rent', f"{y}-07-03", '10:00', 'Bank'),
        ('Income', 25000.0, 'Bonus', 'Bonus', 'Q3 Performance Incentive Bonus', f"{y}-08-15", '11:00', 'Bank'),
        ('Expense', 14200.0, 'Entertainment', 'Travel', 'Monsoon Hill Station Retreat', f"{y}-08-22", '12:00', 'Card'),
        ('Expense', 8900.0, 'Transport', 'Services & Maintenance', 'Comprehensive Vehicle Insurance', f"{y}-09-10", '16:00', 'Bank'),

        # ==========================================
        # 2026 - Q4 (October - November) (Visible in "This Quarter", "This Year", and "All Time")
        # ==========================================
        # October 2026
        ('Income', 85000.0, 'Salary', 'Salary', 'Monthly Professional Salary', f"{last_m_str}-01", '09:30', 'Bank'),
        ('Income', 12000.0, 'InvestmentIncome', 'Investment', 'Mutual Fund Dividends', f"{last_m_str}-15", '11:00', 'Bank'),
        ('Expense', 22000.0, 'Home', 'Mortgage & Rent', 'Apartment Monthly Rent', f"{last_m_str}-02", '10:00', 'Bank'),
        ('Expense', 8500.0, 'Shopping', 'Electronic Devices', 'Wireless ANC Headphones', f"{last_m_str}-10", '15:00', 'Card'),
        ('Expense', 5400.0, 'Food & Beverages', 'Food', 'Monthly Grocery Provisions', f"{last_m_str}-15", '19:00', 'UPI'),
        ('Expense', 3200.0, 'Transport', 'Fuel', 'Petrol Refill & Highway Tolls', f"{last_m_str}-22", '09:00', 'Card'),
        ('Expense', 2100.0, 'Food & Beverages', 'Restaurant', 'Weekend Family Dinner', f"{last_m_str}-28", '20:30', 'Card'),

        # November 2026 (Current Month, Days 01-08)
        ('Income', 85000.0, 'Salary', 'Salary', 'Monthly Professional Salary', f"{curr_m_str}-01", '09:30', 'Bank'),
        ('Income', 22000.0, 'Side job', 'Freelance', 'Consulting & Freelance Project', f"{curr_m_str}-05", '17:00', 'Bank'),
        ('Expense', 22000.0, 'Home', 'Mortgage & Rent', 'Apartment Monthly Rent', f"{curr_m_str}-01", '10:00', 'Bank'),
        ('Expense', 3450.0, 'Food & Beverages', 'Daily Necessities', 'Supermarket Grocery & Dairy', days_ago_6, '18:30', 'UPI'),
        ('Expense', 2180.0, 'Utility Bills', 'Electricity', 'Monthly Electricity Bill', days_ago_4, '11:15', 'UPI'),
        ('Expense', 1800.0, 'Transport', 'Fuel', 'Vehicle Petrol Refill', days_ago_3, '08:45', 'UPI'),
        ('Expense', 1250.0, 'Food & Beverages', 'Restaurant', 'Team Lunch with Colleagues', days_ago_3, '13:30', 'Card'),
        ('Expense', 1199.0, 'Utility Bills', 'Internet', 'High-Speed Fiber Broadband', days_ago_2, '16:20', 'UPI'),
        ('Expense', 4200.0, 'Shopping', 'Clothes', 'Winter Jacket & Apparel', yesterday_str, '17:40', 'Card'),
        ('Expense', 950.0, 'Entertainment', 'Movies', 'Cinema Tickets & Popcorn', yesterday_str, '20:15', 'Card'),
        ('Expense', 620.0, 'Health', 'Medicine', 'Prescription Pharmacy Meds', today_str, '10:15', 'UPI'),
        ('Expense', 340.0, 'Food & Beverages', 'Beverages', 'Artisan Coffee & Pastry', today_str, '12:30', 'UPI')
    ]

    cursor.executemany('''
    INSERT INTO transactions (type, amount, category, subcategory, description, date, time, payment_method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', test_transactions)

    conn.commit()
    conn.close()
    print(f"Successfully seeded database with {len(test_transactions)} transactions spanning 2025 and all 4 quarters of 2026.")

if __name__ == '__main__':
    seed_database()
