# Especificación técnica, Zarzamora

Versión 1.0. Escrita para que Claude Code (ejecutando en la máquina local del usuario, con credenciales de GitHub) la implemente de punta a punta.

## 1. Qué es esto

Zarzamora es el bosque digital de notas personal de Suipaya (Gerónimo Pylypchuk), reemplazo completo del sitio anterior hecho con Quartz ("El Bosque", repo `notas`). Es un sitio estático, publicado en GitHub Pages, cuyo contenido son notas de facultad (empezando por Señales y Sistemas, ITBA) organizadas por materia en carpetas, con soporte de LaTeX, wikilinks estilo Obsidian, y buscador de texto completo. Explícitamente NO tiene grafo de conexiones ni panel de backlinks, esa complejidad se descartó a propósito.

Este documento asume que ya existe una implementación de referencia completa y verificada, entregada junto a este documento como `zarzamora.zip`. Esa implementación ya compiló sin errores, ya se probó visualmente en claro y oscuro, ya se verificó que el buscador indexa y que los wikilinks resuelven. El trabajo de Claude Code NO es reescribir la arquitectura, es tomar ese código, inicializarlo como repositorio propio, crear el repositorio remoto en GitHub, configurar el despliegue, y publicarlo. Alguna extensión de contenido futura (nuevas materias, nuevas notas) sí es trabajo normal de edición sobre esa base.

## 2. Identidad y branding

- Nombre: Zarzamora (sin subtítulo adicional en el `<title>`, la tagline va aparte).
- Tagline: "Notas creciendo en la espesura."
- Identidad visual: bosque nocturno y zarza. Ninguno de los dos modos (claro/oscuro) es blanco puro ni negro puro. El modo claro es una luz de monte encapotado (verde musgo apagado sobre fondo hueso), el modo oscuro es noche cerrada de bosque. El acento de marca en ambos modos es el color de la mora madura (magenta/vino oscuro).
- Tipografía: Fraunces (headings), Lora (cuerpo), JetBrains Mono (código, tags, metadata). Se mantiene la misma familia tipográfica que el sitio anterior a propósito, el cambio de identidad pasa por el color, no por la tipografía.
- Favicon: ícono de mora (círculo oscuro con tres esferas color mora), ya provisto en `public/favicon.svg`.

### Tokens de color exactos

Modo claro (`:root`):

| Token | Valor |
|---|---|
| `--bg` | `#eef0e6` |
| `--bg-elevated` | `#e3e7d8` |
| `--border` | `#cfd6bd` |
| `--text` | `#232922` |
| `--text-muted` | `#5c6b57` |
| `--heading` | `#171c15` |
| `--accent` | `#7c2d5c` |
| `--accent-soft` | `rgba(124, 45, 92, 0.12)` |
| `--moss` | `#3f5a44` |
| `--moss-soft` | `rgba(63, 90, 68, 0.14)` |
| `--code-bg` | `#e2e6d3` |

Modo oscuro (`:root[data-theme="dark"]` y `@media (prefers-color-scheme: dark)`):

| Token | Valor |
|---|---|
| `--bg` | `#0f1210` |
| `--bg-elevated` | `#161c17` |
| `--border` | `#262f27` |
| `--text` | `#d6dcd1` |
| `--text-muted` | `#8a9a89` |
| `--heading` | `#f1ede4` |
| `--accent` | `#c15b93` |
| `--accent-soft` | `rgba(193, 91, 147, 0.14)` |
| `--moss` | `#6b8f71` |
| `--moss-soft` | `rgba(107, 143, 113, 0.16)` |
| `--code-bg` | `#171e18` |

Estos valores ya están cargados en `src/styles/global.css` de la implementación de referencia. Si en algún momento se retocan, este es el documento que hay que actualizar en paralelo.

## 3. Stack técnico y por qué

- **Astro 7**, sitio 100% estático (`output: "static"`), sin servidor.
- **Content collections con loader `glob`** (`astro:content`, `src/content.config.ts`), NO el formato viejo de "content collections" con `src/content/config.ts` y `type: "content"`. Astro 7 lo marca como error de configuración legado (`LegacyContentConfigError`) y falla el build.
- **`entry.render()` no existe** en las entradas de colecciones basadas en loader. Hay que usar la función standalone `render(entry)` importada de `astro:content`.
- **`@astrojs/markdown-remark` debe instalarse explícitamente** como dependencia directa. Astro 7 cambió su procesador de Markdown por defecto (uno nuevo, no basado en `unified`/remark), y usar `markdown.remarkPlugins` / `markdown.rehypePlugins` en `astro.config.mjs` sin ese paquete instalado hace que el build falle pidiéndolo.
- **`@astrojs/mdx`**, para las notas que necesitan embeber componentes interactivos (`.mdx` en vez de `.md`, con imports normales de componentes `.astro` al tope del archivo).
- **`remark-math` + `rehype-katex`**, para `$...$` y `$$...$$` en cualquier `.md`/`.mdx`.
- **Plugin remark casero para wikilinks** (`src/utils/remark-wikilinks.mjs`), resuelve `[[Nota]]` y `[[Nota|Alias]]` contra un mapa construido en `src/utils/noteMap.mjs`, que recorre el filesystem de `src/content/notes` en Node (al momento de cargar `astro.config.mjs`, antes de que exista Vite) usando `gray-matter` para leer el frontmatter de cada archivo. Si el destino no existe, el wikilink se renderiza igual (no rompe el build) con la clase `wikilink-broken`, marcado visualmente con un subrayado punteado.
- **Pagefind**, indexado como paso posterior al build (`npm run build` corre `astro build && pagefind --site dist --output-subdir pagefind`). Pagefind NO funciona en `astro dev`, solo después de un build real. La UI usa el bundle por defecto de Pagefind (`pagefind-ui.js` / `.css`), cargado dinámicamente en runtime vía un `<script>` inyectado desde `Sidebar.astro`, apuntando a `${BASE_URL}pagefind/pagefind-ui.js`. Si el archivo no existe (por ejemplo en dev), el buscador queda vacío sin romper nada.
- **`@astrojs/sitemap`**, sitemap automático (`dist/sitemap-index.xml`), requiere que `site` esté seteado en `astro.config.mjs` (ya lo está).

## 4. Estructura de rutas y navegación

- `src/content/notes/index.md` → home (`/`).
- `src/content/notes/<materia>/index.md` → página de aterrizaje de esa materia (`/<materia>/`). Su frontmatter `title` es lo que aparece como encabezado de grupo en el sidebar y como tarjeta en la home.
- `src/content/notes/<materia>/<nota>.md` o `.mdx` → nota individual (`/<materia>/<nota>/`).
- El sidebar (`src/components/Sidebar.astro`, lógica en `src/utils/nav.ts`) agrupa automáticamente por primer segmento de carpeta, no hace falta mantener un índice de navegación a mano en ningún lado.
- `trailingSlash: "always"` está seteado en `astro.config.mjs`, todas las URLs internas terminan en `/`.
- El `base` del sitio es `/zarzamora` (constante `BASE_PATH` en `src/site.config.mjs`). Cualquier link interno escrito a mano en un componente Astro debe construirse con `import.meta.env.BASE_URL`, Astro NO reescribe automáticamente hrefs manuales.

## 5. Convención de contenido (para notas futuras)

Frontmatter de cada nota:

```yaml
---
title: Título de la nota
tags: [tag1, tag2]
order: 1
description: (opcional, para SEO/OG, si no está usa la tagline del sitio)
---
```

Para agregar una materia nueva: crear la carpeta `src/content/notes/<materia>/` con su `index.md` (título + descripción breve), y ahí adentro los archivos de notas. Eso solo ya la hace aparecer en el sidebar y en la home, sin tocar código.

## 6. SEO, OG y metadata

Ya implementado en `src/layouts/BaseLayout.astro`:

- `<title>` con patrón `{título de la página} · Zarzamora` (o solo `Zarzamora` en la home).
- `<meta name="description">`, usando `description` del frontmatter de la nota o la tagline del sitio como fallback.
- `<link rel="canonical">`, calculado con `Astro.site` + `Astro.url.pathname`.
- Open Graph completo (`og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`) y Twitter card (`summary_large_image`).
- `og:image` apunta a `public/og-image.png` (1200x630, ya generada con la identidad visual definitiva, un solo diseño genérico para todo el sitio, no por-página).
- `public/robots.txt` ya incluye la línea `Sitemap` apuntando a `https://gpylypchuk.github.io/zarzamora/sitemap-index.xml`.
- `src/pages/404.astro` ya escrito con la misma identidad visual del resto del sitio.

## 7. Repositorio y despliegue, lo que Claude Code tiene que ejecutar

Esta es la parte operativa, el resto del documento es contexto para que las decisiones de contenido futuras sean consistentes.

1. Extraer `zarzamora.zip` en un directorio de trabajo (contenido de referencia ya armado y verificado, ver sección 1).
2. Verificar el entorno local, `node -v` (Astro 7 requiere Node 18.20.8+, 20.3.0+, o 22.0.0+), `npm -v`.
3. `npm install` dentro del directorio del proyecto.
4. `npm run build`, confirmar que termina sin errores y que corre el paso de Pagefind al final (el output de la consola debe mostrar "Indexed N pages" de Pagefind después del build de Astro).
5. `npm run preview`, abrir el sitio localmente y verificar a ojo, modo claro y oscuro (el toggle está arriba a la derecha), que las dos visualizaciones interactivas de la nota de Ejercicio 13 respondan al slider, que el buscador de la barra lateral encuentre contenido real (probar buscar alguna palabra que aparezca en la nota), y que una URL inexistente (por ejemplo `/zarzamora/no-existe/`) muestre la página 404 propia y no la genérica de Astro.
6. Inicializar git (`git init`, rama `main`), commit inicial con todo el contenido del zip.
7. Crear el repositorio en GitHub bajo la cuenta `gpylypchuk`, nombre `zarzamora`, público (necesario para GitHub Pages gratis en cuentas sin plan pago), sin inicializarlo con README/gitignore propios (ya vienen en el proyecto).
8. Conectar el remoto y pushear `main`.
9. En la configuración del repositorio en GitHub (Settings → Pages), setear la fuente de Pages a "GitHub Actions" (no "Deploy from a branch"). El workflow ya provisto en `.github/workflows/deploy.yml` se encarga de todo el resto (build, indexado de Pagefind, publicación) en cada push a `main`.
10. Confirmar que el workflow corrió exitosamente (pestaña Actions del repo) y que el sitio responde en `https://gpylypchuk.github.io/zarzamora/`.
11. Reportar de vuelta el resultado, incluyendo cualquier warning o paso que haya requerido intervención manual no prevista acá.

## 8. Fuera de alcance para esta v1 (explícitamente descartado, no implementar sin que se pida)

- Grafo de conexiones entre notas y panel de backlinks.
- Sincronización automática con un vault de Obsidian, el flujo de escritura es directo sobre los archivos del repo.
- Imágenes OG específicas por nota (se usa una sola imagen genérica para todo el sitio).
- Dominio propio (se publica bajo `gpylypchuk.github.io/zarzamora`, subpath de un GitHub Pages ya existente).

## 9. Qué avisar de vuelta

Si en el camino aparece cualquier decisión no cubierta acá (por ejemplo, un conflicto de nombre de repositorio, un límite de la cuenta de GitHub, o un error de build no descripto en la sección 3), Claude Code debe parar y reportarlo en vez de improvisar una solución distinta a lo especificado, dado que este sitio reemplaza por completo al anterior y no hay margen para un despliegue a medias.
