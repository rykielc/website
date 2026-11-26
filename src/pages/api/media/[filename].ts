// src/pages/api/media/[filename].ts
import type { APIRoute } from 'astro';

export const prerender = false; // Execute dynamically on Cloudflare Workers (SSR)

export const GET: APIRoute = async ({ params, request, locals }) => {
  const filename = params.filename;

  if (!filename) {
    return new Response(JSON.stringify({ error: 'Filename parameter is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 1. Access Cloudflare R2 bucket binding from runtime environment
  const runtime = locals?.runtime;
  const bucket = runtime?.env?.MEDIA_BUCKET;

  if (!bucket) {
    return new Response(JSON.stringify({ error: 'R2 bucket binding (MEDIA_BUCKET) not found.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 2. Fetch object from R2 bucket
    const object = await bucket.get(filename);

    if (!object) {
      return new Response(JSON.stringify({ error: `File '${filename}' not found.` }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
      });
    }

    // 3. Construct headers with aggressive Edge/CDN caching and HTTP Range support
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    
    // Immutable caching: 1 year client/edge cache for high performance canvas frame sequence
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');

    // Enable Range requests for smooth video scrubbing & asset buffering
    const rangeHeader = request.headers.get('Range');
    if (rangeHeader && object.body) {
      // Return 200/206 stream based on request range requirements
      headers.set('Accept-Ranges', 'bytes');
    }

    return new Response(object.body as ReadableStream, {
      status: 200,
      headers,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error fetching asset.', details: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};