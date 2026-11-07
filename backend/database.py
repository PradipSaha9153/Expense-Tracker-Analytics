import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tracker.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Transactions table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('Expense', 'Income')),
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        description TEXT,
        date TEXT NOT NULL, -- Format: YYYY-MM-DD
        time TEXT DEFAULT '12:00',
        payment_method TEXT DEFAULT 'UPI' CHECK(payment_method IN ('UPI', 'Cash', 'Card', 'Bank', 'Wallet')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Categories table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('Expense', 'Income')),
        parent_name TEXT,
        icon TEXT,
        color TEXT
    )
    ''')

    # Budgets table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT UNIQUE NOT NULL,
        monthly_limit REAL NOT NULL,
        currency TEXT DEFAULT '₹'
    )
    ''')

    # Default categories inspired by Spendrym Android App
    default_categories = [
        # Incomes
        ('Salary', 'Income', 'Salary', 'account_balance_wallet', '#4CAF50'),
        ('InvestmentIncome', 'Income', 'Investment', 'trending_up', '#2E7D32'),
        ('Bonus', 'Income', 'Bonus', 'stars', '#81C784'),
        ('Side job', 'Income', 'Freelance', 'work', '#66BB6A'),
        ('GiftsIncome', 'Income', 'Gifts', 'card_giftcard', '#A5D6A7'),
        ('OtherIncome', 'Income', 'Other', 'attach_money', '#388E3C'),

        # Expense Parent Groups & Categories
        ('Food & Beverages', 'Expense', 'Food & Beverages', 'fastfood', '#FF5252'),
        ('Food', 'Expense', 'Food & Beverages', 'restaurant', '#FF7043'),
        ('Beverages', 'Expense', 'Food & Beverages', 'local_bar', '#FF8A65'),
        ('Daily Necessities', 'Expense', 'Food & Beverages', 'shopping_basket', '#FFA726'),
        ('Restaurant', 'Expense', 'Food & Beverages', 'dining', '#E64A19'),

        ('Transport', 'Expense', 'Transport', 'commute', '#29B6F6'),
        ('Fuel', 'Expense', 'Transport', 'local_gas_station', '#0288D1'),
        ('Parking', 'Expense', 'Transport', 'local_parking', '#039BE5'),
        ('Services & Maintenance', 'Expense', 'Transport', 'build', '#0277BD'),
        ('Taxi', 'Expense', 'Transport', 'local_taxi', '#01579B'),

        ('Personal Development', 'Expense', 'Personal Development', 'school', '#AB47BC'),
        ('Education', 'Expense', 'Personal Development', 'menu_book', '#8E24AA'),
        ('Business', 'Expense', 'Personal Development', 'business_center', '#7B1FA2'),
        ('InvestmentExpense', 'Expense', 'Personal Development', 'savings', '#6A1B9A'),

        ('Shopping', 'Expense', 'Shopping', 'shopping_cart', '#EC407A'),
        ('Clothes', 'Expense', 'Shopping', 'checkroom', '#D81B60'),
        ('Accessories', 'Expense', 'Shopping', 'watch', '#C2185B'),
        ('Electronic Devices', 'Expense', 'Shopping', 'devices', '#AD1457'),

        ('Entertainment', 'Expense', 'Entertainment', 'sports_esports', '#7E57C2'),
        ('Movies', 'Expense', 'Entertainment', 'movie', '#5E35B1'),
        ('Games', 'Expense', 'Entertainment', 'gamepad', '#512DA8'),
        ('Music', 'Expense', 'Entertainment', 'music_note', '#4527A0'),
        ('Travel', 'Expense', 'Entertainment', 'flight', '#311B92'),

        ('Home', 'Expense', 'Home', 'home', '#26A69A'),
        ('Furnishings', 'Expense', 'Home', 'chair', '#00897B'),
        ('Home Services', 'Expense', 'Home', 'home_repair_service', '#00796B'),
        ('Pets', 'Expense', 'Home', 'pets', '#00695C'),
        ('Mortgage & Rent', 'Expense', 'Home', 'apartment', '#004D40'),

        ('Utility Bills', 'Expense', 'Utility Bills', 'receipt_long', '#FFA726'),
        ('Electricity', 'Expense', 'Utility Bills', 'electric_bolt', '#FB8C00'),
        ('Internet', 'Expense', 'Utility Bills', 'wifi', '#F57C00'),
        ('Mobile Phone', 'Expense', 'Utility Bills', 'phone_android', '#EF6C00'),
        ('Water', 'Expense', 'Utility Bills', 'water_drop', '#E65100'),

        ('Health', 'Expense', 'Health', 'health_and_safety', '#EF5350'),
        ('Doctor', 'Expense', 'Health', 'medical_services', '#E53935'),
        ('Medicine', 'Expense', 'Health', 'medication', '#D32F2F'),
        ('Health Insurance', 'Expense', 'Health', 'verified_user', '#C62828'),
        ('Sports', 'Expense', 'Health', 'fitness_center', '#B71C1C'),

        ('Gifts & Donations', 'Expense', 'Gifts & Donations', 'volunteer_activism', '#8D6E63'),
        ('GiftsExpense', 'Expense', 'Gifts & Donations', 'card_giftcard', '#795548'),
        ('Wedding', 'Expense', 'Gifts & Donations', 'favorite', '#6D4C41'),
        ('Charity', 'Expense', 'Gifts & Donations', 'group', '#5D4037'),

        ('Kids', 'Expense', 'Kids', 'child_care', '#26C6DA'),
        ('Tuition', 'Expense', 'Kids', 'school', '#00ACC1'),
        ('Pocket Money', 'Expense', 'Kids', 'monetization_on', '#0097A7'),
        ('Baby Products', 'Expense', 'Kids', 'child_friendly', '#00838F'),

        ('OtherExpense', 'Expense', 'OtherExpense', 'more_horiz', '#78909C')
    ]

    for cat in default_categories:
        cursor.execute('''
        INSERT OR IGNORE INTO categories (name, type, parent_name, icon, color)
        VALUES (?, ?, ?, ?, ?)
        ''', cat)

    # Default category monthly budgets
    default_budgets = [
        ('Food & Beverages', 15000.0),
        ('Transport', 6000.0),
        ('Shopping', 10000.0),
        ('Entertainment', 5000.0),
        ('Home', 25000.0),
        ('Utility Bills', 4500.0),
        ('Health', 4000.0),
        ('Personal Development', 5000.0),
        ('Gifts & Donations', 3000.0),
        ('Kids', 6000.0),
        ('OtherExpense', 2000.0)
    ]
    for b in default_budgets:
        cursor.execute('''
        INSERT OR IGNORE INTO budgets (category, monthly_limit)
        VALUES (?, ?)
        ''', b)

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully.")

