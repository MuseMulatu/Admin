import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const city = req.query.city || "Austin, TX";

  try {
    const upstream = await fetch(
      `https://app.share-rides.com/admin/dashboard/overview?city=${encodeURIComponent(
        String(city)
      )}`,
      {
        headers: {
          "Accept": "application/json",
          "X-Admin-Id": "vercel_admin",
          "X-Admin-Role": "super_admin"
        }
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
