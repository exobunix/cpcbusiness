import React, { Component, ReactNode } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("CPCBusiness Error Boundary caught runtime error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-white flex items-center justify-center p-6 text-center">
          <div className="glass max-w-md p-8 rounded-2xl border border-white/10 space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto">
              <AlertCircle size={28} />
            </div>
            <h2 className="text-2xl font-black text-white">CPCBusiness Dashboard</h2>
            <p className="text-gray-400 text-sm">
              An unexpected render issue occurred. Click reload to refresh application state.
            </p>
            {this.state.error?.message && (
              <p className="text-xs font-mono text-red-400 bg-red-950/40 p-3 rounded-lg border border-red-500/20 text-left overflow-x-auto">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all text-sm"
            >
              <RefreshCw size={15} /> Refresh Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
