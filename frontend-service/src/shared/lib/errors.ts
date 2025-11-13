import type { UIText, KratosError as KratosErrorResponse } from "./kratos";

type FlowMessage = UIText;

type ErrorCode = "NETWORK_ERROR" | "KRATOS_ERROR" | "AUTH_ERROR" | "SERVER_ERROR" | string;

interface AppErrorOptions<TDetails = unknown> {
  code?: ErrorCode;
  statusCode?: number;
  details?: TDetails;
  cause?: unknown;
}

export class AppError<TDetails = unknown> extends Error {
  code?: ErrorCode;
  statusCode?: number;
  details?: TDetails;
  override cause?: unknown;

  constructor(message: string, options: AppErrorOptions<TDetails> = {}) {
    super(message);
    this.name = "AppError";
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.details = options.details;
    this.cause = options.cause;
  }
}

export class NetworkError extends AppError<Error | undefined> {
  originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message, {
      code: "NETWORK_ERROR",
      details: originalError,
      cause: originalError,
    });
    this.name = "NetworkError";
    this.originalError = originalError;
  }
}

export class KratosError extends AppError<KratosErrorResponse | undefined> {
  kratosError?: KratosErrorResponse;
  flowMessages?: FlowMessage[];

  constructor(
    message: string,
    statusCode: number,
    kratosError?: KratosErrorResponse,
    flowMessages?: FlowMessage[],
  ) {
    super(message, {
      code: "KRATOS_ERROR",
      statusCode,
      details: kratosError,
    });
    this.name = "KratosError";
    this.kratosError = kratosError;
    this.flowMessages = flowMessages;
  }

  getUserMessage(): string {
    if (this.flowMessages && this.flowMessages.length > 0) {
      const flowError = this.flowMessages.find((msg) => msg.type === "error");
      if (flowError) {
        return flowError.text;
      }
    }

    if (this.kratosError?.error_hint) {
      return this.kratosError.error_hint;
    }

    if (this.kratosError?.error?.message) {
      const kratosMessage = this.kratosError.error.message;

      if (kratosMessage.includes("Could not find any login identifiers")) {
        return "Registration failed: email address is required. Please try again.";
      }

      if (this.kratosError?.error?.hint) {
        return this.kratosError.error.hint;
      }

      return kratosMessage;
    }

    if (this.kratosError?.error?.reason) {
      return this.kratosError.error.reason;
    }

    return this.message || "An authentication error occurred";
  }
}

export class AuthError extends AppError {
  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message, {
      code: "AUTH_ERROR",
      statusCode,
      details,
    });
    this.name = "AuthError";
  }
}

export class ServerError extends AppError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, {
      code: "SERVER_ERROR",
      statusCode,
      details,
    });
    this.name = "ServerError";
  }
}

const isFetchFailure = (error: TypeError) =>
  error.message.toLowerCase().includes("fetch") ||
  error.message.toLowerCase().includes("loading chunk") ||
  error.message.toLowerCase().includes("network");

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Response) {
    const status = error.status || 500;
    const message = error.status
      ? `Request failed with status ${error.status}`
      : "Request failed";

    return new ServerError(message, status, {
      statusText: error.statusText,
      url: error.url,
    });
  }

  if (error instanceof TypeError && isFetchFailure(error)) {
    return new NetworkError(
      "Unable to connect to the server. Please check your internet connection and try again.",
      error,
    );
  }

  if (error instanceof Error) {
    return new AppError(error.message, { cause: error });
  }

  if (typeof error === "string") {
    return new AppError(error);
  }

  return new AppError("An unknown error occurred");
}

export function shouldShowToUser(error: AppError): boolean {
  if (error instanceof NetworkError) {
    return true;
  }

  if (error instanceof AuthError) {
    return true;
  }

  if (error instanceof KratosError) {
    return true;
  }

  if (error instanceof ServerError) {
    return false;
  }

  return true;
}

export function getUserMessage(error: AppError): string {
  if (error instanceof KratosError) {
    return error.getUserMessage();
  }

  if (error instanceof NetworkError) {
    return "Unable to connect to the server. Please check your internet connection.";
  }

  if (error instanceof AuthError) {
    return "Authentication failed. Please try again.";
  }

  if (error instanceof ServerError) {
    return "Server error. Please try again later.";
  }

  return error.message || "An error occurred";
}

export function logError(error: AppError, context?: string): void {
  const contextLabel = context ? `[${context}] ` : "";
  const errorInfo = {
    name: error.name,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    details: error.details,
    context,
    cause: error.cause,
  };

  if (import.meta.env.DEV) {
    console.error(`${contextLabel}Error:`, errorInfo, error);
  }

  if (import.meta.env.PROD) {
    // TODO: integrate with error tracking solution
  }
}

export function handleError(error: unknown, context?: string): AppError {
  const normalizedError = normalizeError(error);
  logError(normalizedError, context);
  return normalizedError;
}

export function getErrorMessage(error: unknown, context?: string): string {
  const normalizedError = handleError(error, context);
  return getUserMessage(normalizedError);
}

export function shouldDisplayError(error: unknown): boolean {
  const normalizedError = normalizeError(error);
  return shouldShowToUser(normalizedError);
}

