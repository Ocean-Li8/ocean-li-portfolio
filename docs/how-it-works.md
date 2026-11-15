# How this site works

## The big picture

```
your laptop  -->  GitHub  -->  Vercel  -->  visitor's browser
(edit files)     (stores the   (builds the    (downloads the
                  code and      site on every  finished pages)
                  its history)  push, serves it)
```

There's no server running your code and no database. Vercel turns your files into finished web pages ahead of time, then hands copies of those pages to visitors.

## Where things live

- **Your projects** are folders in `src/content/projects/`. Each one has an `index.md` (the text, plus details like title and date at the top) and its images.
- **The page templates** are in `src/pages/`. Every project folder becomes its own page automatically, using the same template.
- **The rules for AI tools** are in `AGENTS.md`. Claude Code reads it through `CLAUDE.md`; Codex and other tools read it directly.
- **Why things are built this way** is written up in `docs/superpowers/specs/`.

## Drafts

A project with `draft: true` shows up when you run the site on your laptop (`npm run dev`) and on Vercel preview links, but never on the live site. The two `sample-*` projects are drafts, so the live site says "No projects yet." until you publish a real one.

## What happens when you push

- Pushing to the `main` branch updates the live site, usually within a minute.
- Pushing any other branch gives you a private preview link with drafts showing, so you can check things before they go live.
- If something is broken (for example, a typo in a project's details), the build fails and the live site stays as it was.

## Putting the site live (one-time, your clicks)

1. Go to vercel.com and sign up with **Continue with GitHub**.
2. Choose **Add New → Project**, then **Import** next to `ocean-li-portfolio`.
3. Leave the settings Vercel detects (Astro) as they are and click **Deploy**.
4. When it finishes, note the address Vercel shows. If it isn't exactly `ocean-li-portfolio.vercel.app` (the name may be taken), tell the next AI session so it updates `site` in `astro.config.mjs`.

From then on, every push publishes on its own.
