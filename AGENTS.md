# ocean-li-portfolio

Personal portfolio site showing the owner and their engineering projects (CAD, robotics, hackathons). Built with Astro as a static site: no server code, no database. The owner designs the front end in Figma; pages are deliberately unstyled until that design exists.

## Commands

Windows 11, PowerShell. Don't chain with `&&`; use `;` or `; if ($?) { … }`.

- `npm run dev`: local site at http://localhost:4321, drafts visible. To keep it running while you work, use `npx astro dev --background` and manage it with `npx astro dev stop`, `status` and `logs`.
- `npm run build`: production build into `dist/`, drafts hidden.
- `npm test`: unit tests (Vitest).
- `npm run check`: type checks (`astro check`).

Run `npm test`, `npm run check` and `npm run build` before every commit; all three must pass.

## Layout

- `src/content/projects/<slug>/`: one folder per project: `index.md` plus its images.
- `src/content.config.ts`: wires the project folders into Astro.
- `src/lib/projectSchema.ts`: the project fields (tested in `projectSchema.test.ts`). The only place fields are defined. It is strict: unknown or misspelled fields fail the build.
- `src/lib/projects.ts`: rules for URLs, drafts and ordering (tested in `projects.test.ts`).
- `src/lib/getProjects.ts`: `getVisibleProjects()`, the one way pages get their project list.
- `src/pages/`: `index.astro` (project list) and `projects/[slug].astro` (one page per project).
- `src/layouts/Base.astro`: shared page shell.
- `docs/how-it-works.md`: plain-language explainer for the owner.
- `docs/superpowers/specs/`: design decisions and why they were made. Read these before changing how things work.

## Adding a project

1. Copy `src/content/projects/sample-robotic-arm/` to `src/content/projects/<project-name>/`. The folder name becomes the URL (`Robotic Arm` → `/projects/robotic-arm/`).
2. Edit `index.md`, replacing every sample value: the copy carries placeholder `tags`, `featured: true`, a fake `links.repo` and a placeholder `cover.png`. Remove any field the project doesn't have, and delete `cover.png` unless you replace it. Fields:
   - Required: `title`, `summary` (one or two sentences), `date` (full YYYY-MM-DD; a year alone is rejected).
   - Optional: `tags` (list), `cover` (image path relative to the folder, e.g. `./cover.jpg`), `featured` (true lists it first), `draft` (true hides it from the live site), `links` with `repo`, `video`, `writeup` (full URLs).
   - The body below the `---` is the write-up, in Markdown.
3. Put images in the same folder.
4. Set `draft: false` (or remove the line) when it should go live.

The two `sample-*` projects are drafts kept as examples; they never appear on the live site.

## Rules

- No server code, no database, no Astro server adapter; `output` stays `'static'`.
- Pages get projects only through `getVisibleProjects()`; never filter drafts or sort on your own.
- Change project fields only in `src/lib/projectSchema.ts` (with a test), and update the samples and this file to match.
- No styling, fonts or UI libraries until the design phase defines them in `docs/superpowers/specs/`.
- Never commit `.env*` files or secrets.
- Commit messages: imperative subject that says why.

## Docs

Astro documentation: https://docs.astro.build. Content collections: https://docs.astro.build/en/guides/content-collections/
