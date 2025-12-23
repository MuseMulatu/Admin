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

    // 1. Capture credentials from the incoming Frontend request
    // Note: Node.js headers are always lowercase
    const adminId = req.headers['x-admin-id'] as string;
    const adminRole = req.headers['x-admin-role'] as string;

   const upstream = await fetch(`${BACKEND_BASE}/admin${backendPath}`, {
      method: req.method,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",

        // If the header is missing, we send an empty string (Backend will return 401)
        "X-Admin-Id": adminId || "",
        "X-Admin-Role": adminRole || "",
      },
      // 3. Ensure body is forwarded (contains status, admin_name, etc.)
      body: req.body ? JSON.stringify(req.body) : undefined,
    });

    const text = await upstream.text();
    res.status(upstream.status);

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
