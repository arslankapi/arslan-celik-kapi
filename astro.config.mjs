import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

const siteUrl = process.env.SITE_URL || process.env.PUBLIC_SITE_URL || "https://arslancelikkapi.com";

export default defineConfig({
  site: siteUrl,
  integrations: [sitemap()],
  adapter: cloudflare({
    imageService: "compile",
  }),
});

