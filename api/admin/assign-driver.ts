import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { rideId, payload } = req.body;

  if (!rideId || !payload) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const upstream = await fetch(
      `https://app.share-rides.com/admin/rides/${rideId}/assign`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Id": "vercel_admin",
          "X-Admin-Role": "super_admin"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await upstream.text();

    res.status(upstream.status);
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: "Upstream fetch failed" });
  }
}
