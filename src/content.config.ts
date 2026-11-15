// One folder per project in src/content/projects/<slug>/, holding index.md and its images.
// Fields are defined in src/lib/projectSchema.ts; a missing, misspelled or unknown
// field fails the build and names the file.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { slugFromEntryPath } from './lib/projects';
import { projectSchema } from './lib/projectSchema';

const projects = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/projects',
    generateId: ({ entry }) => slugFromEntryPath(entry),
  }),
  schema: ({ image }) => projectSchema(image),
});

export const collections = { projects };
