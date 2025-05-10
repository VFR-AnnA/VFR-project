/// <reference types="@cloudflare/workers-types" />

export default {
  async fetch(req: Request, env: { VFR_BUCKET: R2Bucket }): Promise<Response> {
    const url = new URL(req.url);
    const key = url.pathname.slice(1) || "mannequin.glb"; // Default to mannequin.glb if no path

    if (!key) {
      return new Response("Not Found", { status: 404 });
    }

    const object = await env.VFR_BUCKET.get(key);

    if (object === null) {
      return new Response("Object Not Found", { status: 404 });
    }

    // Construct a new response with the object's body and headers
    const headers = new Headers();
    object.writeHttpMetadata(headers); // Copies metadata like ETag, Cache-Control, etc.
    headers.set("etag", object.httpEtag); // Ensure ETag is set

    return new Response(object.body, {
      headers,
    });
  }
};