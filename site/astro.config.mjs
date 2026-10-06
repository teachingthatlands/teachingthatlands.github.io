// @ts-check
import { defineConfig } from 'astro/config';
import rehypeFileDownload from './plugins/rehype-file-download.mjs';

// https://astro.build/config
export default defineConfig({
  // Set this to your GitHub Pages repo name, e.g. '/teaching-that-sticks'
  // Leave as '' (root) if using a custom domain or user/org pages site
  base: '',
  site: 'https://teaching-that-sticks.github.io',
  output: 'static',
  // Old library addresses (named after theorists and papers) still work:
  // each one becomes a page that forwards to the plain-English address.
  redirects: {
    '/theories/action-learning': '/theories/learning-with-peers',
    '/theories/andragogy': '/theories/how-adults-learn',
    '/theories/cognitive-load': '/theories/too-much-at-once',
    '/theories/constructive-alignment': '/theories/line-it-up',
    '/theories/debriefing': '/theories/debriefing-with-curiosity',
    '/theories/dual-coding': '/theories/pictures-and-words',
    '/theories/experiential-learning': '/theories/learning-from-experience',
    '/theories/feedback-feedforward': '/theories/feedback-people-can-use',
    '/theories/implementation-intentions': '/theories/if-then-plans',
    '/theories/interleaving': '/theories/mix-it-up',
    '/theories/kirkpatrick-model': '/theories/did-the-training-work',
    '/theories/maslow': '/theories/basic-needs',
    '/theories/millers-pyramid': '/theories/knowing-isnt-doing',
    '/theories/psychological-safety': '/theories/safe-to-speak-up',
    '/theories/retrieval-practice': '/theories/testing-beats-re-reading',
    '/theories/spaced-practice': '/theories/spread-it-out',
    '/theories/stolen-curriculum': '/theories/what-adverts-teach-us',
    '/theories/threshold-concepts': '/theories/ideas-that-change-how-you-see',
    '/theories/zone-of-proximal-development': '/theories/just-enough-help',
    '/papers/argyris-schon-1978': '/papers/questioning-the-goal',
    '/papers/biggs-1996': '/papers/line-it-up',
    '/papers/cepeda-2006': '/papers/spacing-beats-cramming',
    '/papers/craik-lockhart-1972': '/papers/thinking-about-meaning',
    '/papers/ebbinghaus-1885': '/papers/how-fast-we-forget',
    '/papers/edmondson-1999': '/papers/safe-teams-learn-more',
    '/papers/freeman-2014': '/papers/active-beats-lecturing',
    '/papers/gollwitzer-1999': '/papers/if-then-plans',
    '/papers/gollwitzer-sheeran-2006': '/papers/if-then-plans-94-studies',
    '/papers/hattie-timperley-2007': '/papers/useful-feedback',
    '/papers/kirkpatrick-1954': '/papers/four-ways-to-judge-training',
    '/papers/knowles-1984': '/papers/teaching-adults-in-practice',
    '/papers/kolb-1984': '/papers/the-experience-cycle',
    '/papers/lave-wenger-1991': '/papers/learning-by-taking-part',
    '/papers/maslow-1943': '/papers/basic-needs-and-motivation',
    '/papers/mayer-2001': '/papers/slides-with-words-and-pictures',
    '/papers/meyer-land-2005': '/papers/ideas-that-change-how-you-see',
    '/papers/revans-1982': '/papers/learning-with-peers',
    '/papers/roediger-karpicke-2006': '/papers/testing-beats-re-reading',
    '/papers/rudolph-2007': '/papers/debriefing-with-curiosity',
    '/papers/schon-1983': '/papers/thinking-on-your-feet',
    '/papers/sweller-1988': '/papers/why-practice-can-overload',
    '/papers/vygotsky-1978': '/papers/just-enough-help',
  },
  markdown: {
    // <a class="file-download" href="/slides/…">Label</a> → download card
    rehypePlugins: [rehypeFileDownload],
  },
});
