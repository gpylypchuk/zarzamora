import { getCollection, type CollectionEntry } from "astro:content";

export type NavGroup = {
  label: string;
  indexSlug: string | null;
  items: CollectionEntry<"notes">[];
};

export function slugToHref(slug: string): string {
  const cleaned = slug.replace(/(^|\/)index$/, "");
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return cleaned ? `${base}/${cleaned}/` : `${base}/`;
}

export async function getNavGroups(): Promise<NavGroup[]> {
  const all = await getCollection("notes");
  const bySubject = new Map<string, NavGroup>();

  for (const entry of all) {
    if (entry.id === "index") continue;
    const parts = entry.id.split("/");
    const subject = parts[0];

    if (!bySubject.has(subject)) {
      bySubject.set(subject, { label: subject, indexSlug: null, items: [] });
    }
    const group = bySubject.get(subject)!;

    if (parts.length === 2 && parts[1] === "index") {
      group.label = entry.data.title;
      group.indexSlug = entry.id;
    } else if (parts.length === 1) {
      // nota suelta directamente en la raíz de una "materia" sin index propio
      group.items.push(entry);
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
