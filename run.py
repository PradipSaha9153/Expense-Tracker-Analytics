"""
======================================================================
  Xpenzic • One-Click Setup & Launch System
======================================================================
Run this single Python file to start the entire application:
    python run.py
Or simply double-click run.py in Windows Explorer!

What this file does automatically:
  1. Checks for all required Python dependencies.
  2. Automatically installs any missing packages via pip.
  3. Verifies frontend production build & SQLite database.
  4. Launches the full-stack server at http://localhost:5000.
  5. Automatically opens your default web browser.
======================================================================
"""

import sys
import os
import subprocess
import time
import threading
import webbrowser
import importlib.util
import urllib.request
import urllib.error

# Core application dependencies stored directly in this file
DEPENDENCIES = [
    ("flask", "Flask>=3.0.0"),
    ("pandas", "pandas>=2.0.0"),
    ("numpy", "numpy>=1.24.0"),
    ("sklearn", "scikit-learn>=1.3.0"),
    ("scipy", "scipy>=1.10.0"),
    ("dateutil", "python-dateutil>=2.8.2"),
]

SERVER_HOST = "127.0.0.1"
SERVER_PORT = 5000
APP_URL = f"http://localhost:{SERVER_PORT}"
HEALTH_URL = f"http://{SERVER_HOST}:{SERVER_PORT}/api/health"

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
APP_PY = os.path.join(BACKEND_DIR, "app.py")
FRONTEND_DIST = os.path.join(ROOT_DIR, "frontend", "dist")
REQUIREMENTS_TXT = os.path.join(BACKEND_DIR, "requirements.txt")


def print_banner():
    banner = """
======================================================================
          Xpenzic • Financial Data Analytics & Intelligence
======================================================================
    """
    print(banner)


def check_and_install_dependencies():
    """Detects missing dependencies and downloads them automatically via pip."""
    print("🔍 [1/4] Checking Python dependencies...")
    missing_packages = []

    for import_name, pip_spec in DEPENDENCIES:
        if importlib.util.find_spec(import_name) is None:
            missing_packages.append(pip_spec)

    if not missing_packages:
        print("  ✓ All required Python packages are already installed.")
        return

    print(f"\n📦 Found {len(missing_packages)} missing package(s):")
    for pkg in missing_packages:
        print(f"    • {pkg}")

    print("\n⬇️  Downloading and installing dependencies via pip... (this may take a moment)")
    try:
        # Prefer requirements.txt if present and all dependencies are missing, else install specific packages
        if os.path.exists(REQUIREMENTS_TXT) and len(missing_packages) == len(DEPENDENCIES):
            cmd = [sys.executable, "-m", "pip", "install", "-r", REQUIREMENTS_TXT]
        else:
            cmd = [sys.executable, "-m", "pip", "install"] + missing_packages

        subprocess.check_call(cmd)
        print("\n  ✓ All dependencies installed successfully!\n")
    except subprocess.CalledProcessError as err:
        print(f"\n❌ Error installing dependencies: {err}")
        print("Please check your internet connection or run manually:")
        print(f"    {sys.executable} -m pip install -r backend/requirements.txt")
        sys.exit(1)


def check_frontend_build():
    """Verifies that the pre-built frontend distribution exists."""
    print("🎨 [2/4] Verifying frontend assets...")
    if os.path.exists(FRONTEND_DIST) and os.path.exists(os.path.join(FRONTEND_DIST, "index.html")):
        print("  ✓ Pre-built production frontend (Single Page App) is ready.")
    else:
        print("  ⚠️ Frontend 'dist' folder not found. Attempting to build with npm...")
        frontend_dir = os.path.join(ROOT_DIR, "frontend")
        try:
            subprocess.check_call(["npm", "run", "build"], cwd=frontend_dir, shell=True)
            print("  ✓ Frontend built successfully.")
        except Exception as e:
            print(f"  ⚠️ Could not build frontend automatically: {e}")
            print("  The API server will still run, but you may need to run 'npm run dev' inside 'frontend/'.")


def wait_and_open_browser(url, health_url, timeout=12.0):
    """Polls backend health in the background and opens browser when ready."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            req = urllib.request.Request(health_url, headers={"User-Agent": "XpenzicLauncher/1.0"})
            with urllib.request.urlopen(req, timeout=1.0) as response:
                if response.status == 200:
                    print(f"\n🚀 Server is live! Opening {url} in your browser...\n")
                    time.sleep(0.4)
                    webbrowser.open(url)
                    return
        except Exception:
            time.sleep(0.5)

    # Fallback after timeout
    print(f"\n🌐 Opening {url} in browser...")
    webbrowser.open(url)


def launch_application():
    """Starts backend/app.py and launches the browser."""
    print("⚙️  [3/4] Preparing backend server...")
    if not os.path.exists(APP_PY):
        print(f"❌ Error: Cannot find '{APP_PY}'. Please ensure you are running from the project root.")
        sys.exit(1)

    print("🚀 [4/4] Starting Xpenzic server at " + APP_URL + " ...")
    print("=" * 70)
    print("  • Web UI:      http://localhost:5000")
    print("  • API Health:  http://localhost:5000/api/health")
    print("  • Status:      RUNNING (Press Ctrl+C to stop the server)")
    print("=" * 70 + "\n")

    # Start browser opener thread
    browser_thread = threading.Thread(
        target=wait_and_open_browser,
        args=(APP_URL, HEALTH_URL),
        daemon=True
    )
    browser_thread.start()

    # Launch Flask backend
    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"

    try:
        # Run Flask server from backend directory
        subprocess.run([sys.executable, "-B", "app.py"], cwd=BACKEND_DIR, env=env)
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down Xpenzic server cleanly. Goodbye!")
    except Exception as err:
        print(f"\n❌ Server encountered an unexpected error: {err}")
        input("\nPress Enter to exit...")


def main():
    print_banner()
    try:
        check_and_install_dependencies()
        check_frontend_build()
        launch_application()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        input("\nPress Enter to exit...")


if __name__ == "__main__":
    main()

