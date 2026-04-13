import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Something went wrong.';
      try {
        // Check if it's a Firestore JSON error
        const parsed = JSON.parse(this.state.error?.message || '');
        if (parsed.error) {
          errorMessage = `Database Error: ${parsed.error}`;
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-6">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold">System Alert</h2>
            <p className="text-on-surface-variant text-sm">
              {errorMessage}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              Restart Terminal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
