// The one place pages get their project list from, so drafts and ordering
// are decided the same way everywhere.
import { getCollection } from 'astro:content';
import { shouldIncludeDrafts, visibleProjects } from './projects';

export async function getVisibleProjects() {
  const includeDrafts = shouldIncludeDrafts({
    dev: import.meta.env.DEV,
    // Vercel sets VERCEL_ENV during its builds: "production" or "preview".
    vercelEnv: process.env.VERCEL_ENV,
  });
  return visibleProjects(await getCollection('projects'), includeDrafts);
}
