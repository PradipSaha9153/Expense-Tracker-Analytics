import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F0F7F4] flex items-center justify-center p-6 font-poppins">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-extrabold text-slate-800">Something went wrong</h2>
            <p className="text-xs text-slate-500 mt-2 mb-6">
              {this.state.error?.message || 'An unexpected error occurred while rendering the dashboard.'}
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

