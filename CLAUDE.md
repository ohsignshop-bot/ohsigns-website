# OH! Signs Website — Claude Operating Instructions

## What This Is

Customer-facing marketing website for **OH! Signs LLC** — a sign shop in Winston-Salem, NC.

| Environment | URL | Branch | Cloudflare Workers Project |
|-------------|-----|--------|---------------------------|
| Production | ohsigns.shop | `master` | `ohsigns-website` |
| Staging | testing.ohsigns.shop | `dev` | `ohsigns-website-staging` |

**Backend:** BMS at `bms.ohsigns.shop` (separate repo: `ohsigns_bms_v2`)

---

## Tech Stack

| Concern | Tool |
|---------|------|
| Framework | Astro 5 (static site generation) |
| CSS | Tailwind v4 via `@tailwindcss/vite` plugin |
| Deployment | Cloudflare Workers (assets-only, `wrangler deploy`) |
| Shop | Ecwid embed (store ID: `131689503`, appId: `aZAFDm27wC`) |
| Fonts | Google Fonts: Bebas Neue, DM Sans, Space Mono, Dancing Script |

---

## Design System

### Colors (CSS custom properties in `src/styles/global.css`)
| Token | Hex | Usage |
|-------|-----|-------|
| `--blue` | `#0099FF` | Primary accent, links, interactive |
| `--red` | `#FF2D2D` | Highlights, urgency |
| `--yellow` | `#FFD600` | CTAs, prices, emphasis |
| `--bg` | `#0A0A0F` | Page background |
| `--bg-end` | `#1a0020` | Gradient end (deep purple) |
| `--text` | `#F5F5F5` | Primary text |
| `--text-muted` | `#888888` | Body copy |
| `--text-dim` | `#555566` | Labels, fine print |
| `--border` | `#2A2A36` | Card/input borders |
| `--card-bg` | `rgba(17,17,28,0.88)` | Glass cards |

### Typography
| Font | Role |
|------|------|
| **Bebas Neue** | Display headings, nav buttons, section titles |
| **DM Sans** | Body text, form fields, descriptions |
| **Space Mono** | Tags, labels, monospace accents |
| **Dancing Script** | Logo "Signs" word only |

### Reusable Components
| Component | File | Purpose |
|-----------|------|---------|
| `SectionTitle` | `src/components/SectionTitle.astro` | Eyebrow + heading + accent bar |
| `Card` | `src/components/Card.astro` | Glass card with optional accent border |
| `Btn` | `src/components/Btn.astro` | Button: primary, outline, or cta-stack variant |
| `Nav` | `src/components/Nav.astro` | Marquee ticker + sticky nav bar |
| `Footer` | `src/components/Footer.astro` | Links, contact, social icons |

---

## Pages

| Route | Page | Key Sections |
|-------|------|-------------|
| `/` | Home | Hero, services preview, stats, testimonials, portfolio preview, CTA |
| `/about` | About | Story, values grid, stats, Google Maps, CTA |
| `/services` | Services | 8 service cards, pricing tables, FAQ accordion |
| `/portfolio` | Portfolio | Photo gallery, YouTube embeds, social share |
| `/shop` | Shop | Ecwid storefront embed |
| `/quote` | Get a Quote | Form → POST to `bms.ohsigns.shop/api/public/requests` |
| `/quote/success` | Success | Confirmation with reference number |

---

## Data Files

Static data is in `src/data/`:
- `services.ts` — 8 services with icons, descriptions, tags, starting prices
- `testimonials.ts` — Customer reviews
- `faq.ts` — 8 FAQ items
- `portfolio.ts` — Project showcase items + YouTube video IDs
- `pricing.ts` — 4 pricing categories with per-item prices

---

## Critical Rules

1. **No `package-lock.json` in repo** — Windows-generated lockfiles break Linux CI on Cloudflare. `.npmrc` has `legacy-peer-deps=true`. Cloudflare runs `npm install` (not `npm ci`).
2. **No SSR adapter needed** — This is a pure static site. Don't install `@astrojs/cloudflare`.
3. **`wrangler.jsonc` is assets-only** — No `main` field. Just `"assets": { "directory": "dist" }`.
4. **Branch discipline** — `master` = production (ohsigns.shop), `dev` = staging (testing.ohsigns.shop). Don't push unfinished work to master.
5. **Quote form POSTs to BMS** — The endpoint is `https://bms.ohsigns.shop/api/public/requests`. CORS is handled on the BMS side.
6. **Use CSS custom properties** — All colors use `var(--token)` from global.css. Don't hardcode hex values.
7. **Use the component library** — `SectionTitle`, `Card`, `Btn` exist for consistency. Use them instead of raw HTML.

---

## Common Commands

```bash
npm run dev      # Start dev server
npm run build    # Build to dist/
npm run preview  # Preview production build locally
```

---

## Branch & Deploy Workflow

1. Work on `dev` branch
2. `npm run build` — verify clean build
3. `git push origin dev` — triggers Cloudflare staging deploy
4. Check testing.ohsigns.shop
5. When ready for production: merge `dev` → `master`, push master
