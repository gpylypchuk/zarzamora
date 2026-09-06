import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const notes = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/notes" }),
  schema: z.object({
    title: z.string(),
    // Subtítulo corto para la tarjeta de la materia en el acordeón de la
    // portada (ej. "ITBA · 16.68"). Si no está, el componente cae a
    // `description`.
    subtitle: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // Las materias del grimorio usan `order`; las entradas de El Herbario
    // no, se ordenan por `date` descendente. Ambos son opcionales.
    order: z.number().default(0),
    date: z.coerce.date().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { notes };
