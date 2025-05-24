import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Edge API route that proxies requests to model assets
 * and adds the necessary CORS headers to allow browser access
 *
 * Supports multiple ways to reference models:
 * - /api/model-by-id?taskId=... - For Meshy generated models
 * - /api/model-by-id?url=... - For any remote model URL
 * - /api/model-by-id?path=... - For local models in public directory
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const url = searchParams.get('url');
    const path = searchParams.get('path');
    
    let modelUrl: string;
    
    // Determine which parameter to use
    if (taskId) {
      // Meshy model with task ID
      modelUrl = `https://assets.meshy.ai/${taskId}/output/model.glb`;
      console.log(`[ModelProxy] Fetching Meshy model with ID: ${taskId}`);
    } else if (url) {
      // Direct URL to a model
      modelUrl = url;
      console.log(`[ModelProxy] Fetching model from URL: ${url}`);
    } else if (path) {
      // Path to a local model in public directory
      const modelPath = path.startsWith('/') ? path : `/${path}`;
      return NextResponse.redirect(new URL(modelPath, request.url));
    } else {
      // Default to mannequin model if no parameters provided
      return NextResponse.redirect(new URL('/models/mannequin.glb', request.url));
    }
    
    // Validate URL if provided directly
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      return NextResponse.json(
        { error: 'URL must be absolute (start with http:// or https://)' },
        { status: 400 }
      );
    }
    
    // Handle local models (redirect to static files)
    if (modelUrl.startsWith('/')) {
      return NextResponse.redirect(new URL(modelUrl, request.url));
    }
    
    // For remote models, proxy the request
    const modelResponse = await fetch(modelUrl, {
      cache: 'no-store',
      headers: {
        // Add authorization header if needed for Meshy
        ...(modelUrl.includes('assets.meshy.ai') && process.env.MESHY_KEY
            ? { 'Authorization': `Bearer ${process.env.MESHY_KEY}` }
            : {})
      }
    });
    
    // If the model couldn't be fetched, return a meaningful error
    if (!modelResponse.ok) {
      console.error(`[ModelProxy] Error fetching model: ${modelResponse.status} ${modelResponse.statusText}`);
      
      let errorBody: string;
      try {
        errorBody = await modelResponse.text();
      } catch (e) {
        errorBody = 'Could not read error response';
      }
      
      return NextResponse.json(
        {
          error: `Error ${modelResponse.status}: ${modelResponse.statusText}`,
          details: errorBody
        },
        {
          status: modelResponse.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Return the model with appropriate headers
    return new NextResponse(modelResponse.body, {
      headers: {
        'Content-Type': 'model/gltf-binary',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[ModelProxy] Exception:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error fetching model',
        timestamp: new Date().toISOString()
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      }
    );
  }
}