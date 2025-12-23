import type { VercelRequest, VercelResponse } from "@vercel/node";

const BACKEND_BASE = "https://app.share-rides.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const path = Array.isArray(req.query.path)
      ? req.query.path.join("/")
      : req.query.path;

    const queryIndex = req.url?.indexOf("?");
    const queryString = queryIndex !== -1 ? req.url?.slice(queryIndex) : "";

    const url = `${BACKEND_BASE}/admin/${path}${queryString}`;

    const upstream = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Admin-Id": "vercel_admin",
        "X-Admin-Role": "super_admin"
      },
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : JSON.stringify(req.body)
    });

    const text = await upstream.text();

    res.status(upstream.status);
    res.setHeader("Content-Type", "application/json");
    res.send(text);
  } catch (error) {
    console.error("[ADMIN PROXY ERROR]", error);
    res.status(500).json({ error: "Admin proxy failed" });
  }
}
