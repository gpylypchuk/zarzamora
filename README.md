# Zarzamora

Notas creciendo en la espesura.

Bosque digital de notas personal, hecho con Astro. Apuntes de facultad organizados por materia, con wikilinks estilo Obsidian, LaTeX y buscador de texto completo. Sin grafo ni panel de backlinks, a propósito.

https://gpylypchuk.github.io/zarzamora/

## Stack

- Astro 7, colecciones de contenido (`astro:content`, loader `glob`)
- Markdown/MDX con `remark-math` + `rehype-katex` para LaTeX
- Wikilinks propios (`[[Nota]]`, `[[Nota|Alias]]`) vía un plugin remark casero
- Pagefind para búsqueda de texto completo
- Deploy automático a GitHub Pages vía GitHub Actions

## Desarrollo

```bash
npm install
npm run dev       # servidor local, sin buscador (Pagefind corre en build)
npm run build     # build de producción + indexado de Pagefind
npm run preview   # sirve dist/ localmente, con buscador funcionando
```

## Escribir una nota

1. Crear `src/content/notes/<materia>/<nota>.md` (o `.mdx` para embeber componentes interactivos).
2. Frontmatter mínimo:

   ```yaml
   ---
   title: Título de la nota
   tags: [tag1, tag2]
   order: 1
   ---
   ```

3. Materia nueva, crear también `src/content/notes/<materia>/index.md` con `title`, `subtitle` (por ejemplo "ITBA · 16.68") y `description`. Aparece sola en el índice de la portada, sin tocar código.
4. Algo fuera del temario, personal, va en `src/content/notes/herbario/`, con `date` en vez de `order`.
5. Para linkear otra nota, `[[Título exacto]]` o `[[Título|texto a mostrar]]`.

## Estructura

```
src/
  content/notes/     Contenido, organizado por carpeta = materia (+ herbario/)
  content.config.ts  Esquema de la colección
  components/        Hero, visualizaciones interactivas
  layouts/           BaseLayout.astro
  pages/             index.astro, herbario/index.astro, [...slug].astro, 404.astro
  styles/            Tokens de color y tipografía
  utils/             nav.ts, remark-wikilinks.mjs, noteMap.mjs
```

## Deploy

Push a `main` dispara `.github/workflows/deploy.yml`, que buildea y publica en GitHub Pages solo.
