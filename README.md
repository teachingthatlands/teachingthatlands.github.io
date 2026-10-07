# Teaching That Lands

A free, openly licensed CPD programme for anyone in health and care who teaches, or would like to. No teaching experience needed.

**Licence:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Copy it, adapt it, share it, with attribution.

## What it is

Three 90-minute sessions, one week apart, for groups of about 8–12. The spine is one question: *start with the change, not the event.* What do we need people to do differently, and how will our teaching make that happen?

Each participant brings one session they teach, or would like to teach, and rebuilds it across the three weeks on a six-box design canvas: learners and context, need, outcomes, evidence, activities, follow-through.

| Session | In one line |
|---|---|
| 1. **Death by PowerPoint?** | Feel cognitive overload, then redesign your own slides using cognitive load and dual coding. |
| 2. **Active Beats Passive** | Experience retrieval and spacing, then make ten minutes of your session active. |
| 3. **Did It Land?** | Write observable outcomes, match them to evidence, and plan the follow-up. |

**By the end of the three sessions, participants will be able to:**

1. **Redesign** a slide from their own teaching so it's clear and easy to read from the back of the room.
2. **Make** ten minutes of their session active, using a technique or tool that suits where they teach.
3. **Say** what they want learners to be able to do by the end of their session, in a way they could watch or check, and work out how they'll check it.
4. **Line up** what learners do in their session and how they check it, so both aim at the change they want to see at work.
5. **Plan** what happens after their session: what they'll look at again after 30, 60 and 90 days, who will keep them on track, and what help they need from that person.

These are written for this content. Commissioners can adapt them to their learners (see the Briefing for Decision-Makers), and the programme can potentially sit inside an accredited work-based learning module, depending on setup. Each session's outcomes are on its page and in its facilitator blueprint.

Ideas the sessions use: cognitive load, dual coding, constructive alignment, implementation intentions, retrieval and spaced practice, interleaving, experiential learning, the Kirkpatrick model and Miller's pyramid. Each has a page in the site's theory library.

The programme is new. It was redesigned after a small pilot in 2026 and has no outcome data yet.

## Who it's for

- **Participants:** clinicians and other health and care staff who teach colleagues, students or patients.
- **Facilitators:** anyone running a cohort. The facilitator hub has session guides, a technical brief, an evaluation toolkit and train-the-trainer notes.
- **Organisers and decision-makers:** the briefing, setup checklist and "Before You Plan a Teaching Day" pages.

## Where things live

```
site/                     Astro website
  src/content/
    sessions/             Participant-facing session pages
    facilitator/          Session guides, setup pages, evaluation toolkit
    theories/             Theory library
    papers/               Summaries of key papers
  public/slides/          Downloadable files (slide decks, PDFs)
  plugins/                Build plugins (download cards)
tools/one_day_decks.py    Builds the one-day decks from the session decks (`just one-day-decks`)
CLAUDE.md                 Notes for AI assistants: derived files, house rules
.github/workflows/        GitHub Pages deploy
Justfile                  Shortcuts (just dev, just build)
LICENCE.md                CC BY 4.0
```

## Running the site locally

Requires Node 22.12 or later.

```bash
cd site
npm install
npm run dev
```

The dev server runs at `http://localhost:4321`. `npm run build` writes the static site to `site/dist/`. If you have [just](https://github.com/casey/just), `just dev` and `just build` do the same from the repo root.

## Adding downloads and slide decks

Put the file in `site/public/slides/` or `site/public/handouts/`, then add a link to any Markdown page:

```html
<a class="file-download" href="/handouts/your-file.pdf">The handout (A4)</a>
```

At build time it becomes a download card: icon, label, file name, type and size (and pages, for a PDF), with a **Download** button. A link to a file that isn't there stops the build, so a broken download never goes live.

PDFs, PowerPoint decks and images also get a **Preview** button, which opens the file under the card without downloading it:

- **PDF:** the browser's own PDF viewer. Where a browser can't show PDFs in a page, the button becomes **Open** (new tab).
- **PowerPoint:** Microsoft's viewer, with transitions and animations. It fetches the deck from the live site, so a new deck only previews once deployed.
- **Images:** the image itself.

Add `data-preview="false"` to a link to leave Preview off. File types, icons and previews are set in `site/plugins/rehype-file-download.mjs`.

## Licence and attribution

[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). You may share and adapt the material for any purpose, including commercially, if you give credit and say what you changed.

**Attribution:** *Teaching That Lands* (formerly *Teaching That Sticks*), [teachingthatlands.uk](https://teachingthatlands.uk), source at [github.com/teachingthatlands/teachingthatlands.github.io](https://github.com/teachingthatlands/teachingthatlands.github.io)

## Contributing

Issues and pull requests are welcome. Please open an issue before large structural changes. If you adapt the programme for your organisation, we'd like to hear about it.
