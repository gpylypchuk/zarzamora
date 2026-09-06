# Zarzamora

Notas creciendo en la espesura. Bosque digital de notas de Suipaya, hecho con Astro.

## Stack

- [Astro](https://astro.build) 7, contenido como colecciones (`astro:content`, loader `glob`).
- Markdown/MDX con `remark-math` + `rehype-katex` para LaTeX, y un plugin propio (`src/utils/remark-wikilinks.mjs`) para wikilinks estilo Obsidian `[[Nota]]` / `[[Nota|Alias]]`.
- [Pagefind](https://pagefind.app) para búsqueda de texto completo (se indexa en `npm run build`, no funciona en `npm run dev`).
- Sin grafo ni panel de backlinks a propósito, la navegación es por carpetas (una carpeta por materia).

## Desarrollo

```bash
npm install
npm run dev       # servidor local, sin buscador (pagefind corre solo en build)
npm run build     # build de producción + indexado de pagefind
npm run preview   # sirve el build de dist/ localmente, con buscador funcionando
```

## Escribir una nota nueva

1. Crear el archivo en `src/content/notes/<materia>/<nombre-de-nota>.md` (o `.mdx` si la nota necesita embeber un componente interactivo).
2. Frontmatter mínimo:

   ```yaml
   ---
   title: Título de la nota
   tags: [tag1, tag2]
   order: 1
   ---
   ```

3. Si la materia es nueva, crear también `src/content/notes/<materia>/index.md` con su propio `title` y `description`, eso es lo que la convierte en un grupo del menú lateral y en una tarjeta de la home.
4. Para linkear a otra nota, usar `[[Título exacto de la nota]]` o `[[Título|texto a mostrar]]`.

## Estructura

```
src/
  content/notes/          Todo el contenido, organizado por carpeta = materia
  content.config.ts       Definición de la colección "notes" y su schema
  components/             Componentes de UI y visualizaciones interactivas
  layouts/BaseLayout.astro
  pages/                  index.astro (home), [...slug].astro (notas), 404.astro
  styles/global.css       Sistema de diseño (tokens de color, tipografía)
  utils/                  nav.ts, remark-wikilinks.mjs, noteMap.mjs
  site.config.mjs         Nombre del sitio, tagline, URL base
```

## Deploy

Push a `main` dispara `.github/workflows/deploy.yml`, que buildea y publica en GitHub Pages automáticamente. No hace falta ningún paso manual.
