import { R2Bucket } from '@cloudflare/workers-types';

interface Env {
  VFR_BUCKET: R2Bucket;
}

export default {
  async fetch(req: Request, env: Env) {
    const key = new URL(req.url).pathname.slice(1) || "mannequin.glb";
    const obj = await env.VFR_BUCKET.get(key);
    if (!obj) return new Response("Not found", { status: 404 });

    return new Response(await obj.blob().then(b => b.arrayBuffer()), {
      headers: {
        "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS"
      }
    });
  }
}