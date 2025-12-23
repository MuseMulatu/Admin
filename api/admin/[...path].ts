// api/admin/[...path].ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

const BACKEND_BASE = "https://app.share-rides.com";

// Map "frontend" route names to actual backend paths
const routeMap: Record<string, string> = {
  "dashboard-overview": "dashboard/overview",
  "live-fleet": "drivers/live",
  "rides-active": "rides/active",
  "logs": "logs",
  "drivers": "drivers",
  "riders": "riders",
  // leave other dynamic ones to be handled below
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log("[VERCEL CATCH-ALL] Request method:", req.method);
    console.log("[VERCEL CATCH-ALL] Request query:", req.query);
    console.log("[VERCEL CATCH-ALL] Original path array:", req.query.path);

    // The [...path] param is always an array
    const pathArray = Array.isArray(req.query.path) ? req.query.path : [String(req.query.path)];
    console.log("[VERCEL CATCH-ALL] Path array after normalization:", pathArray);

    // Join path array with / for backend URL
    let rawPath = pathArray.join("/");

    // If mapped route exists, use mapped backend path
    if (routeMap[rawPath]) {
      rawPath = routeMap[rawPath];
    }

    // Handle dynamic IDs like /drivers/:id/status or /rides/:id
    if (pathArray.length >= 2) {
      // example: drivers/123/status
      const [first, second, third] = pathArray;
      if (first === "drivers" && second && third === "status") {
        rawPath = `drivers/${second}/status`;
      } else if (first === "rides" && second && third === "assign") {
        rawPath = `rides/${second}/assign`;
      } else if (first === "rides" && second && !third) {
        rawPath = `rides/${second}`;
      } else if (first === "riders" && second && third === "wallet") {
        rawPath = `riders/${second}/wallet`;
      } else if (first === "rides" && second && third === "cancel") {
        rawPath = `rides/${second}/cancel`;
      }
    }

    console.log("[VERCEL CATCH-ALL] Forwarding to backend path:", rawPath);

    const url = `${BACKEND_BASE}/admin/${rawPath}`;

    const backendRes = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Admin-Id": "vercel_admin",
        "X-Admin-Role": "super_admin",
      },
      body: req.method === "GET" || req.method === "HEAD" ? undefined : JSON.stringify(req.body),
    });

    const text = await backendRes.text();

    console.log("[VERCEL CATCH-ALL] Backend status:", backendRes.status);
    console.log("[VERCEL CATCH-ALL] Backend response:", text);

    res.status(backendRes.status);

    try {
      res.json(JSON.parse(text));
    } catch {
      res.send(text);
    }
  } catch (error) {
    console.error("[VERCEL CATCH-ALL] Proxy exception:", error);
    res.status(500).json({ error: "Proxy request failed" });
  }
}
