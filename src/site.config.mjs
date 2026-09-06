// Fuente única de verdad para el path base y la URL del sitio. Se usa
// tanto en astro.config.mjs (campos "site" y "base") como en noteMap.mjs
// (que corre en Node, antes de que exista import.meta.env). Si el día de
// mañana este repo se cuelga en la raíz de un dominio propio en vez de en
// gpylypchuk.github.io/zarzamora, este es el único lugar que hay que tocar
// (junto con el CNAME en public/ si aplica).
export const SITE_URL = "https://gpylypchuk.github.io";
export const BASE_PATH = "/zarzamora";
export const SITE_NAME = "Zarzamora";
export const SITE_TAGLINE = "Notas creciendo en la espesura.";
