// The fields a project's index.md may have. Strict: an unknown or misspelled
// field (e.g. "Draft:" or "titel:") fails the build instead of being ignored.
import { z } from 'astro/zod';

export function projectSchema<I extends z.ZodType>(image: () => I) {
  return z
    .object({
      title: z.string().min(1),
      summary: z.string().min(1),
      // YAML turns 2026-10-01 into a Date and "2026-10-01" into a string; a bare
      // number like 2026 would otherwise become a 1970 timestamp, so it is rejected.
      date: z.union([z.date(), z.string()]).pipe(z.coerce.date()),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      links: z
        .object({
          repo: z.url().optional(),
          video: z.url().optional(),
          writeup: z.url().optional(),
        })
        .strict()
        .optional(),
    })
    .strict();
}
