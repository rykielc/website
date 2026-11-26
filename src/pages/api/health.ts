import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

export const GET: APIRoute = async () => {
  const startTime = performance.now();

  try {
    // 1. Validate D1 Database Connectivity
    const dbPing = await env.DB.prepare("SELECT 1 AS status").first<{ status: number }>();
    const isDbConnected = dbPing?.status === 1;

    // 2. Validate R2 Storage Connectivity (bound as MEDIA)
    const bucketObjects = await env.MEDIA.list({ limit: 1 });
    const isR2Connected = Array.isArray(bucketObjects.objects);

    const latencyMs = Math.round(performance.now() - startTime);

    const payload = {
      "@context": "https://schema.org",
      "@type": "Observation",
      status: "pass",
      service: "AIYA Web Engine",
      timestamp: new Date().toISOString(),
      latency: `${latencyMs}ms`,
      checks: {
        d1_database: isDbConnected ? "healthy" : "unhealthy",
        r2_storage: isR2Connected ? "healthy" : "unhealthy",
      },
    };

    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (err) {
    const errorPayload = {
      "@context": "https://schema.org",
      "@type": "Observation",
      status: "fail",
      service: "AIYA Web Engine",
      timestamp: new Date().toISOString(),
      error: (err as Error).message,
    };

    return new Response(JSON.stringify(errorPayload, null, 2), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  }
};