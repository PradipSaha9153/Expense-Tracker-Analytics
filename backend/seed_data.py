import sqlite3
import random
from datetime import datetime, timedelta
from database import get_db, init_db

def seed_database(clear_first=True):
    init_db()
    conn = get_db()
    cursor = conn.cursor()

    if clear_first:
        cursor.execute("DELETE FROM transactions")
        conn.commit()

    # Determine reference date: Current real date
    end_date = datetime.now()
    start_date = end_date - timedelta(days=180) # 6 months of data

    transactions = []

    # Monthly fixed events (1st to 28th of each month)
    curr_month_start = datetime(start_date.year, start_date.month, 1)
    
    while curr_month_start <= end_date:
        y, m = curr_month_start.year, curr_month_start.month
        
        # 1. Salary on the 1st
        salary_dt = datetime(y, m, 1)
        if salary_dt <= end_date:
            transactions.append((
                'Income', 
                95000.0 + random.choice([0, 5000, 8000]), 
                'Salary', 
                'Salary', 
                'Monthly Professional Salary (Senior Engineer)', 
                salary_dt.strftime('%Y-%m-%d'), 
                '09:30', 
                'Bank'
            ))

        # 2. Quarterly / Bi-monthly bonus or freelance
        if m in [2, 5, 8, 11]:
            side_day = min(random.randint(12, 22), 28)
            side_dt = datetime(y, m, side_day)
            if side_dt <= end_date:
                transactions.append((
                    'Income',
                    random.randint(18000, 35000),
                    'Side job',
                    'Freelance',
                    'UI/UX Consulting & Data Pipeline Contract',
                    side_dt.strftime('%Y-%m-%d'),
                    '18:45',
                    'Bank'
                ))

        # 3. Monthly Investment dividend / return
        if random.random() > 0.2:
            inv_day = min(random.randint(5, 18), 28)
            inv_dt = datetime(y, m, inv_day)
            if inv_dt <= end_date:
                transactions.append((
                    'Income',
                    random.randint(5500, 14000),
                    'InvestmentIncome',
                    'Investment',
                    'Mutual Fund SIP Dividend & Stock Payout',
                    inv_dt.strftime('%Y-%m-%d'),
                    '11:15',
                    'Bank'
                ))

        # 4. Rent on the 3rd
        rent_dt = datetime(y, m, 3)
        if rent_dt <= end_date:
            transactions.append((
                'Expense',
                22000.0,
                'Home',
                'Mortgage & Rent',
                'Apartment Rent Payment',
                rent_dt.strftime('%Y-%m-%d'),
                '10:00',
                'Bank'
            ))

        # 5. Utilities around the 10th-16th
        if datetime(y, m, 11) <= end_date:
            transactions.append((
                'Expense',
                random.randint(2200, 3600),
                'Utility Bills',
                'Electricity',
                'State Electricity Board Bill',
                datetime(y, m, 11).strftime('%Y-%m-%d'),
                '14:20',
                'UPI'
            ))
        if datetime(y, m, 14) <= end_date:
            transactions.append((
                'Expense',
                random.randint(999, 1499),
                'Utility Bills',
                'Internet',
                'Fiber High-Speed Broadband (Airtel/Jio)',
                datetime(y, m, 14).strftime('%Y-%m-%d'),
                '16:05',
                'UPI'
            ))
        if datetime(y, m, 16) <= end_date:
            transactions.append((
                'Expense',
                random.randint(499, 899),
                'Utility Bills',
                'Mobile Phone',
                'Postpaid Mobile Recharge',
                datetime(y, m, 16).strftime('%Y-%m-%d'),
                '12:30',
                'UPI'
            ))

        # Next month calculation
        if m == 12:
            curr_month_start = datetime(y + 1, 1, 1)
        else:
            curr_month_start = datetime(y, m + 1, 1)

    # Daily variable transactions
    curr_day = start_date
    daily_food_options = [
        ('Food & Beverages', 'Food', 'Office Lunch & Thali', (180, 420), 'UPI'),
        ('Food & Beverages', 'Beverages', 'Artisan Coffee & Chai break', (80, 250), 'UPI'),
        ('Food & Beverages', 'Restaurant', 'Dinner with Colleagues', (650, 1850), 'Card'),
        ('Food & Beverages', 'Daily Necessities', 'Supermarket Dairy, Fruits & Essentials', (450, 1600), 'UPI'),
        ('Transport', 'Fuel', 'Petrol station refill', (500, 1500), 'UPI'),
        ('Transport', 'Taxi', 'Uber / Ola Cab Ride', (180, 550), 'UPI'),
        ('Transport', 'Parking', 'Metro & Mall Parking Fee', (40, 120), 'UPI'),
    ]

    weekend_options = [
        ('Entertainment', 'Movies', 'IMAX Cinema Tickets & Popcorn', (500, 1200), 'Card'),
        ('Entertainment', 'Games', 'Steam Game & Arcade Passes', (499, 1499), 'Card'),
        ('Shopping', 'Clothes', 'Casual Wear & Footwear', (1200, 3800), 'Card'),
        ('Food & Beverages', 'Restaurant', 'Weekend Fine Dining & Lounge', (1100, 2600), 'Card'),
        ('Shopping', 'Accessories', 'Smartwatch band & sunglasses', (600, 1800), 'UPI'),
        ('Home', 'Furnishings', 'Home Decor & Plants', (800, 2200), 'Card'),
    ]

    occasional_health_personal = [
        ('Health', 'Doctor', 'Annual Health Physician Consultation', (800, 2000), 'UPI'),
        ('Health', 'Medicine', 'Prescription Pharmacy Meds', (350, 1400), 'UPI'),
        ('Personal Development', 'Education', 'Coursera / Udemy Specialization Course', (1299, 3999), 'Card'),
        ('Personal Development', 'Business', 'Cloud Hosting & Domain Renewals', (1500, 4500), 'Card'),
        ('Gifts & Donations', 'GiftsExpense', 'Birthday Gift for Friend', (1000, 3500), 'UPI'),
        ('Gifts & Donations', 'Charity', 'Monthly NGO & Animal Shelter Donation', (500, 2000), 'UPI'),
    ]

    while curr_day <= end_date:
        day_str = curr_day.strftime('%Y-%m-%d')
        is_weekend = curr_day.weekday() >= 5 # 5=Sat, 6=Sun

        # 1-3 daily expenses on weekdays, 2-5 on weekends
        num_items = random.randint(2, 5) if is_weekend else random.randint(1, 3)

        for _ in range(num_items):
            pool = weekend_options if is_weekend and random.random() > 0.4 else daily_food_options
            cat, subcat, desc, (min_amt, max_amt), def_method = random.choice(pool)
            
            amt = round(random.uniform(min_amt, max_amt), 2)
            
            # Weighted payment method
            r = random.random()
            if r < 0.60:
                method = 'UPI'
            elif r < 0.85:
                method = 'Card'
            elif r < 0.95:
                method = 'Cash'
            else:
                method = 'Wallet'

            hour = random.randint(8, 22)
            minute = random.choice([0, 15, 30, 45, random.randint(10, 59)])
            time_str = f"{hour:02d}:{minute:02d}"

            transactions.append((
                'Expense',
                amt,
                cat,
                subcat,
                desc,
                day_str,
                time_str,
                method
            ))

        # Occasional health/personal events
        if random.random() < 0.08:
            cat, subcat, desc, (min_amt, max_amt), def_method = random.choice(occasional_health_personal)
            amt = round(random.uniform(min_amt, max_amt), 2)
            transactions.append((
                'Expense',
                amt,
                cat,
                subcat,
                desc,
                day_str,
                '15:30',
                def_method
            ))

        curr_day += timedelta(days=1)

    # Add deliberate statistical ANOMALIES to showcase Anomaly Detection algorithms!
    anomalies = [
        ('Expense', 58999.0, 'Shopping', 'Electronic Devices', 'MacBook Air M2 Purchase (Major Outlier)', (end_date - timedelta(days=120)).strftime('%Y-%m-%d'), '19:40', 'Card'),
        ('Expense', 28500.0, 'Entertainment', 'Travel', 'Flight Bookings to Goa & Resort Stay', (end_date - timedelta(days=75)).strftime('%Y-%m-%d'), '11:20', 'Card'),
        ('Expense', 19800.0, 'Health', 'Doctor', 'Comprehensive Dental Surgery & Diagnostics', (end_date - timedelta(days=35)).strftime('%Y-%m-%d'), '15:10', 'Card'),
        ('Income', 45000.0, 'Bonus', 'Bonus', 'Annual Performance Incentive Bonus Payout', (end_date - timedelta(days=60)).strftime('%Y-%m-%d'), '16:00', 'Bank')
    ]
    transactions.extend(anomalies)

    # Insert all transactions in bulk
    cursor.executemany('''
    INSERT INTO transactions (type, amount, category, subcategory, description, date, time, payment_method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', transactions)

    conn.commit()
    conn.close()
    print(f"Seeded {len(transactions)} realistic transactions spanning 6 months.")

if __name__ == '__main__':
    seed_database()
