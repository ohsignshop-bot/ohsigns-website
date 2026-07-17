# TODO: Photos

Everything in this file needs a real photo or asset before the site goes live.

---

## Portfolio / work gallery

Each entry in `src/content/work/` references a PNG in `public/work/`. Real photos are now in place.
To swap a photo, replace the file in `public/work/` and update the `image` field in the `.md` to match.

| Content file | Image file | Status |
|---|---|---|
| `fleet-decals-metro-hvac.md` | `public/work/fleet-decals.png` | ✓ Real photo |
| `uv-rigid-substrate-retail.md` | `public/work/uv-retail-panel.png` | ✓ Real photo |
| `brand-identity-roast-co.md` | `public/work/cafe-brand.png` | ✓ Real photo |
| `storefront-signage-listo-tacos.md` | `public/work/storefront-window.png` | ✓ Real photo |
| `vehicle-wrap-food-truck.md` | `public/work/spice-route-wrap.png` | ✓ Real photo |
| `cut-vinyl-wall-mural.md` | `public/work/office-wall-graphic.png` | ✓ Real photo |

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
