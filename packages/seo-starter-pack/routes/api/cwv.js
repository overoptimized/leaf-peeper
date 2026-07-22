export const prerender = false;
import { env } from "cloudflare:workers";

const VALID_METRICS = new Set(["CLS", "INP", "LCP", "FCP", "TTFB"]);

export async function POST({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("bad request", { status: 400 });
  }

  const { name, value, rating, id, path, delta } = body;

  if (!name || !VALID_METRICS.has(name) || typeof value !== "number") {
    return new Response("bad request", { status: 400 });
  }

  try {
    const cf = request.cf ?? {};
    await env.DB.prepare(
      `INSERT INTO cwv_log (ts, name, value, rating, delta, entry_id, path, ua, country)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      Date.now(),
      name,
      value,
      rating ?? null,
      typeof delta === "number" ? delta : null,
      id ?? null,
      path ?? null,
      request.headers.get("user-agent") ?? null,
      cf.country ?? null
    ).run();
  } catch (e) {
    console.error("cwv-log error:", e);
    return new Response("error", { status: 500 });
  }

  return new Response(null, { status: 204 });
}
