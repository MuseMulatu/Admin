import type { VercelRequest, VercelResponse } from "@vercel/node";

const BACKEND_BASE = "https://app.share-rides.com";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const originalUrl = req.url || "";
    const backendPath = originalUrl.replace(/^\/api\/admin/, "");

    // 1. Capture credentials safely
    const incomingId = req.headers['x-admin-id'] as string;
    const incomingRole = req.headers['x-admin-role'] as string;

    // 2. FORCE UPPERCASE implementation
    const finalRole = (incomingRole || "").toUpperCase();

    // 3. DEBUG LOGS
    console.log(`[PROXY] ${req.method} ${originalUrl}`);
    console.log("Forwarding ID:", incomingId);
    console.log("Forwarding Role:", finalRole);

    // 4. FIX: STRICTLY FORBID BODY FOR GET/HEAD REQUESTS
    // This resolves "TypeError: Request with GET/HEAD method cannot have body"
    const isReadRequest = req.method === 'GET' || req.method === 'HEAD';
    
    // Only stringify the body if it's NOT a read request AND body exists
    const body = (isReadRequest || !req.body) ? undefined : JSON.stringify(req.body);

    const upstream = await fetch(`${BACKEND_BASE}/admin${backendPath}`, {
      method: req.method,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Admin-Id": incomingId || "", 
        "X-Admin-Role": finalRole,
      },
      // Use the safe body variable we created above
      body: body,
    });

    const text = await upstream.text();
    
    // Log upstream errors for visibility
    if (!upstream.ok) {
       console.error(`Upstream Error ${upstream.status}:`, text);
    }

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