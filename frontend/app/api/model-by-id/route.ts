import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Edge API route that proxies requests to Meshy's model assets
 * and adds the necessary CORS headers to allow browser access
 * Uses query parameter instead of path parameter to avoid type issues
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');
  
  if (!taskId) {
    return NextResponse.json({ error: 'Missing taskId parameter' }, { status: 400 });
  }
  
  const url = `https://assets.meshy.ai/${taskId}/output/model.glb`;
  
  try {
    // Fetch the model from Meshy's servers without caching
    const meshyResponse = await fetch(url, { cache: 'no-store' });
    
    // If the model couldn't be fetched, return a 404
    if (!meshyResponse.ok) {
      console.error(`Failed to fetch model from Meshy: ${meshyResponse.status} ${meshyResponse.statusText}`);
      return new NextResponse('Model not found', { status: 404 });
    }

    // Return the model with CORS headers
    return new NextResponse(meshyResponse.body, {
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Access-Control-Allow-Origin': '*',  // Allow access from any origin
        'Cache-Control': 'public, max-age=31536000, immutable',  // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Error proxying model from Meshy:', error);
    return new NextResponse('Error fetching model', { status: 500 });
  }
}