import { defineConfig } from "astro/config";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import tailwindcss from "@tailwindcss/vite";
import svelte from "@astrojs/svelte";
import { satteri } from "@astrojs/markdown-satteri";

import mdx from "@astrojs/mdx";
import createSidenotesPlugin from "./src/lib/rehype-sidenotes.ts";

// https://astro.build/config
export default defineConfig({
  site: "https://fuku.day",
  compressHTML: true,
  integrations: [svelte(), mdx()],
  markdown: {
    processor: satteri({
      hastPlugins: [createSidenotesPlugin()],
    }),
    shikiConfig: {
      themes: {
        light: "github-light-default",
        dark: "github-dark-default",
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
    css: {
      lightningcss: {
        targets: browserslistToTargets(browserslist("defaults")),
      },
    },
  },
});
