import type { VercelRequest, VercelResponse } from "@vercel/node";

const BACKEND_BASE = "https://app.share-rides.com";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Example incoming:
    // /api/admin/rides/active?city=Austin, TX
    const originalUrl = req.url || "";

    // Strip "/api/admin"
    const backendPath = originalUrl.replace(/^\/api\/admin/, "");

    console.log("[VERCEL READ PROXY]");
    console.log("Method:", req.method);
    console.log("Original URL:", originalUrl);
    console.log("Forwarding to:", `/admin${backendPath}`);

    const upstream = await fetch(`${BACKEND_BASE}/admin${backendPath}`, {
      method: req.method,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Admin-Id": "vercel_admin",
        "X-Admin-Role": "super_admin",
      },
    });

    const text = await upstream.text();

    console.log("Upstream status:", upstream.status);

    res.status(upstream.status);

    // Safe JSON handling
    try {
      res.json(JSON.parse(text));
    } catch {
      res.send(text);
    }

  } catch (error) {
    console.error("[VERCEL READ PROXY ERROR]", error);
    res.status(500).json({ error: "Admin proxy failed" });
  }
}
