import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// ── Theory collection ──────────────────────────────────────────────────────
// Each .md file in src/content/theories/ is one theory page.
// Slug is derived from the filename: too-much-at-once.md → slug "too-much-at-once"
const theories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/theories' }),
  schema: z.object({
    /** The idea's name in the research, e.g. "Cognitive Load Theory" */
    title: z.string(),
    /** Plain-English headline: the idea, not the name (cards, page heading) */
    headline: z.string(),
    /** One-sentence summary shown in theory-row chips on session pages */
    summary: z.string(),
    /** Session slugs this theory appears in, e.g. ["session-1", "session-2"] */
    sessions: z.array(z.string()).default([]),
    /** Key evidence citations */
    evidence: z.array(z.object({
      cite: z.string(),
      /** Optional paper slug (e.g. "why-practice-can-overload") linking to /papers/[slug] */
      paper: z.string().optional(),
    })).default([]),
    /** Optional slide comparison images (filenames in /public/slides/) */
    images: z.object({
      bad: z.string(),
      good: z.string(),
      badAlt: z.string().optional(),
      goodAlt: z.string().optional(),
    }).optional(),
  }),
});

// ── Session collection ─────────────────────────────────────────────────────
// Each .md file in src/content/sessions/ is one participant session page.
const sessions = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sessions' }),
  schema: z.object({
    title: z.string(),
    number: z.number(),
    /** Short deck-style subtitle, e.g. "Death by PowerPoint?" */
    tagline: z.string(),
    /** Theory slugs covered in this session */
    theories: z.array(z.string()).default([]),
    /** Fox image filename (in /public/images/fox/) for the session hero */
    fox: z.string().default('whiteboard.png'),
    duration: z.string().default('90 min'),
    /** One-liner shown below the h1 in the hero and as the prog-card body */
    subtitle: z.string().optional(),
    /** Opening question displayed as a blockquote in the session-card */
    primingQuestion: z.string().optional(),
    /** Brief preparation note for participants */
    prep: z.string().optional(),
    /** Reassurance for anyone who couldn't do the prep */
    prepFallback: z.string().optional(),
    /** What participants will have done by the end: observable verbs, first word is the verb */
    outcomes: z.array(z.string()).default([]),
    /** Recap: the session's key ideas in plain words, each optionally linked to a theory */
    keyIdeas: z.array(z.object({
      idea: z.string(),
      detail: z.string().optional(),
      theory: z.string().optional(),
    })).default([]),
    /** Which part of the design canvas this session builds */
    canvas: z.string().optional(),
    /** The ask, verbatim from the card participants write. Mark phrase breaks with "|" */
    ask: z.string().optional(),
    /** Heading for the ask card (default: "Your task before Session N+1") */
    askLabel: z.string().optional(),
    /** The ask as plain numbered steps */
    askSteps: z.array(z.string()).default([]),
    /** The no-computer route; when set, the card also offers computer help */
    askNoComputer: z.string().optional(),
    /** Further links under the ask: an optional lead-in line, then a button */
    askLinks: z.array(z.object({ intro: z.string().optional(), text: z.string(), href: z.string() })).default([]),
  }),
});

// ── Papers collection ──────────────────────────────────────────────────────
// Plain-English summaries + critical reviews of key research papers.
const papers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/papers' }),
  schema: z.object({
    /** The paper's own title, as cited */
    title: z.string(),
    /** Plain-English headline: the idea, not the paper (cards, page heading) */
    headline: z.string(),
    authors: z.string(),
    journal: z.string(),
    year: z.number(),
    doi: z.string().optional(),
    openAccess: z.boolean().default(false),
    openAccessUrl: z.string().optional(),
    /** Theory/theorist slugs this paper supports (free-text, for display) */
    theorists: z.array(z.string()).default([]),
    /** Session numbers this paper appears in */
    sessions: z.array(z.number()).default([]),
    /** Internal image generation brief — not rendered */
    imagePrompt: z.string().optional(),
  }),
});

// ── Facilitator collection ─────────────────────────────────────────────────
// Full delivery blueprints, reference materials, and support docs for
// the person running the programme. Not participant-facing.
const facilitator = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/facilitator' }),
  schema: z.object({
    title: z.string(),
    /** 'blueprint' = session delivery guide; 'resource' = support material; 'pre-programme' = setup/commissioning docs; 'comms' = participant email templates */
    type: z.enum(['blueprint', 'resource', 'pre-programme', 'comms']),
    /** Session number (1/2/3) — blueprints only */
    session: z.number().optional(),
    duration: z.string().optional(),
    /** Sort order in the hub listing */
    order: z.number(),
    /** One-liner shown on hub cards */
    tagline: z.string().optional(),
    /** Who this page is for, shown at the top of the page: one plain sentence */
    audience: z.string().optional(),
    /** Fox image filename (in /public/images/fox/) */
    fox: z.string().optional(),
  }),
});

export const collections = { theories, sessions, papers, facilitator };
