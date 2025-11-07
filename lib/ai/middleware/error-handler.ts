/**
 * Unified Error Handler for AI Services
 * Categorizes and handles different types of AI-related errors
 */

export enum AIErrorType {
  API_KEY_INVALID = 'API_KEY_INVALID',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TIMEOUT = 'TIMEOUT',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PARSING_ERROR = 'PARSING_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AIError {
  type: AIErrorType;
  message: string;
  originalError?: Error;
  retryable: boolean;
  statusCode?: number;
  timestamp: number;
}

export interface AIErrorResponse {
  success: false;
  error: AIError;
  fallbackUsed?: boolean;
}

/**
 * Main error handler class
 */
export class AIErrorHandler {
  /**
   * Handle and categorize errors
   */
  static handle(error: unknown): AIError {
    const timestamp = Date.now();

    // Handle Error objects
    if (error instanceof Error) {
      return this.categorizeError(error, timestamp);
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        type: AIErrorType.UNKNOWN_ERROR,
        message: error,
        retryable: false,
        timestamp,
      };
    }

    // Handle API error responses
    if (this.isAPIError(error)) {
      return this.handleAPIError(error as any, timestamp);
    }

    // Unknown error type
    return {
      type: AIErrorType.UNKNOWN_ERROR,
      message: 'An unknown error occurred',
      retryable: false,
      timestamp,
    };
  }

  /**
   * Categorize error based on message and type
   */
  private static categorizeError(error: Error, timestamp: number): AIError {
    const message = error.message.toLowerCase();

    // API Key errors
    if (message.includes('api key') || message.includes('authentication') || message.includes('unauthorized')) {
      return {
        type: AIErrorType.API_KEY_INVALID,
        message: 'Invalid or missing API key',
        originalError: error,
        retryable: false,
        statusCode: 401,
        timestamp,
      };
    }

    // Rate limit errors
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return {
        type: AIErrorType.RATE_LIMIT_EXCEEDED,
        message: 'Rate limit exceeded. Please try again later.',
        originalError: error,
        retryable: true,
        statusCode: 429,
        timestamp,
      };
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('timed out') || message.includes('etimedout')) {
      return {
        type: AIErrorType.TIMEOUT,
        message: 'Request timed out',
        originalError: error,
        retryable: true,
        statusCode: 408,
        timestamp,
      };
    }

    // Quota errors
    if (message.includes('quota') || message.includes('insufficient credits')) {
      return {
        type: AIErrorType.QUOTA_EXCEEDED,
        message: 'API quota exceeded',
        originalError: error,
        retryable: false,
        statusCode: 429,
        timestamp,
      };
    }

    // Network errors
    if (
      message.includes('network') ||
      message.includes('econnreset') ||
      message.includes('enotfound') ||
      message.includes('enetunreach')
    ) {
      return {
        type: AIErrorType.NETWORK_ERROR,
        message: 'Network error occurred',
        originalError: error,
        retryable: true,
        statusCode: 503,
        timestamp,
      };
    }

    // Parsing errors
    if (message.includes('json') || message.includes('parse') || message.includes('invalid response')) {
      return {
        type: AIErrorType.PARSING_ERROR,
        message: 'Failed to parse AI response',
        originalError: error,
        retryable: false,
        statusCode: 500,
        timestamp,
      };
    }

    // Default to unknown error
    return {
      type: AIErrorType.UNKNOWN_ERROR,
      message: error.message || 'An unknown error occurred',
      originalError: error,
      retryable: false,
      timestamp,
    };
  }

  /**
   * Handle API error responses
   */
  private static handleAPIError(error: any, timestamp: number): AIError {
    const statusCode = error.status || error.statusCode;
    const message = error.message || error.error?.message || 'API error';

    if (statusCode === 401) {
      return {
        type: AIErrorType.API_KEY_INVALID,
        message: 'Invalid API key',
        retryable: false,
        statusCode,
        timestamp,
      };
    }

    if (statusCode === 429) {
      return {
        type: AIErrorType.RATE_LIMIT_EXCEEDED,
        message: 'Rate limit exceeded',
        retryable: true,
        statusCode,
        timestamp,
      };
    }

    if (statusCode >= 500) {
      return {
        type: AIErrorType.NETWORK_ERROR,
        message: 'Server error',
        retryable: true,
        statusCode,
        timestamp,
      };
    }

    return {
      type: AIErrorType.UNKNOWN_ERROR,
      message,
      retryable: false,
      statusCode,
      timestamp,
    };
  }

  /**
   * Check if error is an API error response
   */
  private static isAPIError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      ('status' in error || 'statusCode' in error)
    );
  }

  /**
   * Format error for API response
   */
  static toAPIResponse(error: unknown, fallbackUsed = false): AIErrorResponse {
    const aiError = this.handle(error);

    return {
      success: false,
      error: aiError,
      fallbackUsed,
    };
  }

  /**
   * Log error with appropriate level
   */
  static log(error: AIError, context?: Record<string, any>): void {
    const logMessage = `[AI Error] ${error.type}: ${error.message}`;
    const logData = {
      ...context,
      error,
      timestamp: new Date(error.timestamp).toISOString(),
    };

    if (error.retryable) {
      console.warn(logMessage, logData);
    } else {
      console.error(logMessage, logData);
    }
  }

  /**
   * Check if error should trigger fallback
   */
  static shouldUseFallback(error: AIError): boolean {
    // Use fallback for non-critical errors or when AI service is unavailable
    const fallbackTriggers = [
      AIErrorType.TIMEOUT,
      AIErrorType.RATE_LIMIT_EXCEEDED,
      AIErrorType.NETWORK_ERROR,
      AIErrorType.PARSING_ERROR,
    ];

    return fallbackTriggers.includes(error.type);
  }
}

/**
 * Utility function to safely execute AI operations
 */
export async function safeAICall<T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<{ success: true; data: T } | AIErrorResponse> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const aiError = AIErrorHandler.handle(error);
    AIErrorHandler.log(aiError, context);
    return {
      success: false,
      error: aiError,
    };
  }
}
