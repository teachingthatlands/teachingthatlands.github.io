// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import rehypeFileDownload from './plugins/rehype-file-download.mjs';

// https://astro.build/config
export default defineConfig({
  // Set this to your GitHub Pages repo name, e.g. '/teaching-that-sticks'
  // Leave as '' (root) if using a custom domain or user/org pages site
  base: '',
  site: 'https://teaching-that-sticks.github.io',
  output: 'static',
  // Astro 7's default ('jsx') strips the space around inline tags, so
  // "a failure of <em>default</em>" renders as "ofdefault". Keep the
  // HTML-aware whitespace handling the site was written for.
  compressHTML: true,
  markdown: {
    // The remark/rehype pipeline (Astro 7's default is Sätteri), which the
    // download-card plugin is written for:
    // <a class="file-download" href="/slides/…">Label</a> → download card
    processor: unified({ rehypePlugins: [rehypeFileDownload] }),
  },
});
