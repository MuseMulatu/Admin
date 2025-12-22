import type { VercelRequest, VercelResponse } from "@vercel/node";

const BACKEND_BASE = "https://app.share-rides.com";

export async function proxyRequest(
  req: VercelRequest,
  res: VercelResponse,
  backendPath: string
) {
  try {
    const url = `${BACKEND_BASE}${backendPath}`;

    const backendRes = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        // 🔐 inject trusted admin identity here
        "X-Admin-Id": req.headers["x-admin-id"] as string || "muse_mulatu",
        "X-Admin-Role": req.headers["x-admin-role"] as string || "ADMIN",
      },
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : JSON.stringify(req.body),
    });

    const text = await backendRes.text();

    res.status(backendRes.status);

    try {
      res.json(JSON.parse(text));
    } catch {
      res.send(text);
    }
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy request failed" });
  }
}
