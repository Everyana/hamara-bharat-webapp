// Builds one permanent page per story in English and Hindi, a stories index, sitemap.xml and robots.txt.
// Runs at the end of `vite build` (see vite.config.js). Reads the live stories plus the archive,
// so a story keeps its page after it leaves the swipe feed.
import {mkdirSync, readFileSync, writeFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';

const SITE = 'https://hb.everyana.com';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const readJson = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : fallback);
const T = {
  en: {edition: 'BHARAT EDITION · PUBLIC INFORMATION', source: 'Source', original: 'Read the original notice ↗', open: 'Open in SWIPES', more: 'More from', gone: 'This story is no longer in the live feed. Check the original for current details.', all: 'All stories', allDesc: 'Every verified public update published on SWIPES Bharat, grouped by state and region.', foot: 'Independent public-information discovery. Not a government website. Every story links to its issuing source.', other: 'हिन्दी में पढ़ें', site: 'SWIPES Bharat'},
  hi: {edition: 'भारत संस्करण · सार्वजनिक सूचना', source: 'स्रोत', original: 'मूल सूचना पढ़ें ↗', open: 'SWIPES में खोलें', more: 'और खबरें:', gone: 'यह खबर अब लाइव फ़ीड में नहीं है। ताज़ा जानकारी के लिए मूल सूचना देखें।', all: 'सभी खबरें', allDesc: 'SWIPES भारत पर प्रकाशित सभी सत्यापित सार्वजनिक अपडेट, राज्य और क्षेत्र के अनुसार।', foot: 'स्वतंत्र सार्वजनिक-सूचना मंच। यह सरकारी वेबसाइट नहीं है। हर खबर मूल स्रोत से जुड़ी है।', other: 'Read in English', site: 'SWIPES भारत'},
};

export function loadStories() {
  const live = readJson('data/stories.json', []);
  const archive = readJson('data/archive.json', []);
  const byId = new Map();
  for (const s of [...archive, ...live]) byId.set(s.id, {...byId.get(s.id), ...s});
  const liveIds = new Set(live.map((s) => s.id));
  return [...byId.values()].map((s) => ({...s, inFeed: liveIds.has(s.id)})).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

const pathFor = (s, lang) => `${lang === 'hi' ? '/hi' : ''}/story/${s.id}/`;

const page = ({lang, title, description, path, alt, body, jsonLd = ''}) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${SITE}${path}"><link rel="alternate" hreflang="${lang}" href="${SITE}${path}"><link rel="alternate" hreflang="${lang === 'hi' ? 'en' : 'hi'}" href="${SITE}${alt}"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta property="og:type" content="article"><meta property="og:site_name" content="SWIPES Bharat"><meta property="og:locale" content="${lang === 'hi' ? 'hi_IN' : 'en_IN'}"><meta property="og:url" content="${SITE}${path}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${SITE}/og-image.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">${jsonLd}<style>body{margin:0;background:#16191a;color:#f5f1ea;font:17px/1.65 system-ui,sans-serif}main{max-width:720px;margin:0 auto;padding:28px 20px 64px}a{color:#f5f1ea}.k{color:#e8913f;font-weight:700;letter-spacing:.08em;font-size:12px}.brand{font-weight:800;font-size:22px;text-decoration:none}h1{font-size:30px;line-height:1.25;margin:10px 0 14px}.meta{color:#e8913f;font-weight:700;font-size:14px}.btn{display:inline-block;margin:18px 12px 0 0;padding:10px 16px;border:1px solid #e8913f;border-radius:8px;text-decoration:none}ul{padding-left:18px}li{margin:8px 0}footer{color:#9aa3a8;font-size:13px;margin-top:40px}.lang{float:right;font-size:14px}</style></head><body><main><a class="lang" href="${alt}">${T[lang].other}</a><a class="brand" href="/">SWIPES</a><div class="k">${T[lang].edition}</div>${body}<footer>${T[lang].foot}</footer></main></body></html>`;

export function writeStoryPages(outDir) {
  const stories = loadStories();
  const today = new Date().toISOString().slice(0, 10);
  const urls = [{loc: '/', lastmod: today}, {loc: '/stories/', lastmod: today}, {loc: '/hi/stories/', lastmod: today}];
  for (const s of stories) {
    for (const lang of ['en', 'hi']) {
      const c = s[lang] || s.en;
      if (!c?.title) continue;
      const cat = s.category?.[lang] || s.category?.en || '';
      const related = stories.filter((o) => o.id !== s.id && (o.jurisdiction === s.jurisdiction || o.category?.en === s.category?.en)).slice(0, 5);
      const ld = `<script type="application/ld+json">${JSON.stringify({'@context': 'https://schema.org', '@type': 'Article', headline: c.title, datePublished: s.date, inLanguage: lang === 'hi' ? 'hi-IN' : 'en-IN', isBasedOn: s.sourceUrl, publisher: {'@type': 'Organization', name: 'SWIPES Bharat', url: SITE}})}</script>`;
      const body = `<p class="meta">${esc(cat)} · ${esc(s.jurisdiction)} · ${esc(s.date)}</p><h1>${esc(c.title)}</h1><p>${esc(c.summary)}</p>${s.inFeed ? '' : `<p><em>${T[lang].gone}</em></p>`}<p>${T[lang].source}: <strong>${esc(s.source)}</strong></p><a class="btn" href="${esc(s.sourceUrl)}" target="_blank" rel="noopener">${T[lang].original}</a><a class="btn" href="/${lang === 'hi' ? '?lang=hi' : ''}#story-${esc(s.id)}">${T[lang].open}</a>${related.length ? `<h2>${T[lang].more} ${esc(s.jurisdiction)}</h2><ul>${related.map((o) => `<li><a href="${pathFor(o, lang)}">${esc((o[lang] || o.en).title)}</a></li>`).join('')}</ul>` : ''}`;
      const dir = join(outDir, ...(lang === 'hi' ? ['hi'] : []), 'story', s.id);
      mkdirSync(dir, {recursive: true});
      writeFileSync(join(dir, 'index.html'), page({lang, title: `${c.title} | ${T[lang].site}`, description: String(c.summary).slice(0, 155), path: pathFor(s, lang), alt: pathFor(s, lang === 'hi' ? 'en' : 'hi'), body, jsonLd: ld}));
      urls.push({loc: pathFor(s, lang), lastmod: s.date});
    }
  }
  for (const lang of ['en', 'hi']) {
    const groups = {};
    for (const s of stories) (groups[s.jurisdiction] ||= []).push(s);
    const list = Object.keys(groups).sort().map((j) => `<h2>${esc(j)}</h2><ul>${groups[j].map((s) => `<li><a href="${pathFor(s, lang)}">${esc((s[lang] || s.en).title)}</a> <small>${esc(s.date)}</small></li>`).join('')}</ul>`).join('');
    const p = lang === 'hi' ? '/hi/stories/' : '/stories/';
    const dir = join(outDir, ...(lang === 'hi' ? ['hi'] : []), 'stories');
    mkdirSync(dir, {recursive: true});
    writeFileSync(join(dir, 'index.html'), page({lang, title: `${T[lang].all} | ${T[lang].site}`, description: T[lang].allDesc, path: p, alt: lang === 'hi' ? '/stories/' : '/hi/stories/', body: `<h1>${T[lang].all}</h1>${list}`}));
  }
  writeFileSync(join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  writeFileSync(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
  return {stories: stories.length, pages: urls.length - 3};
}
