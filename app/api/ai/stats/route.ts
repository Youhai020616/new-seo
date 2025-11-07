import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { globalCostTracker, checkBudget, type BudgetConfig } from '@/lib/ai/utils/cost-tracker';
import { GlobalCacheManager } from '@/lib/ai/utils/cache-manager';

/**
 * GET /api/ai/stats
 * Get AI usage statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const timeRange = searchParams.get('range') || 'today'; // today | month | all
    const service = searchParams.get('service') || undefined;
    const userId = searchParams.get('userId') || undefined;

    // Calculate time range
    let startTime: number | undefined;
    let endTime: number | undefined;

    const now = new Date();

    if (timeRange === 'today') {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      startTime = startOfDay.getTime();
      endTime = now.getTime();
    } else if (timeRange === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      startTime = startOfMonth.getTime();
      endTime = now.getTime();
    }

    // Get usage stats
    const usageStats = globalCostTracker.getStats({
      startTime,
      endTime,
      service,
      userId,
    });

    // Get cache stats
    const cacheStats = GlobalCacheManager.getGlobalStats();

    // Get recent records
    const recentRecords = globalCostTracker.getRecentRecords(10);

    // Budget check (example configuration)
    const budgetConfig: BudgetConfig = {
      daily: 10, // $10 per day
      monthly: 100, // $100 per month
      warningThreshold: 0.8, // 80%
    };

    const budgetStatus = checkBudget(globalCostTracker, budgetConfig);

    return NextResponse.json({
      success: true,
      data: {
        usage: usageStats,
        cache: cacheStats,
        recentRecords,
        budget: {
          config: budgetConfig,
          status: budgetStatus,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch statistics',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/stats/reset
 * Reset statistics (for testing/maintenance)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'reset') {
      globalCostTracker.clear();
      GlobalCacheManager.clearAll();

      return NextResponse.json({
        success: true,
        message: 'Statistics reset successfully',
      });
    }

    if (action === 'cleanup') {
      const removedCount = GlobalCacheManager.cleanupAll();

      return NextResponse.json({
        success: true,
        message: `Cleaned up ${removedCount} expired cache entries`,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action. Use "reset" or "cleanup"',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Stats reset error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset statistics',
      },
      { status: 500 }
    );
  }
}
