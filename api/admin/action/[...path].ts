import type { VercelRequest, VercelResponse } from "@vercel/node";

const BACKEND_BASE = "https://app.share-rides.com";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { method, body, query } = req;
  const pathParts = query["...path"];

  console.log("[ADMIN ACTION] Method:", method);
  console.log("[ADMIN ACTION] Raw path:", pathParts);
  console.log("[ADMIN ACTION] Body:", body);

  if (!pathParts) {
    return res.status(400).json({ error: "Missing action path" });
  }

  // Normalize path array
  const segments = Array.isArray(pathParts)
    ? pathParts
    : [pathParts];

  const adminPath = `/admin/${segments.join("/")}`;
  const upstreamUrl = `${BACKEND_BASE}${adminPath}`;

  // Only allow mutation methods
  if (!["PATCH", "POST", "PUT", "DELETE"].includes(method || "")) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("[ADMIN ACTION] Forwarding →", upstreamUrl);

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Admin-Id": "vercel_admin",
        "X-Admin-Role": "super_admin",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await upstream.text();

    console.log("[ADMIN ACTION] Upstream status:", upstream.status);
    console.log("[ADMIN ACTION] Raw response:", text);

    res.status(upstream.status);
    res.setHeader("Content-Type", "application/json");

    // Avoid JSON parse crashes
    res.send(text || JSON.stringify({ success: true }));
  } catch (err) {
    console.error("[ADMIN ACTION ERROR]", err);
    res.status(500).json({ error: "Admin action proxy failed" });
  }
}
