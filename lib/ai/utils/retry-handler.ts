/**
 * Retry Handler Utility
 * Provides automatic retry logic with exponential backoff for AI API calls
 */

export interface RetryOptions {
  maxRetries: number;
  backoff: 'linear' | 'exponential';
  timeout: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { maxRetries, backoff, timeout, onRetry } = options;
  let lastError: Error | null = null;
  const startTime = Date.now();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Add timeout to the function call
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        ),
      ]);

      return result;
    } catch (error) {
      lastError = error as Error;

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Calculate backoff delay
      const delay = calculateBackoff(attempt, backoff);

      // Log retry attempt
      console.warn(
        `[RetryHandler] Attempt ${attempt}/${maxRetries} failed. Retrying in ${delay}ms...`,
        { error: lastError.message }
      );

      // Wait before retrying
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Max retries exceeded');
}

/**
 * Execute a function with retry logic and detailed result
 */
export async function withRetryDetailed<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<RetryResult<T>> {
  const startTime = Date.now();
  let attempts = 0;

  try {
    const data = await withRetry(fn, {
      ...options,
      onRetry: (attempt, error) => {
        attempts = attempt;
        options.onRetry?.(attempt, error);
      },
    });

    return {
      success: true,
      data,
      attempts: attempts || 1,
      totalTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error as Error,
      attempts: options.maxRetries,
      totalTime: Date.now() - startTime,
    };
  }
}

/**
 * Calculate backoff delay based on strategy
 */
function calculateBackoff(attempt: number, strategy: 'linear' | 'exponential'): number {
  const baseDelay = 1000; // 1 second

  if (strategy === 'linear') {
    return baseDelay * attempt;
  }

  // Exponential backoff: 1s, 2s, 4s, 8s, etc.
  return baseDelay * Math.pow(2, attempt - 1);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Predefined retry configurations
 */
export const RetryPresets = {
  // Fast retry for quick operations
  fast: {
    maxRetries: 2,
    backoff: 'linear' as const,
    timeout: 5000, // 5 seconds
  },
  // Standard retry for most AI calls
  standard: {
    maxRetries: 3,
    backoff: 'exponential' as const,
    timeout: 30000, // 30 seconds
  },
  // Aggressive retry for critical operations
  aggressive: {
    maxRetries: 5,
    backoff: 'exponential' as const,
    timeout: 60000, // 60 seconds
  },
} as const;

/**
 * Check if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  const retryableErrors = [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ENETUNREACH',
    'Request timeout',
    'rate_limit_exceeded',
    'server_error',
    'service_unavailable',
  ];

  const errorMessage = error.message.toLowerCase();
  return retryableErrors.some((retryableError) =>
    errorMessage.includes(retryableError.toLowerCase())
  );
}
