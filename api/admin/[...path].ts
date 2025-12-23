import type { VercelRequest, VercelResponse } from "@vercel/node";

const BACKEND_BASE = "https://app.share-rides.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Robust path extraction
    let pathArray: string[] = [];

    if (Array.isArray(req.query.path)) {
      pathArray = req.query.path;
    } else if (typeof req.query.path === "string") {
      pathArray = [req.query.path];
    } else if (req.url) {
      // Fallback: parse from URL for direct fetches like /api/admin/rides/active
      const urlParts = req.url.split("/api/admin/")[1]?.split("/") || [];
      pathArray = urlParts.filter(Boolean);
    }

    console.log("[VERCEL CATCH-ALL] Request method:", req.method);
    console.log("[VERCEL CATCH-ALL] Request query:", req.query);
    console.log("[VERCEL CATCH-ALL] Extracted path array:", pathArray);

    if (!pathArray.length) {
      return res.status(400).json({ error: "No path provided to proxy" });
    }

    // Build backend path
    const backendPath = `/admin/${pathArray.join("/")}`;
    console.log("[VERCEL CATCH-ALL] Forwarding to backend path:", backendPath);

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        // Trusted admin credentials
        "X-Admin-Id": "vercel_admin",
        "X-Admin-Role": "super_admin",
      },
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : JSON.stringify(req.body),
    };

    const backendRes = await fetch(`${BACKEND_BASE}${backendPath}`, fetchOptions);
    const text = await backendRes.text();

    console.log("[VERCEL CATCH-ALL] Backend status:", backendRes.status);

    res.status(backendRes.status);
    try {
      res.json(JSON.parse(text));
    } catch {
      res.send(text);
    }
  } catch (error) {
    console.error("[VERCEL CATCH-ALL EXCEPTION]", error);
    res.status(500).json({ error: "Proxy request failed" });
  }
}
