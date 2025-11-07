/**
 * Cache Manager for AI Results
 * Implements LRU/LFU cache with TTL support
 */

import crypto from 'crypto';

export interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum number of entries
  strategy: 'lru' | 'lfu'; // Eviction strategy
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
  totalRequests: number;
}

/**
 * Generic cache manager
 */
export class CacheManager<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private hits = 0;
  private misses = 0;

  constructor(private config: CacheConfig) {}

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update access metadata
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.hits++;

    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, customTTL?: number): void {
    const now = Date.now();
    const ttl = customTTL ?? this.config.ttl;

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: now,
      expiresAt: now + ttl * 1000,
      accessCount: 0,
      lastAccessed: now,
    };

    // Check if cache is full
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evict();
    }

    this.cache.set(key, entry);
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Evict entries based on strategy
   */
  private evict(): void {
    if (this.cache.size === 0) return;

    const entries = Array.from(this.cache.values());

    let entryToEvict: CacheEntry<T>;

    if (this.config.strategy === 'lru') {
      // Evict least recently used
      entryToEvict = entries.reduce((lru, entry) =>
        entry.lastAccessed < lru.lastAccessed ? entry : lru
      );
    } else {
      // Evict least frequently used
      entryToEvict = entries.reduce((lfu, entry) =>
        entry.accessCount < lfu.accessCount ? entry : lfu
      );
    }

    this.cache.delete(entryToEvict.key);
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    return removedCount;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: totalRequests > 0 ? this.hits / totalRequests : 0,
      totalRequests,
    };
  }

  /**
   * Get all cache entries
   */
  entries(): IterableIterator<[string, CacheEntry<T>]> {
    return this.cache.entries();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * Generate cache key from parameters
 */
export function generateCacheKey(service: string, params: any): string {
  const paramsString = JSON.stringify(params, Object.keys(params).sort());
  const hash = crypto.createHash('md5').update(`${service}:${paramsString}`).digest('hex');
  return `${service}:${hash}`;
}

/**
 * Decorator for caching function results
 */
export function cached<T>(
  cache: CacheManager<T>,
  keyGenerator: (...args: any[]) => string,
  ttl?: number
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = keyGenerator(...args);

      // Check cache
      const cachedValue = cache.get(cacheKey);
      if (cachedValue !== null) {
        return cachedValue;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Store in cache
      cache.set(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}

/**
 * Predefined cache configurations
 */
export const CachePresets = {
  // Short-lived cache (1 hour)
  short: {
    ttl: 3600, // 1 hour
    maxSize: 100,
    strategy: 'lru' as const,
  },
  // Standard cache (6 hours)
  standard: {
    ttl: 21600, // 6 hours
    maxSize: 500,
    strategy: 'lru' as const,
  },
  // Long-lived cache (24 hours)
  long: {
    ttl: 86400, // 24 hours
    maxSize: 1000,
    strategy: 'lfu' as const,
  },
} as const;

/**
 * Global cache instances for different services
 */
export class GlobalCacheManager {
  private static instances: Map<string, CacheManager<any>> = new Map();

  /**
   * Get or create cache instance for service
   */
  static getInstance<T>(serviceName: string, config?: CacheConfig): CacheManager<T> {
    if (!this.instances.has(serviceName)) {
      const defaultConfig = config || CachePresets.standard;
      this.instances.set(serviceName, new CacheManager<T>(defaultConfig));
    }

    return this.instances.get(serviceName) as CacheManager<T>;
  }

  /**
   * Clean up all caches
   */
  static cleanupAll(): number {
    let totalRemoved = 0;

    for (const cache of this.instances.values()) {
      totalRemoved += cache.cleanup();
    }

    return totalRemoved;
  }

  /**
   * Get global cache statistics
   */
  static getGlobalStats(): Record<string, CacheStats> {
    const stats: Record<string, CacheStats> = {};

    for (const [name, cache] of this.instances.entries()) {
      stats[name] = cache.getStats();
    }

    return stats;
  }

  /**
   * Clear all caches
   */
  static clearAll(): void {
    for (const cache of this.instances.values()) {
      cache.clear();
    }
  }
}

/**
 * Utility function to wrap async functions with caching
 */
export function withCache<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: {
    cacheName: string;
    keyGenerator: (...args: TArgs) => string;
    config?: CacheConfig;
  }
): (...args: TArgs) => Promise<TResult> {
  const cache = GlobalCacheManager.getInstance<TResult>(options.cacheName, options.config);

  return async (...args: TArgs): Promise<TResult> => {
    const cacheKey = options.keyGenerator(...args);

    // Check cache
    const cachedValue = cache.get(cacheKey);
    if (cachedValue !== null) {
      return cachedValue;
    }

    // Execute function
    const result = await fn(...args);

    // Store in cache
    cache.set(cacheKey, result);

    return result;
  };
}
