# TODO: Photos

Everything in this file needs a real photo or asset before the site goes live.

---

## Portfolio / work gallery

Each entry in `src/content/work/` has a placeholder `image` path. Replace with real photos
(minimum 1200×800px, JPG or WebP, optimised for web).

| File | image path | Description |
|------|-----------|-------------|
| `fleet-decals-metro-hvac.md` | `/work/metro-hvac.jpg` | Fleet van decal — any finished vehicle job works |
| `uv-rigid-substrate-retail.md` | `/work/retail-uv-panel.jpg` | UV-printed panel in use |
| `brand-identity-roast-co.md` | `/work/roast-co-brand.jpg` | Brand mockup or printed collateral |
| `storefront-signage-listo-tacos.md` | `/work/listo-tacos.jpg` | Storefront / signage photo |
| `vehicle-wrap-food-truck.md` | `/work/spice-route-wrap.jpg` | Vehicle wrap |
| `cut-vinyl-wall-mural.md` | `/work/tech-office-mural.jpg` | Interior wall graphic |

Place photos in `public/work/`. You can rename the files — just update the `image` field in the
corresponding `.md` file to match.

---

## OG image

`public/og.png` — **1200 × 630px** — shown as the preview card when the site is shared on social.

Suggested design:
- Ink-black background (`#0E0F0C`)
- "Oh! Signs" in Archivo Black — cream text, acid "!"
- Tagline: "We're serious about the work, not ourselves."
- URL in bottom-right: `ohsigns.shop`

---

## Apple Touch Icon

`public/apple-touch-icon.png` — **180 × 180px** — used when someone bookmarks the site on iOS.

Suggested: Ink background (`#0E0F0C`), "Oh!" centred in white + acid yellow, rounded corners baked in.

---

## Favicon

`public/favicon.svg` — already created as a simple SVG. Check it looks right in a browser tab.
If you want a `.ico` fallback for older browsers, generate one from the SVG and add a
`<link rel="icon" href="/favicon.ico">` in `Layout.astro`.

---

## Notes

- Use WebP where possible (Cloudflare Pages will not auto-convert)
- Keep file sizes under 200KB per image
- Use descriptive `alt` text in the content collection entries — already scaffolded
