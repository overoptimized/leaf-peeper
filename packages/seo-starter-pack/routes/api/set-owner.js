export const prerender = false;
import { env } from "cloudflare:workers";

// Actions:
//   ?token=SECRET              — set browser cookie (1 year)
//   ?token=SECRET&clear=1      — clear browser cookie
//   ?token=SECRET&action=add-ip    — add current connecting IP to KV owner list
//   ?token=SECRET&action=remove-ip — remove current connecting IP from KV list
//   ?token=SECRET&action=list-ips  — show current owner IP list

export async function GET({ url, request }) {
  const token  = url.searchParams.get("token");
  const action = url.searchParams.get("action") || "";
  const clear  = url.searchParams.get("clear") === "1";

  if (!env.OWNER_TOKEN || token !== env.OWNER_TOKEN) {
    return new Response("forbidden", { status: 403 });
  }

  const connectingIp = request.headers.get("cf-connecting-ip") || "unknown";

  // ── IP list management ────────────────────────────────────────────────────
  if (action === "add-ip" || action === "remove-ip" || action === "list-ips") {
    const raw = await env.STATS.get("owner:ips");
    const ips = raw ? JSON.parse(raw) : [];

    if (action === "list-ips") {
      return new Response(
        `Owner IPs (${ips.length}):\n${ips.join("\n") || "(none)"}`,
        { headers: { "Content-Type": "text/plain" } }
      );
    }

    if (action === "add-ip") {
      if (!ips.includes(connectingIp)) ips.push(connectingIp);
      await env.STATS.put("owner:ips", JSON.stringify(ips));
      return new Response(
        `Added ${connectingIp} to owner IP list.\nCurrent list (${ips.length}):\n${ips.join("\n")}`,
        { headers: { "Content-Type": "text/plain" } }
      );
    }

    if (action === "remove-ip") {
      const filtered = ips.filter(ip => ip !== connectingIp);
      await env.STATS.put("owner:ips", JSON.stringify(filtered));
      return new Response(
        `Removed ${connectingIp} from owner IP list.\nRemaining (${filtered.length}):\n${filtered.join("\n") || "(none)"}`,
        { headers: { "Content-Type": "text/plain" } }
      );
    }
  }

  // ── Cookie management ─────────────────────────────────────────────────────
  const cookieValue = clear
    ? `_owner=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`
    : `_owner=1; Max-Age=${60 * 60 * 24 * 365}; Path=/; HttpOnly; SameSite=Lax`;

  const message = clear
    ? "Owner cookie cleared."
    : `Owner cookie set (this browser).\nYour IP is: ${connectingIp}\nTo also tag this IP (for Claude Code, AI IDEs, etc.):\n  ?token=…&action=add-ip`;

  return new Response(message, {
    status: 200,
    headers: {
      "Set-Cookie": cookieValue,
      "Content-Type": "text/plain",
    },
  });
}
