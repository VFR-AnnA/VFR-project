// app/api/model/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const remote = searchParams.get('url');
  if (!remote) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  // Validate URL is absolute
  if (!remote.startsWith('http://') && !remote.startsWith('https://')) {
    return NextResponse.json({ error: 'URL must be absolute (start with http:// or https://)' }, { status: 400 });
  }

  console.log('Proxy fetch →', remote);
  
  // één fetch, geen body consumeren
  const upstream = await fetch(remote, {
    redirect: 'follow',
    cache: 'no-store',
  });

  if (!upstream.ok) {
    console.error('Upstream error:', upstream.status, upstream.statusText);
    return NextResponse.json(
      { error: `Upstream ${upstream.status}` },
      { status: 502 },
    );
  }

  // passthrough-body, correcte headers
  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'model/gltf-binary',
      'Access-Control-Allow-Origin': '*',
    },
  });
}