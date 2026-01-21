/**
 * Global error handling utilities
 */

export interface ErrorReport {
  error: Error;
  context?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
  userId?: string;
}

class ErrorHandler {
  private errorReports: ErrorReport[] = [];
  private maxReports = 50; // Keep only last 50 errors

  constructor() {
    this.setupGlobalHandlers();
  }

  private setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        new Error(event.reason?.message || 'Unhandled Promise Rejection'),
        'Unhandled Promise Rejection'
      );
      // Prevent the default browser behavior
      event.preventDefault();
    });

    // Handle uncaught runtime errors
    window.addEventListener('error', (event) => {
      this.handleError(
        event.error || new Error(event.message),
        'Runtime Error'
      );
    });
  }

  public handleError(error: Error, context?: string, userId?: string): void {
    const errorReport: ErrorReport = {
      error,
      context,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId
    };

    this.addReport(errorReport);
    this.logError(errorReport);
    this.sendToErrorReporting(errorReport);
    
  }

  private addReport(report: ErrorReport): void {
    this.errorReports.push(report);
    
    // Keep only the most recent reports
    if (this.errorReports.length > this.maxReports) {
      this.errorReports = this.errorReports.slice(-this.maxReports);
    }
  }

  private logError(_report: ErrorReport): void {
    console.log('Error logged:', _report);
  }

  private sendToErrorReporting(_report: ErrorReport): void {
    // Placeholder for error reporting service integration
    // Examples: Sentry, LogRocket, Bugsnag, etc.
    try {
      // Example for Sentry:
      // Sentry.captureException(report.error, {
      //   tags: { context: report.context },
      //   extra: { 
      //     timestamp: report.timestamp,
      //     url: report.url,
      //     userId: report.userId
      //   }
      // });

      // Example for custom endpoint:
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report)
    } catch (err) {
    }
  }

  public getErrorReports(): ErrorReport[] {
    return [...this.errorReports];
  }

  public clearErrorReports(): void {
    this.errorReports = [];
  }

  public getRecentErrors(count: number = 10): ErrorReport[] {
    return this.errorReports.slice(-count);
  }
}

// Global error handler instance
export const globalErrorHandler = new ErrorHandler();

// Utility function for components to report errors
export function reportError(error: Error, context?: string, userId?: string): void {
  globalErrorHandler.handleError(error, context, userId);
}
