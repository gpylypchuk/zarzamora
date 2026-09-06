import { getCollection, type CollectionEntry } from "astro:content";

export type NavGroup = {
  label: string;
  description: string | null;
  indexSlug: string | null;
  items: CollectionEntry<"notes">[];
};

// El Herbario no es una materia del grimorio, tiene su propia ruta
// (/herbario/) y su propia página. Queda fuera de toda la agrupación
// de navegación por materias.
export const HERBARIO_DIR = "herbario";

export function slugToHref(slug: string): string {
  const cleaned = slug.replace(/(^|\/)index$/, "");
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return cleaned ? `${base}/${cleaned}/` : `${base}/`;
}

// El glob loader de Astro colapsa `materia/index.md` al id `materia`
// (le saca el `/index` final), así que la única forma fiable de saber si
// una entrada es el índice de su carpeta es mirar el nombre del archivo.
function isFolderIndex(entry: CollectionEntry<"notes">): boolean {
  return /(^|\/)index\.mdx?$/.test(entry.filePath ?? "");
}

export async function getNavGroups(): Promise<NavGroup[]> {
  const all = await getCollection("notes");
  const bySubject = new Map<string, NavGroup>();

  for (const entry of all) {
    if (entry.id === "index") continue; // portada
    const parts = entry.id.split("/");
    const subject = parts[0];
    if (subject === HERBARIO_DIR) continue;

    if (!bySubject.has(subject)) {
      bySubject.set(subject, { label: subject, description: null, indexSlug: null, items: [] });
    }
    const group = bySubject.get(subject)!;

    if (parts.length === 1 && isFolderIndex(entry)) {
      group.label = entry.data.title;
      group.description = entry.data.description ?? null;
      group.indexSlug = entry.id;
    } else {
      group.items.push(entry);
    }
  }

  for (const group of bySubject.values()) {
    group.items.sort((a, b) => {
      if (a.data.order !== b.data.order) return a.data.order - b.data.order;
      return a.data.title.localeCompare(b.data.title, "es");
    });
  }

  return Array.from(bySubject.values());
}

export type BackLink = { label: string; href: string };

// Adónde vuelve el link de arriba de una nota individual. Las entradas
// de El Herbario vuelven a /herbario/; las notas de una materia vuelven
// al índice de esa materia; cualquier otra cosa, al índice del grimorio.
export async function getBackLink(id: string): Promise<BackLink> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const parts = id.split("/");

  if (parts[0] === HERBARIO_DIR) {
    return { label: "Volver al índice", href: `${base}/${HERBARIO_DIR}/` };
  }

  if (parts.length >= 2) {
    const all = await getCollection("notes");
    const subjectIndex = all.find((e) => e.id === parts[0] && isFolderIndex(e));
    if (subjectIndex) {
      return {
        label: `Volver a ${subjectIndex.data.title}`,
        href: slugToHref(subjectIndex.id),
      };
    }
  }

  return { label: "Volver al índice", href: `${base}/` };
}
