# SWIPES-IN — HAMARA BHARAT web app migration

This is an initial **working swipe-reader scaffold**, not a production migration. The sample card is a clearly labelled demo. Existing WordPress content has **not yet been migrated**.

## Local run

```bash
npm install
npm run dev
npm run build
```

## Deployment

Hostinger must support Node.js build or static Vite deployment. Build with `npm run build`, upload contents of `dist/` to a staging subdomain, and configure SPA fallback routing for `/hi/` and `/stories/`.

## Migration safeguards

- Keep https://in.everyana.com/ live until staging is approved.
- Export WordPress posts, pages, reader cards, featured media, logo and CSS before changing DNS.
- Preserve English and Hindi story pairings, citations, and old URL redirects.
- Verify exact brand colours and logo from the live site before replacing scaffold styling.
- Never treat a published WordPress article as proof it is included in the swipe feed.
- Validate every imported source URL, translation, and date.

## Next development

WordPress export adapter, content model, media migration, deduplication, original URL mapping, bilingual editorial workflow, source monitoring, bookmarks, search, analytics and accessibility testing.


## Brand
SWIPES-IN is the app identity for the India edition. HAMARA BHARAT remains the editorial heritage name. Visual palette: saffron, white and green. Existing WordPress posts are not yet imported; demo data remains clearly labelled.
