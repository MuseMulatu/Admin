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
    // This fixes the mismatch if "super_admin" comes in lowercase
    const finalRole = (incomingRole || "").toUpperCase();

    // 3. DEBUG LOGS (Check these in Vercel if it still fails!)
    console.log("[PROXY DEBUG]");
    console.log("Incoming Role:", incomingRole);
    console.log("Forwarding Role:", finalRole);
    console.log("Forwarding ID:", incomingId);

    const upstream = await fetch(`${BACKEND_BASE}/admin${backendPath}`, {
      method: req.method,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Admin-Id": incomingId || "", 
        "X-Admin-Role": finalRole, // <--- Sending the corrected uppercase role
      },
      // Forward the body
      body: req.body ? JSON.stringify(req.body) : undefined,
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