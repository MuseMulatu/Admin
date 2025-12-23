import type { VercelRequest, VercelResponse } from "@vercel/node";

const BACKEND_BASE = "https://app.share-rides.com";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // 1. Path Rewriting
    // Transforms "/api/ai/audit-ride" -> "/ai/audit-ride" (assuming backend has /ai prefix)
    const originalUrl = req.url || "";
    const backendPath = originalUrl.replace(/^\/api\/ai/, "");
    
    // 2. Capture and Normalize Credentials
    // We must forward these so the AI service knows WHO is auditing (for logs)
    const incomingId = req.headers['x-admin-id'] as string;
    const incomingRole = req.headers['x-admin-role'] as string;
    
    // Maintain the UPPERCASE fix from your admin proxy
    const finalRole = (incomingRole || "").toUpperCase();

    // 3. Construct Upstream URL
    const upstreamUrl = `${BACKEND_BASE}/ai${backendPath}`;

    console.log(`[AI PROXY] Proxying to: ${upstreamUrl}`);
    console.log(`[AI PROXY] Context: ${incomingId} | ${finalRole}`);

    // 4. Forward Request
    const upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        // Forwarding Auth Context
        "X-Admin-Id": incomingId || "", 
        "X-Admin-Role": finalRole,
      },
      body: req.body ? JSON.stringify(req.body) : undefined,
    });

    // 5. Handle Response
    const text = await upstream.text();

    if (!upstream.ok) {
       console.error(`[AI PROXY ERROR] Upstream ${upstream.status}:`, text);
    }

    res.status(upstream.status);

    try {
      res.json(JSON.parse(text));
    } catch {
      res.send(text);
    }

  } catch (error) {
    console.error("[VERCEL AI PROXY ERROR]", error);
    res.status(500).json({ error: "AI Service proxy failed" });
  }
}