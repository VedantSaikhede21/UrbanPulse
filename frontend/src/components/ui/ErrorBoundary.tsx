import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto"
        >
          <div className="w-14 h-14 rounded-full bg-status-escalated/10 border border-status-escalated/30 flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-status-escalated" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            An unexpected error occurred. Please try again or contact support if the issue persists.
          </p>
          {this.state.error && (
            <details className="w-full mb-6 text-left">
              <summary className="text-xs font-mono text-gray-500 cursor-pointer hover:text-foreground">
                Error details
              </summary>
              <pre className="mt-2 p-3 bg-panel-card border border-panel-border rounded text-[10px] text-status-escalated font-mono overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-lime text-background font-semibold text-xs rounded hover:bg-brand-dim transition-all duration-200 active:scale-[0.98]"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
