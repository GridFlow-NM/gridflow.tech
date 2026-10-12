import { defineConfig } from "astro/config";

// `base` is overridden from the CLI by the GitHub Pages workflow while the site
// lives at <org>.github.io/gridflow.tech. Once gridflow.tech points here it is "/".
export default defineConfig({
  site: "https://gridflow.tech",
  trailingSlash: "ignore",
});
