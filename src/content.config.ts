// One folder per project in src/content/projects/<slug>/, holding index.md and its images.
// The schema below is the single place project fields are defined; a missing or
// misspelled required field fails the build and names the file.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { slugFromEntryPath } from './lib/projects';

const projects = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/projects',
    generateId: ({ entry }) => slugFromEntryPath(entry),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      summary: z.string().min(1),
      date: z.coerce.date(),
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
        .optional(),
    }),
});

export const collections = { projects };
