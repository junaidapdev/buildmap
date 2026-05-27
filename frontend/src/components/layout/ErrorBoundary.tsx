import { Component, type ErrorInfo, type PropsWithChildren } from 'react';

import { ErrorFallback } from '@/components/layout/ErrorFallback';
import { logger } from '@/lib/logger';

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(_error: unknown): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, _info: ErrorInfo): void {
    logger.error('react_error_boundary', {
      message: error.message,
      stack: error.stack,
    });
  }

  override render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}
