# Teaching That Lands: notes for AI assistants

## Derived files: keep them in step

- **One-day decks** (`site/public/slides/ttl-one-day-*.pptx`) are built from the three session decks (`ttl-day{1,2,3}-*.pptx`) by `tools/one_day_decks.py`. Never edit them by hand.
  - Changed a session deck? Run `just one-day-decks`, and commit the rebuilt decks with it.
  - Changed slide wording the script looks for (titles, "last week", the canvas labels)? The build stops and names the slide: update `DECKS` in the script.
  - Changed a session's running order, or the one-day timetable? Check `site/src/content/facilitator/one-day.md` still matches the blueprints it borrows from (it cites their section times).
  - CI runs `just one-day-decks --check` before deploying, and fails if any one-day deck is stale.

- **Stats** (`/stats`) draws from `site/public/stats.json`, written by `tools/goatcounter_stats.py` from the GoatCounter API (repo secret `GOATCOUNTER_TOKEN`). CI refreshes it before each build, daily on a schedule. The file is gitignored: never commit it. No token or an API outage never fails the build; the page shows the last published numbers or says they're unavailable. Locally: `just stats`.

- **Teaching Design Check PDF** (`site/public/handouts/design-check.pdf`) is printed from `tools/design-check/design-check.html` by `just design-check-pdf`. Its wording is a shortened copy of `site/src/content/facilitator/design-check.md`: change one, change the other, then reprint. If the PDF is ever laid out by hand, that becomes the master: delete the HTML source and the recipe.

- **Redesign Worksheet PDF** (`site/public/handouts/redesign-worksheet.pdf`) is printed from `tools/redesign-worksheet/redesign-worksheet.html` by `just redesign-worksheet-pdf`. Same rule: if it's ever laid out by hand, that becomes the master.

- **The other printable PDFs** in `site/public/handouts/` are exported from PowerPoint masters in `tools/printables/` (same name, `.pptx`) with File → Export → PDF. Change the `.pptx`, then re-export; don't edit a PDF on its own, or the master falls behind.
  - Exception: `blorps-and-fizzwicks.pptx` is behind its PDFs. The 10 Oct fixes (fold line a third of the way in, "Keep going until time's up.", one retest slip per person, answers split into `blorps-and-fizzwicks-facilitator.pdf`) were made to the PDFs only. Fold them into the `.pptx` before its next export.

- **Site search** (`/search`) is Pagefind. `npm run build` runs `astro build && pagefind --site dist`, which writes the index to `dist/pagefind/`: nothing to commit. It indexes each page's `.page-content` only; pass `searchable={false}` to `Base` to leave a page out (404, stats, search), and add `data-pagefind-ignore` to leave out a part (breadcrumbs). Search doesn't work under `astro dev`: use `just preview`.

## Dependencies

- **`site/.npmrc` is supply-chain safety: keep it.** Dependencies' install scripts never run, and npm 11+ won't install a release under 7 days old. Override only for an urgent fix (`--min-release-age=0`), and say why. Anything that must run after `astro build` goes in the `build` script itself (as Pagefind does): `ignore-scripts` also skips `prebuild`/`postbuild` hooks.
- CI installs with `npm ci` (exactly the lockfile) and runs the deck tool `--locked`. Changed the tool's dependencies? Run `uv lock --script tools/one_day_decks.py`.
- Two settings in `astro.config.mjs` keep the output as written: `compressHTML: true` (Astro 7's default runs words together around inline tags) and the `unified()` Markdown processor (the download-card plugin needs it). Don't drop either without comparing the built pages.

## House rules

- **The person's hand-edited decks and printables are the masters.** Fold changes into them; never regenerate over them.
- **Paper first in the room.** A laptop/PowerPoint route is the optional extra for people who are comfortable with it.
- **Tool slides show only the prompt.** No QR codes or personal Menti/Kahoot codes in published decks; how to run each tool goes in the speaker notes.
- **Never publish anything that identifies a real organisation, person or figure** (the in-room bad slide, pilot details).
- Content and copy are CC BY 4.0; cite image licences on a credits slide or page.
