/**
 * Centralized error handling system
 */

import type { UIText, KratosError } from './kratos';

// Legacy type aliases for backward compatibility
type FlowMessage = UIText;
type KratosErrorResponse = KratosError;

/**
 * Base error class for application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Network-related errors (CORS, connection issues, etc.)
 */
export class NetworkError extends AppError {
  constructor(message: string, public originalError?: Error) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Kratos API errors
 */
export class KratosError extends AppError {
  constructor(
    message: string,
    statusCode: number,
    public kratosError?: KratosErrorResponse,
    public flowMessages?: FlowMessage[]
  ) {
    super(message, 'KRATOS_ERROR', statusCode, kratosError);
    this.name = 'KratosError';
    Object.setPrototypeOf(this, KratosError.prototype);
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    // Try to get message from flow messages first (most user-friendly)
    if (this.flowMessages && this.flowMessages.length > 0) {
      const errorMessage = this.flowMessages.find((msg) => msg.type === 'error');
      if (errorMessage) {
        return errorMessage.text;
      }
    }

    // Check top-level error_hint first (most specific)
    if (this.kratosError?.error_hint) {
      return this.kratosError.error_hint;
    }
    
    // Try Kratos error response
    if (this.kratosError?.error?.message) {
      const kratosMessage = this.kratosError.error.message;
      // Replace technical messages with user-friendly ones
      if (kratosMessage.includes('Could not find any login identifiers')) {
        return 'Registration failed: email address is required. Please try again.';
      }
      if (this.kratosError?.error?.hint) {
        return this.kratosError.error.hint;
      }
      return kratosMessage;
    }

    if (this.kratosError?.error?.reason) {
      return this.kratosError.error.reason;
    }

    // Fallback to generic message
    return this.message || 'An authentication error occurred';
  }
}

/**
 * Authentication errors (unauthorized, session expired, etc.)
 */
export class AuthError extends AppError {
  constructor(message: string, statusCode?: number) {
    super(message, 'AUTH_ERROR', statusCode);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Server errors (5xx)
 */
export class ServerError extends AppError {
  constructor(message: string, statusCode: number) {
    super(message, 'SERVER_ERROR', statusCode);
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * Normalize any error to AppError
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new NetworkError('Network error: Unable to connect to server', error);
    }

    return new AppError(error.message);
  }

  if (typeof error === 'string') {
    return new AppError(error);
  }

  return new AppError('An unknown error occurred');
}

/**
 * Check if error should be shown to user
 */
export function shouldShowToUser(error: AppError): boolean {
  // Don't show network errors silently (they indicate configuration issues)
  if (error instanceof NetworkError) {
    return true;
  }

  // Always show auth errors
  if (error instanceof AuthError) {
    return true;
  }

  // Show Kratos errors (they have user-friendly messages)
  if (error instanceof KratosError) {
    return true;
  }

  // Don't show server errors to users (log them instead)
  if (error instanceof ServerError) {
    return false;
  }

  // Default: show generic errors
  return true;
}

/**
 * Get user-friendly error message
 */
export function getUserMessage(error: AppError): string {
  if (error instanceof KratosError) {
    return error.getUserMessage();
  }

  // Default messages for common errors
  if (error instanceof NetworkError) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  if (error instanceof AuthError) {
    return 'Authentication failed. Please try again.';
  }

  if (error instanceof ServerError) {
    return 'Server error. Please try again later.';
  }

  return error.message || 'An error occurred';
}

/**
 * Log error to console (and potentially to error tracking service)
 */
export function logError(error: AppError, context?: string): void {
  const contextStr = context ? `[${context}] ` : '';
  const errorInfo = {
    name: error.name,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    details: error.details,
    context,
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error(`${contextStr}Error:`, errorInfo, error);
  }

  // In production, you might want to send to error tracking service
  // e.g., Sentry, LogRocket, etc.
  if (import.meta.env.PROD) {
    // TODO: Send to error tracking service
    // trackError(error, context);
  }
}

/**
 * Handle and log error
 */
export function handleError(error: unknown, context?: string): AppError {
  const normalizedError = normalizeError(error);
  
  // Log error with context
  logError(normalizedError, context);
  
  return normalizedError;
}

/**
 * Get user-friendly error message (wrapper for handleError + getUserMessage)
 */
export function getErrorMessage(error: unknown, context?: string): string {
  const normalizedError = handleError(error, context);
  return getUserMessage(normalizedError);
}

/**
 * Check if error should be shown to user (wrapper for normalizeError + shouldShowToUser)
 */
export function shouldDisplayError(error: unknown): boolean {
  const normalizedError = normalizeError(error);
  return shouldShowToUser(normalizedError);
}

