// Plugin remark casero para soportar la sintaxis [[Nota]] y [[Nota|Alias]]
// de Obsidian, resolviendo contra el mapa que arma noteMap.mjs. Si el
// destino no existe, en vez de romper el build lo deja marcado con la
// clase "wikilink-broken" para que se note visualmente y lo puedas arreglar.

import { findAndReplace } from "mdast-util-find-and-replace";

const WIKILINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

export function remarkWikilinks(noteMap) {
  return (tree) => {
    findAndReplace(tree, [
      [
        WIKILINK_RE,
        (_match, target, alias) => {
          const key = target.trim().toLowerCase();
          const href = noteMap.get(key);
          const label = (alias || target).trim();

          if (!href) {
            return {
              type: "html",
              value: `<span class="wikilink-broken" title="No se encontró la nota &quot;${target.trim()}&quot;">${label}</span>`,
            };
          }

          return {
            type: "link",
            url: href,
            children: [{ type: "text", value: label }],
          };
        },
      ],
    ]);
  };
}
