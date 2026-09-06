// Se ejecuta en Node al levantar Astro (config o build), NO en el browser.
// Recorre src/content/notes buscando todos los .md/.mdx, lee su frontmatter
// con gray-matter, y arma un mapa "titulo o nombre de archivo en minuscula"
// -> "slug final de la URL". Esto es lo que le permite a remark-wikilinks.mjs
// resolver [[Nombre de nota]] sin que vos tengas que escribir la ruta.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.resolve("src/content/notes");

function walk(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(full));
    } else if (/\.(md|mdx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

export function buildNoteMap(basePath = "") {
  const map = new Map();
  if (!fs.existsSync(CONTENT_DIR)) return map;

  for (const file of walk(CONTENT_DIR)) {
    const raw = fs.readFileSync(file, "utf-8");
    const { data } = matter(raw);
    const relative = path
      .relative(CONTENT_DIR, file)
      .replace(/\.(md|mdx)$/, "")
      .replace(/\/?index$/, "");
    const cleanRelative = relative === "" ? "" : "/" + relative;
    const slug = basePath + cleanRelative + "/";
    const filenameOnly = path.basename(
      path.relative(CONTENT_DIR, file).replace(/\.(md|mdx)$/, "")
    );

    if (data.title) {
      map.set(String(data.title).toLowerCase(), slug);
    }
    map.set(filenameOnly.toLowerCase(), slug);
    if (relative) map.set(relative.toLowerCase(), slug);
  }

  return map;
}
