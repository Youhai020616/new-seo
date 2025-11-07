import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clusterKeywords, getClusterStats } from '@/lib/ai/services/keyword-cluster-service';
import type { Keyword } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords, num_clusters, language } = body as {
      keywords: Keyword[];
      num_clusters?: number;
      language?: 'en' | 'zh';
    };

    // Validation
    if (!keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Keywords array is required',
        },
        { status: 400 }
      );
    }

    if (keywords.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least 3 keywords are required for clustering',
        },
        { status: 400 }
      );
    }

    if (keywords.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Maximum 100 keywords allowed per request',
        },
        { status: 400 }
      );
    }

    // Cluster keywords
    const result = await clusterKeywords(keywords, {
      numClusters: num_clusters,
      language,
      useCache: true,
    });

    // Get cluster statistics
    const stats = getClusterStats(result);

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        stats,
      },
    });
  } catch (error) {
    console.error('Keyword cluster API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cluster keywords',
      },
      { status: 500 }
    );
  }
}
