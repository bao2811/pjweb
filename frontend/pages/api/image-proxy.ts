import type { NextApiRequest, NextApiResponse } from "next";

// Simple image proxy. Usage: /api/image-proxy?url=<encodeURIComponent(imageUrl)>
// This fetches the remote image server-side and returns it with appropriate
// content-type and cache headers so you can safely use next/image with your
// own origin.

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.query;

  if (!url || Array.isArray(url)) {
    res.status(400).json({ error: "Missing url query param" });
    return;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(url);
  } catch (e) {
    decoded = url;
  }

  // Basic safety: allow only http/https schemes
  if (!/^https?:\/\//i.test(decoded)) {
    res.status(400).json({ error: "Invalid URL scheme" });
    return;
  }

  try {
    const upstream = await fetch(decoded);
    if (!upstream.ok) {
      res.status(upstream.status).end();
      return;
    }

    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";

    // Set cache for CDN / Vercel / proxies
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=3600"
    );

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.status(200).send(buffer);
  } catch (err) {
    console.error("Image proxy error fetching", decoded, err);
    res.status(500).json({ error: "Failed to fetch remote image" });
  }
}
