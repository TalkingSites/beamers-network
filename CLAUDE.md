# Beamers Network — Marketing Site

11ty (Eleventy) static site. Deployed on Netlify. Source is in `src/`.

## What this is
Marketing site for Beamers Network — a platform where verified tech people ("Wizards") provide structured help to non-tech people via a 3-wish + retainer model.

## Stack
- **11ty** with Nunjucks templates (`.njk`)
- **Bootstrap 5** + custom CSS (`src/assets/css/styles.css`)
- **Three.js** 3D wand animation (`src/assets/js/wand3d.js`)
- **Netlify Forms** for the apply page

## Key files
| File | Purpose |
|------|---------|
| `src/index.njk` | Main landing page — all sections |
| `src/apply.njk` | Wizard application form (Netlify form, posts to /thanks/) |
| `src/thanks.njk` | Post-application confirmation page |
| `src/assets/css/styles.css` | All styles — CSS variables, dark/light theme, components |
| `src/assets/js/wand3d.js` | Three.js wand animation (3D, WebGL) |
| `src/assets/js/beamers.js` | Starfield canvas, wand-tap text glow effect |
| `src/_includes/layouts/home-base.njk` | Root HTML layout, Google Fonts, Bootstrap |
| `src/_includes/partials/navbar.njk` | Sticky navbar with theme toggle |
| `src/_includes/partials/footer.njk` | Footer with GitHub link |
| `src/_data/navbar.json` | Nav items (also drives footer links) |
| `src/assets/images/favicon.svg` | Custom wand favicon |
| `src/assets/images/wand.svg` | Standalone wand SVG (for logo use) |

## Design decisions
- **Always-dark hero** — even in light mode, the hero stays dark (starfield + wand). Overrides are in `[data-theme="light"] .hero-section` rules.
- **No section labels** — never add eyebrow text / small labels above headings. User dislikes them on every site.
- **Gold underline for emphasis** — `p strong, li strong` uses `text-decoration: underline; text-decoration-color: var(--gold-border)` — NOT gold text colour, just a subtle underline.
- **Font weights** — Inter loaded at 300/400/500/600 only. No 700 loaded, so don't synthesise bold.
- **CSS variables** — dark mode defaults in `:root`, light mode overrides in `[data-theme="light"]`. Key vars: `--gold`, `--bg-base`, `--bg-surface`, `--bg-card`, `--text-primary`, `--text-secondary`, `--border`.

## Sections (index.njk top to bottom)
1. **Hero** — wand + starfield, headline, CTA buttons → /apply/
2. **Problem** — two-panel split: "The Wizard's trap" (purple tint) + "The wand without spells" (gold tint), + "Sound familiar?" CTA
3. **How it works** — 3 steps + visual client journey card
4. **Perks** — 6 perk cards + retainer unlock panel
5. **Deal** — $5/fortnight pricing card with checklist
6. **Values** — 4 Beamer Wizard standards

## Wand animation (wand3d.js)
- Three.js scene, camera z=8 FOV=50
- Oval flourish → tap phase → hover bob
- Key constants: `CYCLE=3.5`, `FLOURISH_END=0.72`, `TAP_PEAK=0.79`
- `isMobile` var updated in `onResize`, affects tap rotation and glow scale
- Dispatches `CustomEvent('wand-tap')` at tap peak → triggers hero headline glow in beamers.js
- Mobile canvas: 300px wide, 2.2 aspect ratio. Desktop: up to 520px.

## Running locally
```bash
npm install
npm start        # dev server on localhost:8080
npm run build    # production build to _site/
```
