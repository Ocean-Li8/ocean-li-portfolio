# Portfolio Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A deployable, unstyled Astro skeleton where adding a project means adding one content folder, documented so any AI tool can continue the work, published to GitHub and ready for Vercel.

**Architecture:** Astro static site. Projects are a content collection (`src/content/projects/<slug>/index.md` plus images beside it) validated by a schema. Draft filtering and ordering live in one small tested module (`src/lib/projects.ts`) used by every page. GitHub stores the code; Vercel builds and serves it on every push.

**Tech Stack:** Astro (current stable, static output), TypeScript (Astro `strict` preset), Vitest, npm, Node 24, Git + GitHub CLI, Vercel.

**Spec:** `docs/superpowers/specs/2026-11-15-portfolio-setup-design.md`

## Global Constraints

- Shell is PowerShell on Windows 11: no `&&`; chain with `;` or `; if ($?) { … }`.
- No server code, no database, no Astro server adapter. `output` stays `'static'`.
- `site` in `astro.config.mjs` is `https://ocean-li-portfolio.vercel.app`.
- GitHub repo: `ocean-li-portfolio`, **public**, under the signed-in `gh` account.
- Git identity is set **globally**: email is the account's GitHub no-reply address (`<id>+<login>@users.noreply.github.com`), name is the GitHub display name, or the login if the display name is empty.
- Pages stay unstyled: no CSS, fonts or UI libraries. Visual design is a later, separate phase.
- `AGENTS.md` is the single instruction file; `CLAUDE.md` contains exactly one line: `@AGENTS.md`.
- Drafts appear in `npm run dev` and Vercel preview builds; they never appear in production builds (Vercel production, or a local `npm run build` with no `VERCEL_ENV`).
- Never commit `.env*`, `node_modules/`, `dist/`, `.astro/`, `.vercel/`.
- Commit messages: imperative subject that says why, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Ask the owner before the first push to GitHub (Task 5), even though the spec approves the repo.

## Review Focus

1. **A project folder named with capitals or spaces** (`Robotic Arm/`) should still get a clean URL (`/projects/robotic-arm/`), not `%20` or a 404. Test: `slugFromEntryPath` cases in Task 2.
2. **Every project is a draft (or there are none yet)**: the live home page should show a plain "No projects yet." message, not an error or a blank build. Test: empty-list cases in Task 2; built-page check in Task 3.
3. **A misspelled or missing required field** (e.g. `titel:`) should fail the build with a message naming the file, never ship a page with blank text. Check: broken-file build step in Task 3.
4. **Two projects with the same date** should keep a stable order (by title), so the list doesn't reshuffle between deploys. Test in Task 2.
5. **A project without a cover image** should build fine (the cover is optional until the design phase decides how covers look). Check: one sample has no `cover` in Task 3.

---

### Task 1: Repository and Astro foundation

**Files:**
- Create: `.gitignore`, `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro` (scaffold placeholder, replaced in Task 3), `README.md`
- Keep: `docs/` (already present)

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `preview`, `check` (`astro check`), `test` (`vitest run`). A git repo on branch `main`.

- [ ] **Step 1: Set the global git identity**

```powershell
$u = gh api user | ConvertFrom-Json
$name = if ($u.name) { $u.name } else { $u.login }
git config --global user.name $name
git config --global user.email "$($u.id)+$($u.login)@users.noreply.github.com"
git config --global init.defaultBranch main
```

Verify: `git config --global user.email` ends with `@users.noreply.github.com`.

- [ ] **Step 2: Scaffold Astro**

`create-astro` may refuse a non-empty folder (`docs/` exists). Scaffold into a temp folder and move its contents up:

```powershell
npm create astro@latest .scaffold -- --template minimal --typescript strict --install --no-git --skip-houston --yes
Get-ChildItem .scaffold -Force | Move-Item -Destination . -Force
Remove-Item .scaffold -Recurse -Force
```

- [ ] **Step 3: Configure**

In `astro.config.mjs` set `site: 'https://ocean-li-portfolio.vercel.app'` and `output: 'static'`. Install dev tools: `npm install -D vitest @astrojs/check typescript`. Add scripts `"check": "astro check"` and `"test": "vitest run"`. Ensure `.gitignore` lists `node_modules/`, `dist/`, `.astro/`, `.vercel/`, `.env`, `.env.*`. Replace `README.md` with three lines: what the site is, `npm run dev` to work on it, and "Read `AGENTS.md` and `docs/how-it-works.md`."

- [ ] **Step 4: Verify the build**

Run: `npm run build; if ($?) { npm run check }`
Expected: build completes, `dist/index.html` exists, `astro check` reports 0 errors.

- [ ] **Step 5: Commit**

```powershell
git init
git add -A
git status   # confirm no node_modules/, dist/ or .env files are staged
git commit -m "Scaffold Astro site so the portfolio has a buildable base" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Project rules module (drafts, ordering, URLs)

**Files:**
- Create: `src/lib/projects.ts`
- Test: `src/lib/projects.test.ts`

**Interfaces:**
- Produces (all exported from `src/lib/projects.ts`):
  - `slugFromEntryPath(entryPath: string): string`: `"Robotic Arm/index.md"` → `"robotic-arm"`. Takes the first path segment, lowercases, turns runs of non-alphanumerics into one `-`, trims `-` from the ends.
  - `shouldIncludeDrafts(env: { dev: boolean; vercelEnv?: string }): boolean`: true when `dev`, or when `vercelEnv` is set and is not `'production'`.
  - `type ProjectLike = { data: { title: string; date: Date; featured: boolean; draft: boolean } }`
  - `visibleProjects<T extends ProjectLike>(entries: T[], includeDrafts: boolean): T[]`: drops drafts unless `includeDrafts`, then sorts featured first, then newest `date`, then `title` A→Z. Returns a new array.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { slugFromEntryPath, shouldIncludeDrafts, visibleProjects } from './projects';

const p = (title: string, date: string, featured = false, draft = false) =>
  ({ data: { title, date: new Date(date), featured, draft } });

describe('slugFromEntryPath', () => {
  it('uses the folder name', () => expect(slugFromEntryPath('robotic-arm/index.md')).toBe('robotic-arm'));
  it('cleans capitals and spaces', () => expect(slugFromEntryPath('Robotic Arm/index.md')).toBe('robotic-arm'));
  it('collapses symbols', () => expect(slugFromEntryPath('  Brock -- Hackathon!/index.md')).toBe('brock-hackathon'));
});

describe('shouldIncludeDrafts', () => {
  it('dev shows drafts', () => expect(shouldIncludeDrafts({ dev: true })).toBe(true));
  it('vercel preview shows drafts', () => expect(shouldIncludeDrafts({ dev: false, vercelEnv: 'preview' })).toBe(true));
  it('vercel production hides drafts', () => expect(shouldIncludeDrafts({ dev: false, vercelEnv: 'production' })).toBe(false));
  it('local build hides drafts', () => expect(shouldIncludeDrafts({ dev: false })).toBe(false));
});

describe('visibleProjects', () => {
  it('hides drafts', () => expect(visibleProjects([p('A', '2026-01-01', false, true)], false)).toEqual([]));
  it('keeps drafts when asked', () => expect(visibleProjects([p('A', '2026-01-01', false, true)], true)).toHaveLength(1));
  it('handles an empty list', () => expect(visibleProjects([], false)).toEqual([]));
  it('orders featured, then newest, then title', () => {
    const out = visibleProjects([
      p('Old', '2024-01-01'), p('B', '2026-05-01'), p('A', '2026-05-01'), p('Star', '2023-01-01', true),
    ], false).map((x) => x.data.title);
    expect(out).toEqual(['Star', 'A', 'B', 'Old']);
  });
  it('does not mutate its input', () => {
    const input = [p('Old', '2024-01-01'), p('New', '2026-01-01')];
    visibleProjects(input, false);
    expect(input[0].data.title).toBe('Old');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL, cannot resolve `./projects`.

- [ ] **Step 3: Implement the three functions and the type in `src/lib/projects.ts`**

- [ ] **Step 4: Run to verify it passes**

Run: `npm test; if ($?) { npm run check }`
Expected: all tests pass, 0 check errors.

- [ ] **Step 5: Commit**

`git add src/lib; git commit -m "Add project rules so drafts, order and URLs behave the same on every page"` (plus the Co-Authored-By line).

---

### Task 3: Content collection and skeleton pages

**Files:**
- Create: `src/content.config.ts`, `src/layouts/Base.astro`, `src/pages/projects/[slug].astro`, `src/content/projects/sample-robotic-arm/index.md`, `src/content/projects/sample-robotic-arm/cover.png`, `src/content/projects/sample-hackathon/index.md`
- Modify: `src/pages/index.astro` (replace the scaffold page)

**Interfaces:**
- Consumes: `slugFromEntryPath`, `shouldIncludeDrafts`, `visibleProjects` from Task 2.
- Produces: collection `projects`, entry `id` = folder slug. Schema fields (zod, via `({ image }) => z.object(...)`):
  - `title: z.string().min(1)`, `summary: z.string().min(1)`, `date: z.coerce.date()`
  - `tags: z.array(z.string()).default([])`
  - `cover: image().optional()`
  - `featured: z.boolean().default(false)`, `draft: z.boolean().default(false)`
  - `links: z.object({ repo: z.string().url().optional(), video: z.string().url().optional(), writeup: z.string().url().optional() }).optional()`
  - Loader: `glob({ pattern: '*/index.md', base: './src/content/projects', generateId: ({ entry }) => slugFromEntryPath(entry) })`
- Every page gets its list via `visibleProjects(await getCollection('projects'), shouldIncludeDrafts({ dev: import.meta.env.DEV, vercelEnv: process.env.VERCEL_ENV }))`. Vercel sets `VERCEL_ENV` as a system variable during builds, so read it from `process.env`; if `astro check` reports `Cannot find name 'process'`, add `@types/node` as a dev dependency.
- Spec note: the spec lists `cover` among the starting fields; it is optional here so projects without images still build (Review Focus 5). The design phase can make it required.

- [ ] **Step 1: Write `src/content.config.ts`** with the schema and loader above.

- [ ] **Step 2: Add the two samples**, both `draft: true`, clearly titled "Sample: …" with one paragraph each saying they are placeholders. `sample-robotic-arm` has `featured: true` and `cover: ./cover.png` (any small generated PNG, e.g. a 600×400 solid colour). `sample-hackathon` has no `cover` (Review Focus 5).

- [ ] **Step 3: Write the pages**
  - `Base.astro`: `<html lang="en">`, `<title>` from a `title` prop, `<slot />`. No styles.
  - `index.astro`: an `<h1>` with the site owner's name placeholder `Your Name`, then a `<ul>` of links to `/projects/<id>/` showing `title` and `summary`. When the list is empty, render `<p>No projects yet.</p>` (Review Focus 2).
  - `projects/[slug].astro`: `getStaticPaths` from the same visible list; renders title, date, tags, cover through Astro's `<Image>` when present, links when present, and the Markdown body via `render(entry)`.

- [ ] **Step 4: Verify production hides drafts**

Run: `Remove-Item Env:VERCEL_ENV -ErrorAction SilentlyContinue; npm run build`
Expected: build succeeds; `dist/index.html` contains `No projects yet.`; `dist/projects/` does not exist.

- [ ] **Step 5: Verify preview shows drafts**

Run: `$env:VERCEL_ENV = 'preview'; npm run build; Remove-Item Env:VERCEL_ENV`
Expected: `dist/projects/sample-robotic-arm/index.html` and `dist/projects/sample-hackathon/index.html` exist; `dist/index.html` lists Sample: Robotic Arm first (featured).

- [ ] **Step 6: Verify a bad field fails loudly (Review Focus 3)**

Temporarily rename `title:` to `titel:` in `sample-hackathon/index.md`, run `npm run build`.
Expected: build fails with an error naming `sample-hackathon` and `title`. Revert the change, rebuild, confirm success.

- [ ] **Step 7: Run all checks and commit**

Run: `npm test; if ($?) { npm run check }; if ($?) { npm run build }`, all pass.
Commit: "Add project collection and bare pages so content flows end to end" (plus the Co-Authored-By line).

---

### Task 4: Instructions for AI tools and the owner

**Files:**
- Create: `AGENTS.md`, `CLAUDE.md`, `docs/how-it-works.md`

**Interfaces:**
- Consumes: scripts from Task 1, folder layout and schema from Task 3.

- [ ] **Step 1: Write `AGENTS.md`** with these sections, short and concrete:
  - What this is (personal portfolio for engineering projects; owner designs the front end in Figma).
  - Commands: `npm run dev`, `npm run build`, `npm test`, `npm run check`. PowerShell, no `&&`.
  - Folder layout (one line each: `src/content/projects/`, `src/lib/projects.ts`, `src/pages/`, `src/layouts/`, `docs/`).
  - How to add a project: make `src/content/projects/<slug>/index.md` copying a sample's fields, put images in the same folder, set `draft: false` to publish. List the schema fields and which are required.
  - Rules: no server code or database; pages use `visibleProjects`/`shouldIncludeDrafts`, never their own filtering; don't add styling until the design phase defines it; run tests, check and build before committing; design decisions live in `docs/superpowers/specs/`.
- [ ] **Step 2: Write `CLAUDE.md`** containing exactly `@AGENTS.md`.
- [ ] **Step 3: Write `docs/how-it-works.md`** in plain language for a non-web-developer, one screen long: the laptop → GitHub → Vercel → browser picture; where content lives; what a draft is; what happens on a push (main = live, other branches = preview link); and **"Putting the site live (one-time, your clicks)"**: sign up at vercel.com with "Continue with GitHub", Add New → Project, import `ocean-li-portfolio`, leave the detected Astro settings, Deploy, then note the address Vercel gives (it may differ from `ocean-li-portfolio.vercel.app` if that name is taken; if so, tell the next session so `site` in `astro.config.mjs` gets updated).
- [ ] **Step 4: Verify**: `Get-Content CLAUDE.md` prints exactly `@AGENTS.md`; every command named in `AGENTS.md` runs successfully.
- [ ] **Step 5: Commit**: "Document the project so any AI tool or new session can pick it up" (plus the Co-Authored-By line).

---

### Task 5: Publish to GitHub and hand off to Vercel

**Files:** none changed (except `astro.config.mjs` in Step 4 if the Vercel address differs).

- [ ] **Step 1: Ask the owner** to confirm creating the public repo `ocean-li-portfolio` and pushing. Wait for a yes.
- [ ] **Step 2: Create and push**

Run: `gh repo create ocean-li-portfolio --public --source . --push`
Expected: prints the repo URL; `git status` shows `main` tracking `origin/main`.

- [ ] **Step 3: Hand off**: point the owner to the "Putting the site live" section of `docs/how-it-works.md` and wait for them to report their Vercel address.
- [ ] **Step 4: Verify live**: fetch the reported address; expected: the page contains `No projects yet.` If the address differs from `site`, update `astro.config.mjs`, commit ("Point site URL at the real Vercel address"), push, and confirm a new deployment appears and the page still loads. That push also proves auto-deploy; if no address change is needed, prove it with the owner's go-ahead by pushing the next real commit.
