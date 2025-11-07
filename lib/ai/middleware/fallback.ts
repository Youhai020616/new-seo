/**
 * Fallback Strategy Middleware
 * Provides graceful degradation when AI services fail
 */

import { AIErrorHandler, type AIError } from './error-handler';

export interface FallbackOptions<T> {
  // Fallback function to execute when AI fails
  fallback: () => T | Promise<T>;
  // Condition to determine if fallback should be used
  shouldFallback?: (error: AIError) => boolean;
  // Callback when fallback is triggered
  onFallback?: (error: AIError) => void;
}

export interface FallbackResult<T> {
  data: T;
  usedFallback: boolean;
  error?: AIError;
}

/**
 * Execute AI function with fallback strategy
 */
export async function withFallback<T>(
  aiFn: () => Promise<T>,
  fallbackFn: () => T | Promise<T>,
  options?: Partial<FallbackOptions<T>>
): Promise<FallbackResult<T>> {
  try {
    const data = await aiFn();
    return {
      data,
      usedFallback: false,
    };
  } catch (error) {
    const aiError = AIErrorHandler.handle(error);

    // Check if fallback should be used
    const shouldUseFallback = options?.shouldFallback
      ? options.shouldFallback(aiError)
      : AIErrorHandler.shouldUseFallback(aiError);

    if (shouldUseFallback) {
      // Trigger onFallback callback if provided
      if (options?.onFallback) {
        options.onFallback(aiError);
      }

      // Log fallback usage
      console.info(
        `[Fallback] AI service failed (${aiError.type}), using fallback method`,
        { error: aiError.message }
      );

      // Execute fallback
      const fallbackData = await Promise.resolve(fallbackFn());

      return {
        data: fallbackData,
        usedFallback: true,
        error: aiError,
      };
    }

    // If fallback should not be used, rethrow the error
    throw error;
  }
}

/**
 * Create a fallback wrapper function
 */
export function createFallbackWrapper<TArgs extends any[], TResult>(
  aiFn: (...args: TArgs) => Promise<TResult>,
  fallbackFn: (...args: TArgs) => TResult | Promise<TResult>,
  options?: Partial<FallbackOptions<TResult>>
): (...args: TArgs) => Promise<FallbackResult<TResult>> {
  return async (...args: TArgs): Promise<FallbackResult<TResult>> => {
    return withFallback(
      () => aiFn(...args),
      () => fallbackFn(...args),
      options
    );
  };
}

/**
 * Fallback strategies for common AI operations
 */
export const FallbackStrategies = {
  /**
   * Return empty result with warning
   */
  empty: <T>(emptyValue: T) => (): T => {
    console.warn('[Fallback] Returning empty result');
    return emptyValue;
  },

  /**
   * Return cached result if available
   */
  cached: <T>(cache: Map<string, T>, key: string, defaultValue: T) => (): T => {
    const cached = cache.get(key);
    if (cached) {
      console.info('[Fallback] Using cached result');
      return cached;
    }
    console.warn('[Fallback] No cache available, using default value');
    return defaultValue;
  },

  /**
   * Return rule-based algorithm result
   */
  ruleBased: <T>(ruleBasedFn: () => T) => (): T => {
    console.info('[Fallback] Using rule-based algorithm');
    return ruleBasedFn();
  },
};

/**
 * Retry with fallback
 * Combines retry logic with fallback strategy
 */
export async function retryWithFallback<T>(
  aiFn: () => Promise<T>,
  fallbackFn: () => T | Promise<T>,
  retryOptions: {
    maxRetries: number;
    delay: number;
  }
): Promise<FallbackResult<T>> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retryOptions.maxRetries; attempt++) {
    try {
      const data = await aiFn();
      return {
        data,
        usedFallback: false,
      };
    } catch (error) {
      lastError = error as Error;

      if (attempt < retryOptions.maxRetries) {
        console.warn(
          `[RetryWithFallback] Attempt ${attempt}/${retryOptions.maxRetries} failed, retrying...`
        );
        await new Promise((resolve) => setTimeout(resolve, retryOptions.delay));
      }
    }
  }

  // All retries failed, use fallback
  const aiError = AIErrorHandler.handle(lastError);

  console.info(
    `[RetryWithFallback] All ${retryOptions.maxRetries} attempts failed, using fallback`
  );

  const fallbackData = await Promise.resolve(fallbackFn());

  return {
    data: fallbackData,
    usedFallback: true,
    error: aiError,
  };
}

/**
 * Circuit breaker pattern
 * Temporarily disable AI calls after consecutive failures
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private isOpen = false;

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}

  /**
   * Execute function with circuit breaker
   */
  async execute<T>(
    aiFn: () => Promise<T>,
    fallbackFn: () => T | Promise<T>
  ): Promise<FallbackResult<T>> {
    // Check if circuit is open
    if (this.isOpen) {
      const now = Date.now();
      const timeSinceLastFailure = now - (this.lastFailureTime || 0);

      // If timeout has passed, try to close the circuit
      if (timeSinceLastFailure > this.timeout) {
        console.info('[CircuitBreaker] Attempting to close circuit');
        this.isOpen = false;
        this.failureCount = 0;
      } else {
        // Circuit is still open, use fallback immediately
        console.warn('[CircuitBreaker] Circuit is open, using fallback');
        const data = await Promise.resolve(fallbackFn());
        return {
          data,
          usedFallback: true,
        };
      }
    }

    try {
      const data = await aiFn();
      // Success, reset failure count
      this.failureCount = 0;
      return {
        data,
        usedFallback: false,
      };
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      // Check if threshold is reached
      if (this.failureCount >= this.threshold) {
        this.isOpen = true;
        console.error(
          `[CircuitBreaker] Circuit opened after ${this.failureCount} failures`
        );
      }

      // Use fallback
      const aiError = AIErrorHandler.handle(error);
      const data = await Promise.resolve(fallbackFn());

      return {
        data,
        usedFallback: true,
        error: aiError,
      };
    }
  }

  /**
   * Get circuit breaker status
   */
  getStatus() {
    return {
      isOpen: this.isOpen,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  /**
   * Reset circuit breaker
   */
  reset() {
    this.isOpen = false;
    this.failureCount = 0;
    this.lastFailureTime = null;
  }
}
