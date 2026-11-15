// Rules every page uses for project content: URLs, drafts and ordering.

export type ProjectLike = {
  data: { title: string; date: Date; featured: boolean; draft: boolean };
};

/** Turns a content path like "Robotic Arm/index.md" into the URL slug "robotic-arm". */
export function slugFromEntryPath(entryPath: string): string {
  const folder = entryPath.split('/')[0];
  return folder
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Drafts show while developing and on Vercel preview links, never on the live site. */
export function shouldIncludeDrafts(env: { dev: boolean; vercelEnv?: string }): boolean {
  if (env.dev) return true;
  return env.vercelEnv !== undefined && env.vercelEnv !== 'production';
}

/** Drops drafts (unless asked to keep them), then sorts featured first, newest next, title last. */
export function visibleProjects<T extends ProjectLike>(entries: T[], includeDrafts: boolean): T[] {
  return entries
    .filter((entry) => includeDrafts || !entry.data.draft)
    .sort(
      (a, b) =>
        Number(b.data.featured) - Number(a.data.featured) ||
        b.data.date.getTime() - a.data.date.getTime() ||
        a.data.title.localeCompare(b.data.title),
    );
}
