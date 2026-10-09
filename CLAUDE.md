# Teaching That Lands: notes for AI assistants

## Derived files: keep them in step

- **One-day decks** (`site/public/slides/ttl-one-day-*.pptx`) are built from the three session decks (`ttl-day{1,2,3}-*.pptx`) by `tools/one_day_decks.py`. Never edit them by hand.
  - Changed a session deck? Run `just one-day-decks`, and commit the rebuilt decks with it.
  - Changed slide wording the script looks for (titles, "last week", the canvas labels)? The build stops and names the slide: update `DECKS` in the script.
  - Changed a session's running order, or the one-day timetable? Check `site/src/content/facilitator/one-day.md` still matches the blueprints it borrows from (it cites their section times).
  - CI runs `just one-day-decks --check` before deploying, and fails if any one-day deck is stale.

- **Stats** (`/stats`) draws from `site/public/stats.json`, written by `tools/goatcounter_stats.py` from the GoatCounter API (repo secret `GOATCOUNTER_TOKEN`). CI refreshes it before each build, daily on a schedule. The file is gitignored: never commit it. No token or an API outage never fails the build; the page shows the last published numbers or says they're unavailable. Locally: `just stats`.

- **Teaching Design Check PDF** (`site/public/handouts/design-check.pdf`) is printed from `tools/design-check/design-check.html` by `just design-check-pdf`. Its wording is a shortened copy of `site/src/content/facilitator/design-check.md`: change one, change the other, then reprint. If the PDF is ever laid out by hand, that becomes the master: delete the HTML source and the recipe.

## House rules

- **The person's hand-edited decks and printables are the masters.** Fold changes into them; never regenerate over them.
- **Paper first in the room.** A laptop/PowerPoint route is the optional extra for people who are comfortable with it.
- **Tool slides show only the prompt.** No QR codes or personal Menti/Kahoot codes in published decks; how to run each tool goes in the speaker notes.
- **Never publish anything that identifies a real organisation, person or figure** (the in-room bad slide, pilot details).
- Content and copy are CC BY 4.0; cite image licences on a credits slide or page.
