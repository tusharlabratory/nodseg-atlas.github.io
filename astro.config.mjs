import { defineConfig } from "astro/config";

// Served as a GitHub project page: https://tusharlabratory.github.io/nodseg-atlas.github.io/
export default defineConfig({
  site: "https://tusharlabratory.github.io",
  base: "/nodseg-atlas.github.io",
  trailingSlash: "ignore",
  build: { format: "directory" },
});
