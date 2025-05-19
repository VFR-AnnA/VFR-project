import { R2Bucket } from '@cloudflare/workers-types';

interface Env {
  VFR_BUCKET: R2Bucket;
  ALLOWED_ORIGIN?: string;
}

export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    const allowedOrigin = env.ALLOWED_ORIGIN;
    const requestOrigin = req.headers.get('Origin');
    if (allowedOrigin && requestOrigin && requestOrigin !== allowedOrigin) {
      return new Response('Forbidden', { status: 403 });
    }
    if (url.pathname === '/favicon.ico') {
      const obj = await env.VFR_BUCKET.get('favicon.ico');
      if (obj) {
        return new Response(await obj.arrayBuffer(), {
          headers: {
            'Content-Type': obj.httpMetadata?.contentType ?? 'image/x-icon',
            'Access-Control-Allow-Origin': allowedOrigin ?? '*',
            'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
          },
        });
      }
      // fallback (may be removed after testing)
      return new Response('favicon not found', { status: 404 });
    }
    const key = new URL(req.url).pathname.slice(1) || "mannequin.glb";
    const obj = await env.VFR_BUCKET.get(key);
    if (!obj) return new Response("Not found", { status: 404 });

    return new Response(await obj.blob().then(b => b.arrayBuffer()), {
      headers: {
        "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
        "Access-Control-Allow-Origin": allowedOrigin ?? "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS"
      }
    });
  }
}