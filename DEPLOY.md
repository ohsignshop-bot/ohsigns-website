# Deployment Guide

## Cloudflare Pages setup

### Production (ohsigns.shop)

Project name: `ohsigns-website`
Branch: `master`
Build command: `npm run build`
Build output: `dist`

Environment variables:
- `PUBLIC_BMS_REQUEST_URL` = `https://bms.ohsigns.shop/api/public/requests`

Custom domain: `ohsigns.shop` (+ `www.ohsigns.shop` → 301 to root)

### Staging (testing.ohsigns.shop)

Project name: `ohsigns-website-staging`
Branch: `dev`
Build command: `npm run build`
Build output: `dist`

Environment variables: same as production.

Custom domain: `testing.ohsigns.shop`

---

## Branch strategy

```
master  → ohsigns.shop         (production — currently "Coming Soon")
dev     → testing.ohsigns.shop (staging — full site)
```

When ready to go live: merge `dev` → `master`. The Cloudflare Pages production build fires automatically.

---

## Deploy checklist

Before merging to master / going live:

- [ ] Replace `public/og.png` with real 1200×630 OG image
- [ ] Replace `public/apple-touch-icon.png` with real 180×180 icon
- [ ] Add real portfolio photos (see `TODO-photos.md`)
- [ ] Verify `PUBLIC_BMS_REQUEST_URL` is set in Cloudflare Pages env vars
- [ ] Test quote form end-to-end (submit → check BMS for new request)
- [ ] Test sample pack form end-to-end
- [ ] Test mobile nav (open / close, all links work)
- [ ] Verify sitemap accessible at `/sitemap-index.xml`
- [ ] Verify robots.txt at `/robots.txt`
- [ ] Verify all `/collections/*` and `/products/*` Shopify redirects fire (301, not 404)
- [ ] Check Lighthouse score — target 95+ performance, 100 accessibility
- [ ] Verify all internal links resolve correctly
- [ ] Check `npm run check` passes with no TypeScript errors

---

## `wrangler deploy` (manual, if needed)

The site uses Cloudflare Pages (not Workers), so normal deploys happen via Git push.
`wrangler deploy` is only needed for the BMS Cloudflare Worker (separate repo).

---

## Updating the site

1. Edit files on `dev` branch
2. `npm run check` — must pass clean
3. Push `dev` → Cloudflare Pages staging builds automatically
4. Check at `testing.ohsigns.shop`
5. Merge `dev` → `master` → production builds automatically
