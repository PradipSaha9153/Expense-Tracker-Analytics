# Xpenzic • Financial Data Analytics & Intelligence Platform

> An advanced, full-stack Data Analysis & Financial Intelligence web application built with **Python (Flask, Pandas, NumPy, Scikit-Learn)**, **React 18**, **Tailwind CSS**, and **Chart.js**, inspired by and expanding upon the **Spendrym / MMAS Expense Tracker** Android architecture (`E:\AndroidDev\projects\Expense-Tracker-Application`).

> [!TIP]
> 📂 **Project Demo, Presentation & Resources**: Access the project demonstration videos, slide decks, and assets on [Google Drive](https://drive.google.com/drive/folders/15a6M1dQTpGw7sZgmjvNIATip7ZuugHgI).

---

## 📊 Project Overview & Core Data Analysis Pillars

This project converts the transactional and categorical foundation of the Spendrym mobile expense tracker into an enterprise-grade **Financial Data Science & Visualization Platform** designed for deep economic insights, pattern discovery, predictive forecasting, and conversational financial intelligence.

### 🔬 Implemented Data Science & Analytics Algorithms:
1. **Ordinary Least Squares (OLS) Time-Series Regression**:
   - Computes empirical daily spend trajectory ($y = mx + c$), slope velocity, standard error of estimate ($\sigma$), and coefficient of determination ($R^2$).
   - Generates a **30-Day Forward Predictive Spending Forecast** bounded by a **95% Confidence Interval ($t$-distribution)** band.
2. **Statistical Anomaly & Outlier Detection**:
   - Employs **Modified $Z$-Score** and **Interquartile Range (IQR)** criteria across individual category distributions.
   - Detects and flags anomalous spikes with calculated severity ratings (`Critical` vs `Moderate`), deviation multiplier ($N\times$ average), and expected category mean comparison.
3. **Pareto 80/20 Distribution Analysis**:
   - Calculates cumulative expenditure percentage across ranked spending areas.
   - Highlights the core 20% driver categories that consume ~80% of total outlay for targeted budget optimization.
4. **Behavioral Spending Habit Analysis**:
   - Analyzes **Weekday vs Weekend** elasticity, calculating discretionary spending multipliers and leisure category shifts.
   - Computes **Day-of-Week intensity distribution** (Monday through Sunday) and payment instrument preferences (UPI vs Card vs Cash vs Bank vs Wallet).
5. **Monte Carlo Stochastic Runway & Solvency Simulator**:
   - Runs **500 stochastic trials** sampling empirical daily cash flows over a 180-day future horizon.
   - Calculates 10th percentile (Conservative / Bear), 50th percentile (Expected Median), and 90th percentile (Optimistic / Bull) balance trajectories and an overall **Solvency Probability Score**.
6. **365-Day Daily Spending Density Heatmap Matrix**:
   - GitHub-style interactive density matrix mapping daily transaction frequency and cash outflow intensity.
7. **Conversational Financial Intelligence & Affordability Simulator**:
   - Heuristic NLP engine answering complex natural language queries about expenses, budgets, savings rates, and burn velocity.
   - **Interactive Affordability Engine**: Computes post-purchase net reserve impact and emergency runway compression (`Safe`, `Moderate`, or `Caution Advised`).
   - Automated spending sink diagnostics identifying primary cost drivers and projecting savings from 10% reductions.

---

## 🛠️ Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Backend & Analytics** | **Python 3.15**, **Flask**, **Pandas**, **NumPy**, **Scikit-Learn**, **SciPy** | REST API endpoints, statistical modeling, OLS regression, anomaly detection, Monte Carlo simulation engine |
| **Conversational Intelligence**| **Heuristic NLP Engine** (`backend/assistant.py`) | Natural language parsing, affordability simulation, contextual budget advice, runway impact analysis |
| **Database** | **SQLite 3** | ACID relational storage for transactions, category hierarchies, and monthly budgets |
| **Frontend Framework** | **React 18** (Vite 6 Bundler) | Single Page Application (SPA), responsive state management, modular component architecture |
| **Styling & Design System**| **Tailwind CSS 3.4** | Modern emerald/teal glassmorphism, responsive grid, liquid gradient animations |
| **Visualization Engine**| **Chart.js 4.4**, **React-Chartjs-2** | Spline area gradients, interactive donuts with center annotations, dual-axis Pareto charts, confidence bands |
| **Voice Synthesis (TTS)** | **Web Speech API** (`SpeechSynthesis`) | Natural male voice synthesis engine with calibrated pitch/rate and spoken currency pronunciation |
| **Icons & Typography** | **Lucide React**, **Google Poppins** | Consistent aesthetic mirroring the Spendrym mobile application |
| **Bespoke UI Assets** | **3D Green Swamp Fluids Cursor**, **3D Robot Mascot** | Custom-calibrated 24px cursor pack and reactive SVG OLED robot avatar |

---

## 📁 Repository Structure

```text
Expance-Tracker/
├── backend/
│   ├── app.py                  # Flask REST API server with CORS & SPA static hosting
│   ├── analytics.py            # Advanced statistical, regression, anomaly & Monte Carlo algorithms
│   ├── assistant.py            # Financial AI assistant engine (NLP, affordability, budget advice)
│   ├── database.py             # SQLite schema & category taxonomy initialization
│   ├── seed_data.py            # Realistic 6-month transaction generator with statistical outliers
│   ├── tracker.db              # SQLite relational database storage
│   └── requirements.txt        # Python library specifications
├── frontend/
│   ├── index.html              # HTML entry point with Google Poppins fonts
│   ├── vite.config.js          # Vite configuration with /api reverse proxy
│   ├── tailwind.config.js      # Tailwind custom color palette and typography
│   ├── package.json            # NPM scripts and dependencies
│   ├── public/                 # Static assets, icons, and custom cursors
│   │   ├── custom-cursor.png   # 3D Green Swamp fluid arrow cursor (24px)
│   │   ├── custom-cursor-pointer.png # 3D Green Swamp fluid pointer hand (24px)
│   │   ├── favicon.png         # Browser favicon
│   │   └── xpenzic-wordmark.png# Official brand logo
│   └── src/
│       ├── main.jsx            # React DOM root mounting
│       ├── App.jsx             # Top-level state, navigation tabs, and modal controls
│       ├── index.css           # Tailwind directives, custom scrollbars, and keyframe animations
│       ├── components/
│       │   ├── Sidebar.jsx             # Collapsible left navigation sidebar with active tab indicators
│       │   ├── TopHeader.jsx           # Header bar with period filters, currency switcher, and Ask AI trigger
│       │   ├── FinancialAssistant.jsx  # Liquid-glass AI drawer with male voice synthesis & circling laser border
│       │   ├── RobotAvatar.jsx         # 3D desktop robot avatar with animated OLED eyes (idle, think, speak, happy)
│       │   ├── KpiCard.jsx             # Metric cards with trends, icons, and status badges
│       │   ├── CategoryIcon.jsx        # Category taxonomy icon component matching Spendrym colors
│       │   ├── TransactionModal.jsx    # Add/Edit modal with quick increments and method selectors
│       │   └── ErrorBoundary.jsx       # React runtime error boundary
│       ├── views/
│       │   ├── DashboardView.jsx       # Executive summary, monthly cash flow spline, donut breakdown
│       │   ├── AnalyticsStudioView.jsx # OLS regression, Pareto 80/20, Anomaly detection, Monte Carlo
│       │   ├── VisualizationsView.jsx  # 365-day calendar heatmap matrix, Budget variance waterfall
│       │   ├── CalendarView.jsx        # Day-by-day calendar timeline matching Spendrym Android
│       │   ├── TransactionsView.jsx    # Filterable ledger with live search & CSV export
│       │   └── SettingsView.jsx        # Budget limits, dataset seed/reset, architecture specs
│       ├── services/
│       │   └── api.js                  # Frontend REST API client
│       └── utils/
│           └── formatters.js           # Multi-currency formatting, dates, category colors
├── run.py                      # 1-Click Python installer, dependency manager & app runner
├── start.bat                   # 1-Click launcher starting both Backend & Frontend (Dev mode)
├── run_backend.bat             # Standalone Python backend runner
├── run_frontend.bat            # Standalone Vite React frontend runner
└── README.md                   # Comprehensive documentation
```

---

## 🚀 How to Run the Application

### Option A: 1-Click Python Auto-Installer & Runner (Recommended)
Simply run:
```powershell
python run.py
```
*Or double-click **`run.py`** in Windows Explorer!*

**What `run.py` does automatically:**
1. 🔍 Checks your Python environment for all required data science libraries (`Flask`, `pandas`, `numpy`, `scikit-learn`, `scipy`, `python-dateutil`).
2. 📦 Automatically downloads and installs any missing packages via `pip`.
3. 🎨 Verifies that the production frontend build is ready.
4. 🚀 Launches the full-stack server at **`http://localhost:5000`**.
5. 🌐 Automatically opens your default web browser to the dashboard!

---

### Option B: 1-Click Batch Launcher (Windows Dev Mode)
Double-click:
```bat
start.bat
```
This starts:
- **Backend API**: `http://localhost:5000`
- **Frontend Vite Dev Server**: `http://localhost:3000`

---

### Option B: Manual Startup

#### 1. Start Python Backend
Open a terminal in the project directory:
```powershell
cd backend
python app.py
```
*The backend automatically initializes `tracker.db` and populates 500+ realistic transactions spanning 6 months if the database is fresh.*

> [!NOTE]
> Since the frontend is pre-built into `frontend/dist`, running `python app.py` alone also serves the complete, production-ready web application directly at **`http://localhost:5000`** with no Node.js runtime required!

#### 2. Start React Frontend (Development Mode)
In a separate terminal:
```powershell
cd frontend
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 💡 Key Views & Capabilities

1. **Executive Dashboard (`DashboardView`)**:
   - Top KPI cards: Total Income, Outflows, Net Balance, Savings Rate (%), 30-Day Burn Rate, Financial Runway (Months).
   - Monthly Cash Flow Spline Area Chart (Income vs Expense vs Net reserve).
   - Spendrym Donut Breakdown Chart with center annotation and Amount/Percentage toggle.
   - Ranked category-wise breakdown cards with progress bars and subcategory pills.

2. **Deep Analytics Studio (`AnalyticsStudioView`)**:
   - **Predictive 30-Day Spending Forecast**: Fitted OLS linear regression line with upper and lower 95% Confidence Interval error bounds.
   - **Pareto 80/20 Rule Analysis**: Cumulative curve pinpointing the critical 20% driver categories.
   - **Statistical Anomaly Detection**: Table of flagged outliers with Z-scores, category means, and severity tags.
   - **Behavioral Insights**: Weekend vs Weekday spending multiplier and day-of-week bar chart.
   - **Monte Carlo Runway Simulation**: 500 stochastic trials forecasting 6-month net reserve balance.

3. **Visualizations Hub (`VisualizationsView`)**:
   - **Calendar Spending Density Heatmap**: 20-week daily density grid colored by cash outflow intensity.
   - **Monthly Budget Limits vs Actual Consumption**: Visualizes compliance vs overruns per category.

4. **Calendar Timeline (`CalendarView`)**:
   - Complete day-by-day calendar matching the original Spendrym mobile application.
   - Color-coded dot markers on days with transactions (Income vs Expense).
   - Daily Summary card showing Income, Expense, and Net Balance for any selected day.
   - Category filtering dropdown and day transaction ledger.

5. **Transaction Ledger (`TransactionsView`)**:
   - Live search by note, memo, or category.
   - Filter by Type, Category, Payment Method, and Date.
   - Sortable columns (Date, Amount, Category).
   - Add, Edit, Delete transactions.
   - **Export to CSV** button for opening data in Excel or Jupyter Notebooks.

6. **Budget & Settings (`SettingsView`)**:
   - Real-time monthly budget limit editor per category.
   - Currency switcher (₹ INR, $ USD, € EUR, £ GBP, ¥ JPY, ₫ VND).
   - One-click **Seed Demo Data** (reloads 6 months of realistic transactions).
   - One-click **Purge Records** (clears database).

7. **Financial AI Intelligence & Voice Assistant (`FinancialAssistant` & `RobotAvatar`)**:
   - **Liquid Glass Floating Drawer**: Frosted backdrop blur (32px) with animated liquid gradient blobs and a continuous $360^\circ$ circulating green laser border beam.
   - **Interactive 3D Robot Avatar**: Scalable glossy desktop robot mascot with an obsidian OLED screen visor and expressive cyan LED eyes (`idle` blinks, `thinking`, `speaking`, `happy`, `love`, `money`).
   - **Natural Male Voice Synthesis**: Real-time Web Speech audio readout with calibrated pitch (`0.95`), rate (`1.0`), and spoken currency formatting.
   - **Intelligent Financial Queries**:
     - *Affordability Simulator*: Evaluates purchases (e.g. *"Can I afford ₹15,000?"*) and models runway reduction.
     - *Spending Diagnostics*: Analyzes top money sinks (e.g. *"Where is my money going mostly?"*).
     - *Category Deep Dives*: Answers specific queries for Food, Shopping, Transport, Utilities, etc.
     - *Budget Variance Alerts*: Warns of category overruns and recommends savings targets.

---

## 📡 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Service status, application version, and health check |
| `/api/transactions` | `GET`, `POST` | Retrieve filtered transaction ledger or record a new transaction |
| `/api/transactions/<id>` | `PUT`, `DELETE` | Update or remove an existing transaction record |
| `/api/transactions/seed` | `POST` | Populate database with 6 months of realistic demonstration data |
| `/api/transactions/reset` | `POST` | Clear all transaction records from the database |
| `/api/analytics/summary` | `GET` | Core KPIs: Income, Expense, Net, Savings Rate, Burn Rate, Runway |
| `/api/analytics/categories` | `GET` | Category-wise expense/income aggregation and percentage distributions |
| `/api/analytics/monthly-trends` | `GET` | Month-by-month cash flow and cumulative reserve trends |
| `/api/analytics/predictive-forecast` | `GET` | OLS regression forecast for 30 days with 95% Confidence Interval |
| `/api/analytics/anomalies` | `GET` | Statistical outlier detection (Modified Z-score & IQR criteria) |
| `/api/analytics/pareto` | `GET` | Pareto 80/20 cumulative distribution across spending categories |
| `/api/analytics/behavioral` | `GET` | Weekend vs weekday elasticity and day-of-week intensity metrics |
| `/api/analytics/heatmap` | `GET` | 365-day daily cash outflow density matrix |
| `/api/analytics/monte-carlo` | `GET` | 500-run stochastic runway simulation over 180-day horizon |
| `/api/assistant/chat` | `POST` | Financial AI Assistant query endpoint with natural language responses |
| `/api/categories` | `GET` | List all system categories and Spendrym taxonomy hierarchies |
| `/api/budgets` | `GET`, `POST` | Retrieve monthly budget limits or update category allocation |
| `/api/export/csv` | `GET` | Export current transaction ledger directly to downloadable CSV |

---

## 📂 Project Resources & Repository

- **GitHub Repository**: [PradipSaha9153/Xpenzic-Smart_Expense-Tracker-Analytics](https://github.com/PradipSaha9153/Xpenzic-Smart_Expense-Tracker-Analytics)
- **Google Drive (Demo & Slides)**: [Xpenzic Project Files & Resources](https://drive.google.com/drive/folders/15a6M1dQTpGw7sZgmjvNIATip7ZuugHgI)
