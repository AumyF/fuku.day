import { defineConfig } from "astro/config";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import tailwindcss from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://fuku.day",
  integrations: [tailwindcss(), svelte(), mdx()],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light-default",
        dark: "github-dark-default",
      },
    },
  },
  vite: {
    css: {
      lightningcss: {
        targets: browserslistToTargets(browserslist("defaults")),
      },
    },
  },
});
