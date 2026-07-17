# Deployment Guide

---

## Dev / test environment (current state)

**Live URL:** https://ohsigns-website.pages.dev (also: https://b3d2ba98.ohsigns-website.pages.dev)
**Custom domain:** dev.ohsigns.shop (attach in Cloudflare Pages dashboard → Custom Domains)
**Pages project:** `ohsigns-website`
**`X-Robots-Tag: noindex`** is set on all responses via `public/_headers` — this site will not be indexed.

### Redeploy manually

```bash
npm run deploy
# expands to: astro build && wrangler pages deploy dist --project-name ohsigns-website
```

Requires `wrangler` authenticated locally (`npx wrangler login`).
`PUBLIC_BMS_REQUEST_URL` is read from `.env` at build time (gitignored — see `.env.example`).

---

## Moving to production (when ready)

### Step 1 — Connect the GitHub repo for auto-deploys

In the Cloudflare Pages dashboard for the `ohsigns-website` project:
- Settings → Builds & Deployments → Connect to Git
- Repo: `ohsignshop-bot/ohsigns-website`
- Production branch: `master`
- Preview branches: `dev` (gets its own preview URL automatically)
- Build command: `npm run build`
- Build output: `dist`
- Node.js version: **20** (set under Settings → Environment Variables → `NODE_VERSION=20`)

### Step 2 — Set environment variables in the dashboard

Settings → Environment Variables → add for both **Production** and **Preview**:

| Variable | Value |
|---|---|
| `PUBLIC_BMS_REQUEST_URL` | `https://bms.ohsigns.shop/api/public/requests` |
| `NODE_VERSION` | `20` |

Once these are set, the `npm run deploy` / wrangler direct-upload workflow is no longer needed — pushes to `master` trigger production builds automatically.

### Step 3 — Attach custom domains

In Cloudflare Pages → `ohsigns-website` → Custom Domains:
- `ohsigns.shop` (production)
- `www.ohsigns.shop` → configure as redirect to root in Cloudflare DNS
- `dev.ohsigns.shop` (dev — already in allowlist; attach to this project or a separate one)

DNS is already managed by Cloudflare — the Pages dashboard will add the CNAME automatically.

**Do not touch `bms.ohsigns.shop` DNS.**

### Step 4 — Remove noindex from production

When `ohsigns.shop` is attached, update or remove `public/_headers` so the production domain is not blocked from indexing. The current `/*` rule blocks all domains on this project.

---

## Branch strategy

```
master  → ohsigns.shop (production — auto-deploy via GitHub once connected)
dev     → testing.ohsigns.shop / preview URL (auto-deploy via GitHub once connected)
```

---

## Deploy checklist (before going live)

- [ ] Connect GitHub repo in Cloudflare Pages dashboard
- [ ] Set `PUBLIC_BMS_REQUEST_URL` and `NODE_VERSION=20` as Pages env vars
- [ ] Attach `ohsigns.shop` custom domain
- [ ] Remove or scope `X-Robots-Tag: noindex` in `public/_headers`
- [ ] Replace `public/og.png` with real 1200×630 OG image
- [ ] Replace `public/apple-touch-icon.png` with real 180×180 icon
- [ ] Verify quote form end-to-end (submit → check BMS for new request)
- [ ] Verify sample pack form end-to-end
- [ ] Test mobile nav (open / close, all links work)
- [ ] Verify `/collections/*` and `/products/*` Shopify redirects return 301
- [ ] Verify `X-Robots-Tag` absent on `ohsigns.shop` responses
- [ ] Lighthouse: target 95+ performance, 100 accessibility
- [ ] `npm run check` passes clean

---

## Sanity checks (dev environment)

```bash
# Site loads
curl -I https://ohsigns-website.pages.dev

# noindex header present
curl -I https://dev.ohsigns.shop | grep -i robots

# Shopify redirect rules return 301
curl -I https://dev.ohsigns.shop/products/foo
curl -I https://dev.ohsigns.shop/collections/foo

# BMS CORS on public route (POST/OPTIONS allowed)
curl -s -X OPTIONS https://bms.ohsigns.shop/api/public/requests \
  -H "Origin: https://dev.ohsigns.shop" \
  -H "Access-Control-Request-Method: POST" -D - -o /dev/null | grep -i access-control

# BMS quote form contract
curl -s -X POST https://bms.ohsigns.shop/api/public/requests \
  -H "Content-Type: application/json" \
  -H "Origin: https://dev.ohsigns.shop" \
  -d '{"customer_name":"TEST","email":"test@test.com","comments":"delete me"}'
# Expected: {"success":true,"req_num":"REQ-..."}
```
