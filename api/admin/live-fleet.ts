import type { VercelRequest, VercelResponse } from "@vercel/node";

const BACKEND_BASE = "https://app.share-rides.com";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const city =
    typeof req.query.city === "string"
      ? req.query.city
      : "Austin, TX";

  const upstreamUrl =
    `${BACKEND_BASE}/admin/live-fleet?city=${encodeURIComponent(city)}`;

  console.log("[LIVE FLEET] →", upstreamUrl);

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        "Accept": "application/json",
        "X-Admin-Id": "vercel_admin",
        "X-Admin-Role": "super_admin",
      },
    });

    const text = await upstream.text();

    console.log("[LIVE FLEET] status:", upstream.status);

    res.status(upstream.status);
    res.setHeader("Content-Type", "application/json");
    res.send(text);
  } catch (error) {
    console.error("[LIVE FLEET ERROR]", error);
    res.status(500).json({ error: "Upstream fetch failed" });
  }
}
