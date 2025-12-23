import type { VercelRequest, VercelResponse } from "@vercel/node";

const BACKEND_BASE = "https://app.share-rides.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log("––––––––––––––––––––––––––");
    console.log("[VERCEL PROXY]");
    console.log("Method:", req.method);
    console.log("Original URL:", req.url);
    console.log("Query object:", req.query);

    // 1. Extract and normalize path
    let path = req.query.path;

    let pathArray: string[] = [];

    if (Array.isArray(path)) {
      pathArray = path;
    } else if (typeof path === "string") {
      pathArray = [path];
    }

    console.log("Normalized path array:", pathArray);

    if (!pathArray.length) {
      return res.status(400).json({ error: "Invalid admin path" });
    }

    // 2. Rebuild backend URL (query params preserved automatically)
    const backendPath = `/admin/${pathArray.join("/")}`;
    const backendUrl = `${BACKEND_BASE}${backendPath}`;

    console.log("Forwarding to backend:", backendUrl);

    // 3. Forward request
    const upstream = await fetch(backendUrl, {
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
          : JSON.stringify(req.body),
    });

    const text = await upstream.text();

    console.log("Backend status:", upstream.status);
    console.log("Backend response (raw):", text);

    res.status(upstream.status);

    try {
      res.json(JSON.parse(text));
    } catch {
      res.send(text);
    }
  } catch (err) {
    console.error("[PROXY ERROR]", err);
    res.status(500).json({ error: "Admin proxy failed" });
  }
}
