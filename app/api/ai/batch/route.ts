import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateAISummary } from '@/lib/ai/services/summary-service';
import { analyzeSentiment } from '@/lib/ai/services/sentiment-service';
import { generateAITitles } from '@/lib/ai/services/title-service';
import { generateAIMeta } from '@/lib/ai/services/meta-service';
import { clusterKeywords } from '@/lib/ai/services/keyword-cluster-service';
import type { Keyword } from '@/types';

export type TaskType = 'summary' | 'sentiment' | 'seo-title' | 'seo-meta' | 'keyword-cluster';
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface BatchTask {
  id: string;
  type: TaskType;
  params: any;
}

export interface BatchTaskResult {
  task_id: string;
  type: TaskType;
  status: TaskStatus;
  data?: any;
  error?: string;
  execution_time?: number;
}

export interface BatchResponse {
  success: boolean;
  total_tasks: number;
  completed: number;
  failed: number;
  results: BatchTaskResult[];
  total_usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  total_execution_time: number;
}

/**
 * Execute a single task
 */
async function executeTask(task: BatchTask): Promise<BatchTaskResult> {
  const startTime = Date.now();

  try {
    let result: any;

    switch (task.type) {
      case 'summary':
        result = await generateAISummary(task.params.content, {
          language: task.params.language,
          lengths: task.params.lengths,
          useCache: task.params.useCache !== false,
        });
        break;

      case 'sentiment':
        result = await analyzeSentiment(task.params.content, {
          language: task.params.language,
          useCache: task.params.useCache !== false,
        });
        break;

      case 'seo-title':
        result = await generateAITitles(
          task.params.keywords as Keyword[],
          task.params.summary || ''
        );
        break;

      case 'seo-meta':
        result = await generateAIMeta(
          task.params.keywords as Keyword[],
          task.params.content || ''
        );
        break;

      case 'keyword-cluster':
        result = await clusterKeywords(task.params.keywords as Keyword[], {
          numClusters: task.params.num_clusters,
          language: task.params.language,
          useCache: task.params.useCache !== false,
        });
        break;

      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }

    return {
      task_id: task.id,
      type: task.type,
      status: 'completed',
      data: result,
      execution_time: Date.now() - startTime,
    };
  } catch (error) {
    return {
      task_id: task.id,
      type: task.type,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      execution_time: Date.now() - startTime,
    };
  }
}

/**
 * POST /api/ai/batch
 * Execute multiple AI tasks in batch
 */
export async function POST(request: NextRequest) {
  const batchStartTime = Date.now();

  try {
    const body = await request.json();
    const { tasks, parallel } = body as {
      tasks: BatchTask[];
      parallel?: boolean;
    };

    // Validation
    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tasks array is required',
        },
        { status: 400 }
      );
    }

    if (tasks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one task is required',
        },
        { status: 400 }
      );
    }

    if (tasks.length > 20) {
      return NextResponse.json(
        {
          success: false,
          error: 'Maximum 20 tasks allowed per batch request',
        },
        { status: 400 }
      );
    }

    // Validate task IDs are unique
    const taskIds = tasks.map(t => t.id);
    const uniqueIds = new Set(taskIds);
    if (taskIds.length !== uniqueIds.size) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task IDs must be unique',
        },
        { status: 400 }
      );
    }

    // Execute tasks
    let results: BatchTaskResult[];

    if (parallel !== false) {
      // Execute in parallel (default)
      const promises = tasks.map(task => executeTask(task));
      results = await Promise.all(promises);
    } else {
      // Execute sequentially
      results = [];
      for (const task of tasks) {
        const result = await executeTask(task);
        results.push(result);
      }
    }

    // Calculate statistics
    const completed = results.filter(r => r.status === 'completed').length;
    const failed = results.filter(r => r.status === 'failed').length;

    // Calculate total usage
    const totalUsage = results.reduce(
      (acc, result) => {
        if (result.status === 'completed' && result.data?.usage) {
          return {
            prompt_tokens: acc.prompt_tokens + (result.data.usage.prompt_tokens || 0),
            completion_tokens: acc.completion_tokens + (result.data.usage.completion_tokens || 0),
            total_tokens: acc.total_tokens + (result.data.usage.total_tokens || 0),
          };
        }
        return acc;
      },
      { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    );

    const response: BatchResponse = {
      success: failed === 0,
      total_tasks: tasks.length,
      completed,
      failed,
      results,
      total_usage: totalUsage,
      total_execution_time: Date.now() - batchStartTime,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Batch API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process batch',
      },
      { status: 500 }
    );
  }
}
