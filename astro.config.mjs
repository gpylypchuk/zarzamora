import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { remarkWikilinks } from "./src/utils/remark-wikilinks.mjs";
import { buildNoteMap } from "./src/utils/noteMap.mjs";
import { SITE_URL, BASE_PATH } from "./src/site.config.mjs";

// El mapa de wikilinks se arma una sola vez, leyendo el filesystem,
// cuando Astro carga esta config (antes de procesar cualquier nota).
// Los slugs que devuelve ya vienen con el base path incluido.
const noteMap = buildNoteMap(BASE_PATH);

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: "always",
  markdown: {
    remarkPlugins: [remarkMath, [remarkWikilinks, noteMap]],
    rehypePlugins: [rehypeKatex],
  },
  integrations: [mdx(), sitemap()],
});
