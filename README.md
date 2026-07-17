# Oh! Signs — Static Marketing Site

Static marketing site for OH! Signs LLC, built with Astro 4 + Tailwind v4 + React 18.

**Production:** https://ohsigns.shop (Cloudflare Pages)
**Staging:** https://testing.ohsigns.shop (Cloudflare Pages, separate project)

---

## Stack

| Concern | Tool |
|---------|------|
| Framework | Astro 4 (static output) |
| CSS | Tailwind v4 via `@tailwindcss/vite` |
| React islands | React 18 (QuoteForm, any future interactive components) |
| Fonts | Archivo Black (display), DM Sans Variable (body) — via Fontsource |
| Hosting | Cloudflare Pages |
| BMS integration | `POST https://bms.ohsigns.shop/api/public/requests` |

---

## Getting Started

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static output → dist/
npm run preview      # preview dist/ locally
npm run check        # Astro type check
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
PUBLIC_BMS_REQUEST_URL=https://bms.ohsigns.shop/api/public/requests
```

Set this in Cloudflare Pages → Settings → Environment Variables for both production and preview.

---

## Project Structure

```
src/
  components/
    Header.astro          — Sticky nav, mobile menu
    Footer.astro          — Footer nav, social links, copyright
    OrnamentCorner.astro  — Art Nouveau SVG corner flourish
    OrnamentFrame.astro   — Corner flourish frame wrapper
    QuoteForm/
      index.tsx           — React island: quote form + sample-pack form
      styles.css          — QuoteForm component styles
  content/
    config.ts             — Astro content collection schema
    work/*.md             — Portfolio entries
  layouts/
    Layout.astro          — Base HTML shell, meta, OG tags
  pages/
    index.astro           — Home
    quote.astro           — Quote request form
    sample-pack.astro     — Free sample pack landing
    about.astro           — About page
    contact.astro         — Contact + FAQ
    404.astro             — 404 page
    services/
      index.astro         — Services overview
      decals.astro        — Decals & Stickers
      uv.astro            — UV Printing
      design.astro        — Design Services
    work/
      index.astro         — Portfolio gallery with category filter
  styles/
    global.css            — Tailwind v4 + design tokens + global styles
public/
  favicon.svg
  og.png                  — 1200×630 OG image (see TODO-photos.md)
  apple-touch-icon.png    — 180×180 (see TODO-photos.md)
  robots.txt
  _redirects              — Cloudflare Pages redirect rules (Shopify → new site)
```

---

## Design System

**Palette**
- `--color-ink: #0E0F0C` — near-black background
- `--color-acid: #B8E600` — acid yellow-green, primary CTA
- `--color-cream: #F2EAD8` — warm white text
- `--color-smoke: #8A9080` — muted text / labels
- `--color-blood: #C41B17` — red accent (icons, ornaments)

**Typography**
- Display: Archivo Black
- Body: DM Sans Variable
- Fluid type scale via `clamp()` — see `global.css`

**Art Nouveau ornament system**
- `OrnamentCorner.astro` — standalone corner SVG
- `OrnamentFrame.astro` — wrapper that places 4 corners around any content slot

---

## Deployment

See `DEPLOY.md`.

---

## Photos needed

See `TODO-photos.md` for the full list of placeholder images to replace before launch.
