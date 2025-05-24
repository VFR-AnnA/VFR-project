import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Meshy API configuration
const MESHY_URL = 'https://api.meshy.ai/openapi/v2/text-to-3d';

/**
 * GET /api/status
 * Endpoint to check the status of a generation task
 */
export async function GET(request: NextRequest) {
  try {
    // Get the task ID from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const taskId = searchParams.get('id');
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch the task status from Meshy API
    const statusResponse = await fetch(`${MESHY_URL}/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MESHY_KEY!}`
      }
    });
    
    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error('Meshy API status error response:', errorText);
      throw new Error(`Meshy API status error: ${statusResponse.status} ${statusResponse.statusText} - ${errorText}`);
    }
    
    const data = await statusResponse.json();
    
    // Calculate estimated time remaining based on progress
    let estimatedTimeRemaining = null;
    if (data.status === 'IN_PROGRESS' && data.progress > 0) {
      // Calculate elapsed time in seconds
      const elapsedTime = (Date.now() - data.started_at) / 1000;
      
      // Estimate total time based on current progress
      const totalEstimatedTime = (elapsedTime / data.progress) * 100;
      
      // Calculate remaining time in seconds
      estimatedTimeRemaining = Math.max(0, totalEstimatedTime - elapsedTime);
    }
    
    // Return the status information
    return NextResponse.json({
      id: data.id,
      status: data.status,
      progress: data.progress,
      mode: data.mode,
      estimatedTimeRemaining,
      model_urls: data.model_urls,
      texture_urls: data.texture_urls,
      started_at: data.started_at,
      finished_at: data.finished_at,
      elapsed_time: data.started_at ? (Date.now() - data.started_at) / 1000 : 0
    });
  } catch (error) {
    console.error('Status API error:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get task status',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}