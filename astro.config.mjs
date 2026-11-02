import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// `base` is overridden from the CLI by the GitHub Pages workflow while the site
// lives at <org>.github.io/gridflow.tech. Once gridflow.tech points here it is "/".
export default defineConfig({
  site: "https://gridflow.tech",
  trailingSlash: "ignore",
  integrations: [sitemap({ filter: (page) => !page.includes("/blog/") })],
  // Old WordPress addresses that may still be linked or bookmarked.
  redirects: {
    "/blog/wpautoterms/privacy-policy": "/privacy/",
    "/blog/wpautoterms/terms-and-conditions": "/privacy/",
    "/home": "/",
  },
});
