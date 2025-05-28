/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-25T12:34+02:00
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Asset proxy route to handle CORS issues with external assets
 * This route fetches assets from external sources and serves them with proper CORS headers
 */
export async function GET(req: NextRequest) {
  // Get the URL from the query parameters
  const url = req.nextUrl.searchParams.get('url');
  
  // Validate the URL
  if (!url) {
    return NextResponse.json({ error: 'url parameter is required' }, { status: 400 });
  }
  
  try {
    // Fetch the asset from the external source
    // Server-side fetch doesn't have CORS restrictions
    const response = await fetch(url);
    
    // Check if the fetch was successful
    if (!response.ok) {
      console.error(`Error fetching asset from ${url}: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch asset: ${response.statusText}` }, 
        { status: 502 }
      );
    }
    
    // Get the asset as a blob
    const blob = await response.blob();
    
    // Return the asset with proper headers
    return new NextResponse(blob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*', // Allow any origin to access the asset
        'Cache-Control': 'public, max-age=604800', // Cache for 1 week
      },
    });
  } catch (error) {
    console.error(`Error in asset proxy:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch asset from external source' }, 
      { status: 500 }
    );
  }
}