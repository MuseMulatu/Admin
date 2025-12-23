import type { VercelRequest, VercelResponse } from "@vercel/node";

const BACKEND_BASE = "https://app.share-rides.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Extract path array robustly
    let pathArray: string[] = [];

    if (Array.isArray(req.query.path)) {
      pathArray = req.query.path;
    } else if (typeof req.query.path === "string") {
      pathArray = [req.query.path];
    } else if (req.url) {
      const urlParts = req.url.split("/api/admin/")[1]?.split("/") || [];
      pathArray = urlParts.filter(Boolean);
    }

    // Remove query params from last segment
    const lastSegment = pathArray[pathArray.length - 1] || "";
    const [cleanSegment] = lastSegment.split("?");
    pathArray[pathArray.length - 1] = cleanSegment;

    // Build backend path
    const backendPath = `/admin/${pathArray.join("/")}`;

    // Reconstruct query string
    const queryParams = new URLSearchParams(req.query as Record<string, string>);
    queryParams.delete("path"); // remove the catch-all param
    const queryString = queryParams.toString();
    const fullUrl = queryString ? `${BACKEND_BASE}${backendPath}?${queryString}` : `${BACKEND_BASE}${backendPath}`;

    console.log("[VERCEL CATCH-ALL] Request method:", req.method);
    console.log("[VERCEL CATCH-ALL] Forwarding to backend:", fullUrl);

    const backendRes = await fetch(fullUrl, {
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
