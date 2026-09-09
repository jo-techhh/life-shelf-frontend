import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  public handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center">
          <div className="w-16 h-16 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mb-4 ring-8 ring-destructive/5">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold font-display tracking-tight mb-1">
            Something went wrong
          </h1>
          <p className="text-xs text-muted-foreground max-w-md mb-6 leading-relaxed">
            LifeShelf couldn&apos;t display this section due to an unexpected error.
          </p>
          <Button onClick={this.handleReload} size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Reload Application
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
