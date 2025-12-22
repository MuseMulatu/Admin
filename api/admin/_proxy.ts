import type { VercelRequest, VercelResponse } from "@vercel/node";

const BACKEND_BASE = "https://app.share-rides.com";

export async function proxyRequest(
  req: VercelRequest,
  res: VercelResponse,
  backendPath: string
) {
  try {
    const url = `${BACKEND_BASE}${backendPath}`;

    // Always use trusted admin credentials, like dashboard-overview/logs
    const backendRes = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Admin-Id": "vercel_admin",
        "X-Admin-Role": "super_admin",
      },
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : JSON.stringify(req.body),
    });

    const text = await backendRes.text();

    // Log upstream errors for debugging
    if (!backendRes.ok) {
      console.error(`[PROXY ERROR] ${req.method} ${backendPath} -> ${backendRes.status}:`, text);
    }

    res.status(backendRes.status);

    // Try parsing JSON, fallback to raw text
    try {
      res.json(JSON.parse(text));
    } catch {
      res.send(text);
    }
  } catch (error) {
    console.error("[PROXY EXCEPTION]", error);
    res.status(500).json({ error: "Proxy request failed" });
  }
}
