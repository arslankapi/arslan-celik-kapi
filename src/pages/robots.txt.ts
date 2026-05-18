import type { APIRoute } from "astro";

const FALLBACK_SITE = "https://arslancelikkapi.com";

export const GET: APIRoute = () => {
  const site = (import.meta.env.SITE || FALLBACK_SITE).replace(/\/$/, "");

  const body = `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${site}/sitemap-index.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};

