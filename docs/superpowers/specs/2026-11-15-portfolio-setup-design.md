# Portfolio site: project setup and architecture

Date: 2026-11-15
Status: draft, awaiting approval

## Intent

A personal portfolio site that presents the owner and their engineering projects
(CAD, robotics, hackathon work). The owner wants to drive the front-end design
themselves in Figma, so this document covers only the foundation underneath it:
how the site is built, where content lives, how it goes live, and how work
continues across many AI coding sessions and tools.

The owner wants to understand the basics of how their site works (where it is
stored, how it is deployed), not every technical detail. The setup should be
simple enough to explain in a page.

## Goals

- A working, deployable skeleton that the front-end design can be built on.
- Adding a new project means adding one content file (plus its images), with no
  code changes.
- Any AI coding tool (Claude Code, Codex, others) opened in the project folder
  can pick up the work: conventions, commands and decisions are written down in
  the repo.
- Every push to GitHub publishes the site automatically.
- A short plain-language explainer of how the site works, kept in the repo.

## Non-goals (for now)

- Visual design, page layouts, typography, colours. These come from a separate
  design phase in Figma; the skeleton stays deliberately unstyled.
- 3D CAD model viewer. Planned for later; see "Room to grow".
- Contact form, blog, analytics, CMS or admin page.
- Custom domain (the free Vercel address is fine to start).

## Anti-goals

- No server code and no database. Nothing that needs to be kept running or paid
  for beyond free tiers.
- Nothing that ties the project to one AI tool or one editor.
- No setup so layered that the owner cannot follow how it fits together.
- No starter theme or template look; the design is the owner's.

## Constraints

- Windows 11, PowerShell. Node v24, npm 11, git 2.56 and GitHub CLI are
  installed; the GitHub CLI is signed in. Git has no global user name set yet
  (see "Accounts and repo").
- Hosting must be free for a personal site.
- Project folder: `C:\Users\ocean\Claude Code Projects\portfolio`.

## Approaches considered

| Approach | Trade-off | Outcome |
|---|---|---|
| **Astro on Vercel** | Built for content sites; turns content files into finished pages at build time, fast by default, interactive pieces only where added. Fewer concepts to learn. | **Chosen.** Fits a read-mostly site, the one-file-per-project model, and the "understand it all" goal. |
| Next.js on Vercel | Industry-standard React app framework, strong on a web-dev résumé, but brings app machinery (server/client components, routing rules) a portfolio does not need. | Rejected: more to learn for no benefit here; owner is not aiming at web-dev jobs. |
| Plain HTML/CSS/JS on GitHub Pages | Fewest moving parts, but no templates: every project page is hand-copied and layout changes touch every page. | Rejected: breaks "add a project = add a file". |

## How it works (decided)

```
your laptop  -->  GitHub repo  -->  Vercel  -->  visitor's browser
(edit files)     (stores code     (builds the     (downloads finished
                  + history)       site on every   pages)
                                   push, serves it)
```

- **Framework:** Astro, static output (every page is built ahead of time).
  TypeScript in Astro's default strict setting. npm as package manager.
- **Storage:** all code and content in one Git repository on GitHub.
- **Content:** Astro content collection `projects`. One Markdown file per
  project in `src/content/projects/`, its images next to it. Fields in the
  file's header are checked against a schema, so a missing or misspelled field
  fails the build instead of shipping a broken page.
- **Pages (skeleton only):**
  - `/` lists projects.
  - `/projects/<slug>/` is one page per project, generated from its file.
  These exist so the pipeline can be seen working end to end; their look and
  any further pages (about, résumé, contact) come from the design phase.
- **Deployment:** the GitHub repo is connected to Vercel. Pushes to `main`
  update the live site; other branches get their own preview link.
- **Instructions for AI tools:** `AGENTS.md` at the repo root is the single
  source (what the project is, commands, folder layout, how to add a project,
  rules). `CLAUDE.md` contains only `@AGENTS.md`, which makes Claude Code load
  the same file, so the two can never drift apart.
- **Docs:** `docs/how-it-works.md` is the plain-language explainer for the
  owner. Design documents live in `docs/superpowers/specs/`.

### Starting fields for a project file

`title`, `summary` (one or two sentences), `date`, `tags`, `cover` (image),
`featured` (yes/no), `draft` (yes/no, default no), optional `links` (repo,
video, write-up). Drafts show in local and preview builds but are left out of
the live site, so the sample files and half-finished projects never go public
(builder's call, made during review). The body is free
Markdown. The design phase may add or rename fields; the schema is the one
place to change them.

## Accounts and repo (decided)

- **GitHub repo:** `ocean-li-portfolio`, **public**, under the owner's
  signed-in GitHub account. Its name gives the free address
  `ocean-li-portfolio.vercel.app`.
- **Git identity:** the owner's GitHub private no-reply email, so no real email
  appears in the public history. Name: the owner's GitHub display name (or
  username if none). Set globally, since no identity exists on this machine
  and every future repo needs one (builder's call, made during review).
- **Vercel:** the owner has no account yet. Signing up (with GitHub) and
  importing the repo are the owner's clicks. The build ends with a short
  step-by-step for those clicks in `docs/how-it-works.md`; once the owner has
  done them, the builder checks the live address and that a push updates it.

## Room to grow

- **3D CAD viewer:** a later addition. Each project would gain an optional 3D
  model file exported from CAD, shown by an in-browser viewer component on that
  project's page. Runs entirely in the visitor's browser; no backend change.
- **Custom domain:** can be added in Vercel at any time without changing code.

## Left to the builder

- Exact Astro version (current stable) and minor config.
- Exact wording and structure of `AGENTS.md` and `docs/how-it-works.md`,
  within the content listed above.
- One or two clearly marked sample project files so the pipeline is visible
  before real content exists.
