interface R2Bucket {
  getSignedUrl: (key: string, options: { expiresIn: number }) => Promise<string | null>;
}

export default {
  async fetch(req: Request, env: { VFR_BUCKET: R2Bucket }): Promise<Response> {
    const key = new URL(req.url).pathname.slice(1) || "mannequin.glb";
    const url = await env.VFR_BUCKET.getSignedUrl(key, { expiresIn: 3600 });
    return url ? Response.redirect(url, 302) : new Response("Asset not found", { status: 404 });
  },
};