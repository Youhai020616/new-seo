/**
 * Cost Tracker for AI API Usage
 * Tracks token usage and calculates costs
 */

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface CostCalculation {
  promptCost: number;
  completionCost: number;
  totalCost: number;
  currency: string;
}

export interface UsageRecord {
  timestamp: number;
  service: string;
  operation: string;
  tokens: TokenUsage;
  cost: CostCalculation;
  userId?: string;
  success: boolean;
  cacheHit: boolean;
}

export interface UsageStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  cachedCalls: number;
  totalTokens: number;
  totalCost: number;
  averageTokensPerCall: number;
  cacheHitRate: number;
  byService: Record<string, ServiceStats>;
  byDay: Record<string, DailyStats>;
}

export interface ServiceStats {
  calls: number;
  tokens: number;
  cost: number;
}

export interface DailyStats {
  date: string;
  calls: number;
  tokens: number;
  cost: number;
}

/**
 * DeepSeek pricing (as of 2025)
 * Input: $0.14 / 1M tokens
 * Output: $0.28 / 1M tokens
 */
export const DEEPSEEK_PRICING = {
  input: 0.14 / 1_000_000, // per token
  output: 0.28 / 1_000_000, // per token
  currency: 'USD',
} as const;

/**
 * Cost Tracker class
 */
export class CostTracker {
  private records: UsageRecord[] = [];
  private maxRecords: number;

  constructor(maxRecords = 10000) {
    this.maxRecords = maxRecords;
  }

  /**
   * Calculate cost from token usage
   */
  static calculateCost(tokens: TokenUsage, pricing = DEEPSEEK_PRICING): CostCalculation {
    const promptCost = tokens.prompt_tokens * pricing.input;
    const completionCost = tokens.completion_tokens * pricing.output;
    const totalCost = promptCost + completionCost;

    return {
      promptCost: Number(promptCost.toFixed(6)),
      completionCost: Number(completionCost.toFixed(6)),
      totalCost: Number(totalCost.toFixed(6)),
      currency: pricing.currency,
    };
  }

  /**
   * Track API usage
   */
  trackUsage(
    service: string,
    operation: string,
    tokens: TokenUsage,
    options: {
      userId?: string;
      success?: boolean;
      cacheHit?: boolean;
    } = {}
  ): UsageRecord {
    const cost = CostTracker.calculateCost(tokens);

    const record: UsageRecord = {
      timestamp: Date.now(),
      service,
      operation,
      tokens,
      cost,
      userId: options.userId,
      success: options.success ?? true,
      cacheHit: options.cacheHit ?? false,
    };

    this.records.push(record);

    // Limit records to maxRecords
    if (this.records.length > this.maxRecords) {
      this.records.shift();
    }

    return record;
  }

  /**
   * Get usage statistics for a time range
   */
  getStats(options: {
    startTime?: number;
    endTime?: number;
    userId?: string;
    service?: string;
  } = {}): UsageStats {
    const filteredRecords = this.records.filter((record) => {
      if (options.startTime && record.timestamp < options.startTime) return false;
      if (options.endTime && record.timestamp > options.endTime) return false;
      if (options.userId && record.userId !== options.userId) return false;
      if (options.service && record.service !== options.service) return false;
      return true;
    });

    const totalCalls = filteredRecords.length;
    const successfulCalls = filteredRecords.filter((r) => r.success).length;
    const failedCalls = totalCalls - successfulCalls;
    const cachedCalls = filteredRecords.filter((r) => r.cacheHit).length;

    const totalTokens = filteredRecords.reduce((sum, r) => sum + r.tokens.total_tokens, 0);
    const totalCost = filteredRecords.reduce((sum, r) => sum + r.cost.totalCost, 0);

    const averageTokensPerCall = totalCalls > 0 ? totalTokens / totalCalls : 0;
    const cacheHitRate = totalCalls > 0 ? cachedCalls / totalCalls : 0;

    // Group by service
    const byService: Record<string, ServiceStats> = {};
    for (const record of filteredRecords) {
      if (!byService[record.service]) {
        byService[record.service] = { calls: 0, tokens: 0, cost: 0 };
      }
      byService[record.service].calls++;
      byService[record.service].tokens += record.tokens.total_tokens;
      byService[record.service].cost += record.cost.totalCost;
    }

    // Group by day
    const byDay: Record<string, DailyStats> = {};
    for (const record of filteredRecords) {
      const date = new Date(record.timestamp).toISOString().split('T')[0];
      if (!byDay[date]) {
        byDay[date] = { date, calls: 0, tokens: 0, cost: 0 };
      }
      byDay[date].calls++;
      byDay[date].tokens += record.tokens.total_tokens;
      byDay[date].cost += record.cost.totalCost;
    }

    return {
      totalCalls,
      successfulCalls,
      failedCalls,
      cachedCalls,
      totalTokens,
      totalCost: Number(totalCost.toFixed(6)),
      averageTokensPerCall: Number(averageTokensPerCall.toFixed(2)),
      cacheHitRate: Number(cacheHitRate.toFixed(4)),
      byService,
      byDay,
    };
  }

  /**
   * Get daily statistics
   */
  getDailyStats(date?: Date): DailyStats {
    const targetDate = date || new Date();
    const dateString = targetDate.toISOString().split('T')[0];

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const stats = this.getStats({
      startTime: startOfDay.getTime(),
      endTime: endOfDay.getTime(),
    });

    return (
      stats.byDay[dateString] || {
        date: dateString,
        calls: 0,
        tokens: 0,
        cost: 0,
      }
    );
  }

  /**
   * Get monthly statistics
   */
  getMonthlyStats(year?: number, month?: number): UsageStats {
    const now = new Date();
    const targetYear = year ?? now.getFullYear();
    const targetMonth = month ?? now.getMonth();

    const startOfMonth = new Date(targetYear, targetMonth, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    return this.getStats({
      startTime: startOfMonth.getTime(),
      endTime: endOfMonth.getTime(),
    });
  }

  /**
   * Get user statistics
   */
  getUserStats(userId: string): UsageStats {
    return this.getStats({ userId });
  }

  /**
   * Get service statistics
   */
  getServiceStats(service: string): UsageStats {
    return this.getStats({ service });
  }

  /**
   * Get recent records
   */
  getRecentRecords(limit = 10): UsageRecord[] {
    return this.records.slice(-limit).reverse();
  }

  /**
   * Export data to JSON
   */
  exportToJSON(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        recordCount: this.records.length,
        records: this.records,
      },
      null,
      2
    );
  }

  /**
   * Import data from JSON
   */
  importFromJSON(jsonData: string): number {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data.records)) {
        this.records = data.records;
        return this.records.length;
      }
      return 0;
    } catch (error) {
      console.error('Failed to import data:', error);
      return 0;
    }
  }

  /**
   * Clear all records
   */
  clear(): void {
    this.records = [];
  }

  /**
   * Get total record count
   */
  getRecordCount(): number {
    return this.records.length;
  }
}

/**
 * Global cost tracker instance
 */
export const globalCostTracker = new CostTracker();

/**
 * Utility function to track and log usage
 */
export async function trackAIUsage<T>(
  service: string,
  operation: string,
  fn: () => Promise<{ data: T; usage: TokenUsage }>,
  options: {
    userId?: string;
    cacheHit?: boolean;
  } = {}
): Promise<T> {
  try {
    const result = await fn();

    // Track usage
    globalCostTracker.trackUsage(service, operation, result.usage, {
      ...options,
      success: true,
    });

    // Log usage
    const cost = CostTracker.calculateCost(result.usage);
    console.info(
      `[CostTracker] ${service}.${operation} - Tokens: ${result.usage.total_tokens}, Cost: $${cost.totalCost.toFixed(6)}`
    );

    return result.data;
  } catch (error) {
    // Track failed usage (with 0 tokens)
    globalCostTracker.trackUsage(
      service,
      operation,
      { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      { ...options, success: false }
    );

    throw error;
  }
}

/**
 * Budget warning thresholds
 */
export interface BudgetConfig {
  daily: number;
  monthly: number;
  warningThreshold: number; // percentage (e.g., 0.8 for 80%)
}

/**
 * Check if budget threshold is exceeded
 */
export function checkBudget(tracker: CostTracker, config: BudgetConfig): {
  dailyExceeded: boolean;
  monthlyExceeded: boolean;
  dailyWarning: boolean;
  monthlyWarning: boolean;
  dailyUsage: number;
  monthlyUsage: number;
} {
  const dailyStats = tracker.getDailyStats();
  const monthlyStats = tracker.getMonthlyStats();

  return {
    dailyExceeded: dailyStats.cost >= config.daily,
    monthlyExceeded: monthlyStats.totalCost >= config.monthly,
    dailyWarning: dailyStats.cost >= config.daily * config.warningThreshold,
    monthlyWarning: monthlyStats.totalCost >= config.monthly * config.warningThreshold,
    dailyUsage: dailyStats.cost,
    monthlyUsage: monthlyStats.totalCost,
  };
}
