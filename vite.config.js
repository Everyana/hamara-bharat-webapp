import {defineConfig} from 'vite';
import {readFileSync} from 'node:fs';
import {writeStoryPages} from './scripts/story-pages.mjs';

const SITE = 'https://hb.everyana.com/';
const TITLE = 'SWIPES Bharat — Official Public Updates';
const DESC = 'Verified public information from across India, in English and Hindi. Explore official updates one swipe at a time.';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

// Writes sharing tags and the newest stories into index.html at build time,
// so the first paint and link previews never depend on JavaScript.
function prerender() {
  return {
    name: 'swipes-prerender',
    transformIndexHtml(html) {
      let stories = [];
      try {
        stories = JSON.parse(readFileSync('data/stories.json', 'utf8'))
          .slice()
          .sort((a, b) => String(b.date).localeCompare(String(a.date)))
          .slice(0, 12);
      } catch {
        stories = [];
      }
      const head = [
        `<link rel="canonical" href="${SITE}">`,
        `<meta name="robots" content="index,follow,max-image-preview:large">`,
        `<meta property="og:type" content="website">`,
        `<meta property="og:site_name" content="SWIPES Bharat">`,
        `<meta property="og:locale" content="en_IN">`,
        `<meta property="og:locale:alternate" content="hi_IN">`,
        `<meta property="og:url" content="${SITE}">`,
        `<meta property="og:title" content="${esc(TITLE)}">`,
        `<meta property="og:description" content="${esc(DESC)}">`,
        `<meta property="og:image" content="${SITE}og-image.png">`,
        `<meta property="og:image:width" content="1200">`,
        `<meta property="og:image:height" content="630">`,
        `<meta property="og:image:alt" content="SWIPES Bharat edition: verified public updates in English and Hindi">`,
        `<meta name="twitter:card" content="summary_large_image">`,
        `<meta name="twitter:title" content="${esc(TITLE)}">`,
        `<meta name="twitter:description" content="${esc(DESC)}">`,
        `<meta name="twitter:image" content="${SITE}og-image.png">`,
        `<style>.pr{background:#16191a;color:#f5f1ea;font:16px/1.5 system-ui,sans-serif;min-height:100vh;padding:24px}.pr h1{font-size:28px;margin:0 0 4px}.pr p.k{color:#e8913f;font-weight:700;letter-spacing:.08em;font-size:12px;margin:0 0 20px}.pr article{border-top:1px solid #2c3133;padding:16px 0;max-width:760px}.pr small{color:#e8913f;font-weight:700}.pr h2{font-size:20px;margin:4px 0}.pr a{color:#f5f1ea}</style>`,
      ].join('');
      const cards = stories
        .map((s) => `<article><small>${esc(s.category?.en)} · ${esc(s.date)} · ${esc(s.jurisdiction)}</small><h2>${esc(s.en?.title)}</h2><p>${esc(s.en?.summary)}</p><a href="${esc(s.sourceUrl)}" rel="noopener" target="_blank">${esc(s.source)} — read the original notice</a></article>`)
        .join('');
      const body = `<div class="pr"><h1>SWIPES</h1><p class="k">BHARAT EDITION · PUBLIC INFORMATION</p>${cards}</div>`;
      return html
        .replace('</head>', `${head}</head>`)
        .replace('<div id="app"></div>', `<div id="app">${body}</div>`);
    },
  };
}

function storyPages() {
  let outDir = 'dist';
  return {
    name: 'swipes-story-pages',
    apply: 'build',
    configResolved(config) { outDir = config.build.outDir; },
    closeBundle() {
      const r = writeStoryPages(outDir);
      console.log(`story pages: ${r.pages} written for ${r.stories} stories`);
    },
  };
}

export default defineConfig({plugins: [prerender(), storyPages()]});
