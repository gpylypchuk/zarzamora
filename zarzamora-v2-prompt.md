# Prompt para Claude Code, Zarzamora v2 (rediseño visual)

Este documento es un prompt completo, pensado para pegarse directo en una sesión de Claude Code sobre el repo `zarzamora` ya existente y desplegado. Da por sentado que la v1 (arquitectura Astro, wikilinks, KaTeX, Pagefind, deploy a GitHub Pages) ya está andando en producción, siguiendo `zarzamora-especificacion.md`. Ese documento sigue rigiendo todo lo que tiene que ver con stack técnico, build y deploy. Este documento lo pisa únicamente en identidad visual, estructura de la home y navegación, que es lo que cambió en esta ronda.

Al final está pegado, íntegro, el archivo HTML de referencia (`zarzamora_v2_concepto.html`) que fue el mockup aprobado. Es la fuente de verdad literal para colores exactos, tipografías, tiempos de animación y textos. Si algo de lo que sigue es ambiguo en un detalle fino, gana lo que dice ese archivo.

## 0. Decisiones ya tomadas, no volver a preguntarlas

- Se elimina el modo claro por completo. Un único aspecto oscuro ("Nightshade Grove") en todo el sitio, sin toggle, sin `data-theme`, sin `prefers-color-scheme`.
- Se elimina la barra lateral persistente. La navegación dentro de una nota queda reducida a un buscador fijo arriba (en todas las páginas) y un link liviano de vuelta. El acordeón grande de materias vive únicamente en la portada.

## 1. Paleta, tokens exactos para `src/styles/global.css`

Reemplazar el `:root` entero (y borrar cualquier bloque `:root[data-theme="dark"]` o `@media (prefers-color-scheme: dark)` que exista) por uno solo:

```css
:root {
  --bg: #0a0d09;
  --bg-elevated: #171220;
  --bg-card: #10160d;
  --border: #241f2b;
  --heading: #b8a8d6;
  --text: #93a08c;
  --text-muted: #565c50;

  --accent: #8452b8;
  --accent-soft: rgba(132, 82, 184, 0.18);
  --accent-glow: rgba(132, 82, 184, 0.55);

  --moss: #4f7a3f;
  --moss-soft: rgba(79, 122, 63, 0.22);

  --gold: #b9a06b;
  --code-bg: var(--bg-elevated);
}
```

Notar que se mantienen los nombres `--accent` y `--moss` que ya usan `SolapeTriangulos.astro` y `PedazosIntegral.astro` (antes eran el magenta/vino y el verde musgo de la v1). Solo cambia el valor, no el nombre, así esos dos componentes no necesitan tocarse y siguen funcionando igual, ahora con la paleta nueva.

`--bg-card` es un token nuevo, un tercer nivel de superficie (las tarjetas del acordeón), distinto de `--bg-elevated` (que ahora es el chrome del buscador).

Agregar al `body` el fondo con degradés radiales y la textura de ruido, tal como está en el mockup (sección de estilos `body` y `body::before` del archivo de referencia), globalmente, para que se vea igual en portada y en cada nota.

## 2. Tipografía

Se cambia la familia tipográfica completa, dejando de lado Fraunces/Lora de la v1. Nueva combinación, ya aprobada en todas las rondas de mockup:

- **Cinzel Decorative**, solo para el `<h1>` de la portada ("Zarzamora") y para los numeritos romanos del acordeón (`I`, `II`, ...). Uso puntual, no para nada más.
- **Cormorant Garamond**, para todos los demás títulos y para el cuerpo de texto, con cursiva para taglines y subtítulos.
- **JetBrains Mono**, sin cambios, para tags, metadata y bloques de código.

Reemplazar el `<link>` de Google Fonts en `BaseLayout.astro` por:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## 3. Modo oscuro único, limpieza de código muerto

- Borrar `src/components/ThemeToggle.astro` y toda referencia a él en `BaseLayout.astro`.
- Borrar el script inline "no-flash" que lee `localStorage` y setea `data-theme` en `<html>`.
- Borrar cualquier uso de `data-theme` en CSS, ya no hace falta ninguna variante.

## 4. Barra de búsqueda arriba, global

Borrar `src/components/Sidebar.astro` por completo (con esto se va también el nav lateral de materias). La lógica de Pagefind que vivía ahí (inyectar `${BASE_URL}pagefind/pagefind-ui.js` e instanciar `PagefindUI`) se traslada a un buscador nuevo, persistente, en la parte superior de `BaseLayout.astro`, visible en portada, en cada nota y en El Herbario.

Markup y estilos, tal cual el mockup (clases `.topbar` y `.search-pill`), con el input conectado al mismo mecanismo de Pagefind que ya funcionaba (mismo comportamiento, otro lugar en el layout).

## 5. Página de nota individual (`src/pages/[...slug].astro`)

- Ya no muestra sidebar. Agregar arriba del contenido un link de vuelta simple, texto tipo `← Volver a {nombre de la materia}` si la nota pertenece a una materia del grimorio, o `← Volver al índice` si es una entrada de El Herbario. Usar los datos que ya arma `src/utils/nav.ts` para saber a qué grupo pertenece cada nota.
- El resto de la nota (tipografía, code blocks, KaTeX, las dos visualizaciones interactivas) hereda los tokens nuevos automáticamente, no necesita reescritura de lógica.

## 6. Portada (`src/pages/index.astro`), la pieza más grande

### 6.1 Hero

Crear `src/components/Hero.astro`, portando casi literal del mockup:

- el campo de luciérnagas (script que genera 14 divs `.firefly` con posición y delay aleatorios),
- el `<h1>{SITE_NAME}</h1>` en Cinzel Decorative con el resplandor (`text-shadow` usando `--accent-glow`),
- el párrafo de tagline (`SITE_TAGLINE`),
- el link `El Herbario` (clase `bitacora-teaser` en el archivo de referencia, se puede renombrar a algo como `herbario-teaser` si se prefiere prolijidad, es cosmético) apuntando a `/herbario/` respetando `import.meta.env.BASE_URL`,
- el SVG de la enredadera con las cuatro gemas que laten (animación `gem-pulse`, alternando violeta y musgo).

Se usa solo en la portada.

### 6.2 Índice del grimorio (acordeón)

Construir la lista de materias con la misma agrupación que ya arma `getNavGroups()` en `src/utils/nav.ts`, **excluyendo explícitamente la carpeta `herbario`** de esa agrupación (El Herbario no es una materia, tiene su propia ruta, ver sección 7). Por cada grupo restante, renderizar una tarjeta `.chapter` con:

- numeral romano calculado por posición (escribir una función `toRoman(n)` simple, no hace falta que soporte números grandes),
- ese numeral **siempre en `var(--accent)`**, sin importar el acento de la materia (esto es a pedido explícito, no debe variar),
- acento alternado por posición, `data-accent="violet"` en las materias de índice par (0, 2, 4...) y `data-accent="green"` en las impares (1, 3, 5...), reusando tal cual las reglas `.chapter[data-accent="green"] { ... }` del archivo de referencia (border, chevron, box-shadow y el intercambio de color de la `berry`),
- la primera materia (índice 0) arranca con la clase `open`, el resto arrancan cerradas,
- adentro, cada nota como `.note-row` (href con `slugToHref(entry.id)`, título, y a la derecha `entry.data.tags?.[0]` si existe),
- el mismo script vanilla de toggle por click (clase `.open`, transición por `grid-template-rows`).

El body markdown de `src/content/notes/index.md` deja de renderizarse en la portada (la reemplaza el Hero). El archivo se conserva solo por su frontmatter, para el fallback de `description` en el SEO.

## 7. El Herbario, sección nueva y separada del grimorio

Es el rincón personal, fuera del temario, para que no quede sepultado a medida que se acumulan materias.

- Las entradas viven en `src/content/notes/herbario/*.md` (o `.mdx`), dentro de la misma colección `notes` que ya existe, sin crear una colección nueva.
- En `src/content.config.ts`, agregar al schema un campo `date: z.coerce.date().optional()`, y confirmar que `order` sea opcional (las entradas de Herbario no lo van a usar, se ordenan por fecha).
- Crear `src/pages/herbario/index.astro`, una página propia (no depende de `getNavGroups`) que trae `getCollection("notes")`, filtra por `entry.id.startsWith("herbario/")`, ordena por `date` descendente, y lista cada una (título + fecha en formato `14 ago 2026`). No necesita comportamiento de acordeón, alcanza con una lista prolija reusando el lenguaje visual de `.note-row`.
- Si todavía no hay ninguna entrada (el caso real hoy), mostrar un estado vacío tranquilo, por ejemplo "Todavía no hay hojas prensadas acá.", en `--text-muted` cursiva, en vez de una lista vacía.
- No hace falta un `herbario/index.md` de contenido, la página `src/pages/herbario/index.astro` puede pasarle `title`/`description` directo a `BaseLayout` a mano.
- Cada entrada individual de Herbario se renderiza con el mismo `[...slug].astro` de siempre, con el link de vuelta apuntando a `/herbario/` en vez de a una materia (ver sección 5).

## 8. Verificación antes de pushear

- `npm run build`, sin errores, Pagefind indexando al final.
- `npm run preview`, revisar a ojo: portada (hero, luciérnagas animadas, gemas de la enredadera latiendo, acordeón abre y cierra, la materia con índice 0 arranca abierta), una nota (buscador arriba funcionando, link de vuelta correcto, las dos visualizaciones de TP1 Ejercicio 13 se ven bien con los colores nuevos), `/herbario/` (estado vacío si no hay entradas todavía).
- Confirmar que no queda ninguna referencia viva a `ThemeToggle`, `data-theme`, ni a `Sidebar.astro`.
- Confirmar que una nota de una materia con índice impar (si en algún momento hay una segunda materia) muestra el acento musgo correctamente.
- `/zarzamora/no-existe/` sigue mostrando el 404 propio, sin tocar.

## 9. Deploy

Sin cambios respecto a la v1, commit y push a `main`, el workflow de GitHub Actions ya configurado hace el resto. No hace falta tocar la configuración de Pages, ya está en "GitHub Actions" desde el despliegue inicial.

## 10. Qué avisar de vuelta

Si aparece algo no cubierto acá (por ejemplo, cómo debería verse exactamente una segunda materia real, o un detalle de espaciado que el mockup no deja claro), parar y preguntar en vez de improvisar una solución distinta.

---

## Apéndice, mockup de referencia completo (fuente de verdad literal)

```html
<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Zarzamora, concepto v2</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    /* Nightshade Grove, bosque brujo nocturno: negro-verde de base, violeta como la magia que emerge */
    --bg: #0a0d09;            /* casi negro, piso de bosque a medianoche */
    --bg-elevated: #171220;   /* negro-berenjena, la cámara de la bruja, chrome del buscador */
    --bg-card: #10160d;       /* negro-musgo, superficie de las tarjetas */
    --border: #241f2b;
    --heading: #b8a8d6;       /* lavanda pálida, brillo de luna sobre la niebla */
    --text: #93a08c;          /* salvia grisácea, cuerpo de texto con tinte de bosque */
    --text-muted: #565c50;

    /* acento principal, magia violeta */
    --purple: #8452b8;        /* amatista nocturna */
    --purple-soft: rgba(132, 82, 184, 0.18);
    --purple-glow: rgba(132, 82, 184, 0.55);

    /* acento secundario, con presencia real, no de fondo nada más */
    --green: #4f7a3f;         /* musgo de bruja */
    --green-soft: rgba(79, 122, 63, 0.22);
    --gold: #b9a06b;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background:
      radial-gradient(ellipse 90% 60% at 50% -10%, rgba(132,82,184,0.16), transparent 60%),
      radial-gradient(ellipse 70% 50% at 90% 110%, rgba(79,122,63,0.30), transparent 60%),
      var(--bg);
    color: var(--text);
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 19px;
    line-height: 1.7;
    min-height: 100vh;
  }
  a { color: var(--purple); }

  body::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    opacity: 0.05;
    mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* ---------- topbar / search ---------- */
  .topbar {
    display: flex;
    justify-content: center;
    padding: 22px 20px 0;
  }
  .search-pill {
    width: 100%;
    max-width: 520px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 10px 20px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .search-pill:focus-within {
    border-color: var(--purple);
    box-shadow: 0 0 0 4px var(--purple-soft);
  }
  .search-pill svg { flex-shrink: 0; color: var(--text-muted); }
  .search-pill input {
    background: none;
    border: none;
    outline: none;
    color: var(--text);
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px;
    font-style: italic;
    width: 100%;
  }
  .search-pill input::placeholder { color: var(--text-muted); }

  /* ---------- hero ---------- */
  .hero {
    position: relative;
    text-align: center;
    padding: 70px 20px 40px;
    overflow: hidden;
  }
  .firefly {
    position: absolute;
    width: 4px; height: 4px;
    border-radius: 50%;
    background: var(--gold);
    box-shadow: 0 0 8px 2px rgba(185,160,107,0.8);
    animation: drift 9s ease-in-out infinite, glow 3s ease-in-out infinite;
    opacity: 0;
  }
  @keyframes drift {
    0% { transform: translate(0,0); }
    50% { transform: translate(var(--dx,20px), var(--dy,-30px)); }
    100% { transform: translate(0,0); }
  }
  @keyframes glow {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }
  .hero h1 {
    font-family: 'Cinzel Decorative', serif;
    font-weight: 700;
    font-size: clamp(2.6rem, 6vw, 4.6rem);
    margin: 0;
    letter-spacing: 0.02em;
    color: var(--heading);
    text-shadow: 0 0 40px var(--purple-glow);
  }
  .hero .tagline {
    font-style: italic;
    color: var(--text-muted);
    font-size: 1.2rem;
    margin-top: 10px;
  }
  .bitacora-teaser {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    margin-top: 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--green);
    text-decoration: none;
    border: 1px solid var(--green-soft);
    padding: 8px 18px;
    border-radius: 999px;
    transition: border-color 0.2s, background 0.2s;
  }
  .bitacora-teaser:hover {
    border-color: var(--green);
    background: var(--green-soft);
  }
  .bitacora-teaser-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 6px 1px var(--green-soft);
    flex-shrink: 0;
  }
  .vine {
    display: block;
    margin: 26px auto 0;
    width: min(420px, 80%);
  }
  .vine-gem {
    transform-origin: center;
    transform-box: fill-box;
    animation: gem-pulse 3.6s ease-in-out infinite;
  }
  .vine-gem.gem-green { filter: drop-shadow(0 0 3px rgba(79,122,63,0.9)); }
  .vine-gem.gem-violet { filter: drop-shadow(0 0 3px rgba(132,82,184,0.9)); }
  @keyframes gem-pulse {
    0%, 100% { opacity: 0.5; transform: scale(0.88); }
    50% { opacity: 1; transform: scale(1.18); }
  }

  /* ---------- grimoire index ---------- */
  .index {
    max-width: 720px;
    margin: 20px auto 100px;
    padding: 0 24px;
  }
  .index-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--green);
    text-align: center;
    margin-bottom: 24px;
  }

  .chapter {
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--bg-card);
    margin-bottom: 16px;
    overflow: hidden;
    transition: border-color 0.25s, box-shadow 0.25s;
  }
  .chapter.open {
    border-color: var(--purple);
    box-shadow: 0 0 0 1px var(--purple-soft), 0 12px 34px rgba(132,82,184,0.22);
  }
  .chapter-head {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    cursor: pointer;
    user-select: none;
  }
  .chapter-num {
    font-family: 'Cinzel Decorative', serif;
    color: var(--purple);
    font-size: 1.3rem;
    width: 34px;
    flex-shrink: 0;
    text-align: center;
  }
  .chapter-titles { flex: 1; }
  .chapter-title {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600;
    font-size: 1.4rem;
    color: var(--heading);
  }
  .chapter-sub {
    font-size: 0.85rem;
    color: var(--text-muted);
    font-style: italic;
    margin-top: 2px;
  }
  .chapter-chevron {
    color: var(--text-muted);
    transition: transform 0.25s;
    flex-shrink: 0;
  }
  .chapter.open .chapter-chevron { transform: rotate(90deg); color: var(--purple); }

  /* segundo acento, materias en la rama musgo en vez de la rama amatista */
  /* el numerito de capítulo queda siempre en violeta, es identidad de índice, no de materia */
  .chapter[data-accent="green"] .note-row .berry { background: var(--purple); }
  .chapter[data-accent="green"].open {
    border-color: var(--green);
    box-shadow: 0 0 0 1px var(--green-soft), 0 12px 34px rgba(79,122,63,0.24);
  }
  .chapter[data-accent="green"].open .chapter-chevron { color: var(--green); }
  .chapter[data-accent="green"] .note-row:hover { background: var(--green-soft); }

  .chapter-body {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.3s ease;
  }
  .chapter.open .chapter-body { grid-template-rows: 1fr; }
  .chapter-body-inner { overflow: hidden; }

  .note-row {
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding: 13px 24px 13px 74px;
    border-top: 1px solid var(--border);
    text-decoration: none;
    color: var(--text);
  }
  .note-row:hover { background: var(--purple-soft); }
  .note-row .berry {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--green);
    flex-shrink: 0;
  }
  .note-row .note-title { font-size: 1.05rem; }
  .note-row .note-tag {
    margin-left: auto;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem;
    color: var(--text-muted);
    letter-spacing: 0.04em;
  }

  .hint {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.82rem;
    font-style: italic;
    margin-top: 30px;
  }
</style>
</head>
<body>

<div class="topbar">
  <div class="search-pill">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    <input type="text" placeholder="Buscar en la espesura…">
  </div>
</div>

<div class="hero">
  <div id="fireflies"></div>
  <h1>Zarzamora</h1>
  <p class="tagline">Notas creciendo en la espesura</p>
  <a class="bitacora-teaser" href="#">
    <span class="bitacora-teaser-dot"></span>
    El Herbario
  </a>
  <svg class="vine" viewBox="0 0 420 40" fill="none">
    <path d="M10 20 Q 60 5, 100 20 T 190 20 Q 230 35, 270 20 T 360 20 Q 390 10, 410 20"
      stroke="url(#vgrad)" stroke-width="2" stroke-linecap="round"/>
    <circle class="vine-gem gem-green" cx="100" cy="20" r="3.5" fill="#4f7a3f" style="animation-delay:0s"/>
    <circle class="vine-gem gem-violet" cx="190" cy="20" r="3" fill="#8452b8" style="animation-delay:0.9s"/>
    <circle class="vine-gem gem-green" cx="270" cy="20" r="3.5" fill="#4f7a3f" style="animation-delay:1.8s"/>
    <circle class="vine-gem gem-violet" cx="360" cy="20" r="3" fill="#8452b8" style="animation-delay:2.7s"/>
    <defs>
      <linearGradient id="vgrad" x1="0" y1="0" x2="420" y2="0">
        <stop offset="0" stop-color="#4f7a3f" stop-opacity="0.18"/>
        <stop offset="0.5" stop-color="#8452b8"/>
        <stop offset="1" stop-color="#4f7a3f" stop-opacity="0.18"/>
      </linearGradient>
    </defs>
  </svg>
</div>

<div class="index">
  <div class="index-label">Índice del grimorio</div>

  <div class="chapter open" data-chapter data-accent="violet">
    <div class="chapter-head" data-toggle>
      <div class="chapter-num">I</div>
      <div class="chapter-titles">
        <div class="chapter-title">Señales y Sistemas</div>
        <div class="chapter-sub">ITBA · 16.68</div>
      </div>
      <svg class="chapter-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 6 6 6-6 6"/></svg>
    </div>
    <div class="chapter-body">
      <div class="chapter-body-inner">
        <a class="note-row" href="#"><span class="berry"></span><span class="note-title">TP1, Ejercicio 13</span><span class="note-tag">guia-tp1</span></a>
      </div>
    </div>
  </div>

  <p class="hint">Tocá un capítulo para desplegarlo. Esto es un concepto de diseño, todavía no está conectado al sitio real.</p>
</div>

<script>
  document.querySelectorAll('[data-toggle]').forEach((head) => {
    head.addEventListener('click', () => {
      const chapter = head.closest('[data-chapter]');
      chapter.classList.toggle('open');
    });
  });

  const field = document.getElementById('fireflies');
  for (let i = 0; i < 14; i++) {
    const f = document.createElement('div');
    f.className = 'firefly';
    f.style.left = Math.random() * 100 + '%';
    f.style.top = Math.random() * 100 + '%';
    f.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
    f.style.setProperty('--dy', (Math.random() * 60 - 30) + 'px');
    f.style.animationDelay = (Math.random() * 6) + 's, ' + (Math.random() * 3) + 's';
    field.appendChild(f);
  }
</script>

</body>
</html>
```
