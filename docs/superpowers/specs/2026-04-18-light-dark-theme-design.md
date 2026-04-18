# Light / Dark Theme for kruspanek.eu

**Status:** Approved design, pending implementation plan
**Date:** 2026-04-18

## Goal

Add a light / dark theme to the kruspanek.eu Jekyll site with:

- OS preference as the default (`prefers-color-scheme`).
- A manual toggle in the navbar that overrides the OS preference and persists via `localStorage`.
- No flash of wrong theme on load.
- Zero visual change for visitors who stay on the existing light theme.

## Non-goals

- Redesigning the site. This is a palette + mechanism addition only.
- Fixing the pre-existing issue that standalone `/photogalleries/*.html` URLs render as naked HTML fragments (no `<head>`, no nav). That is a separate concern. Flagged in "Known unrelated issues" below.
- A "reset to system" menu item. If a user ever wants to return to auto mode, they can clear site data. Can be added later if anyone asks.

## Decisions (locked)

| Decision | Choice |
|---|---|
| Trigger | OS default + manual toggle that persists (localStorage) |
| Toggle placement | Icon button in the top navbar; collapses into hamburger on mobile |
| Hero masthead in dark mode | Add darker overlay/gradient over existing image |
| Palette source | Custom values (below), tuned live in browser during implementation |
| Gallery scope | Theme applies to the homepage including the gallery modal; standalone gallery URLs out of scope |

## Architecture

### Approach: CSS custom properties + `data-theme` attribute

Migrate user-facing color tokens from compile-time SCSS variables to runtime CSS custom properties on `:root`. Dark overrides live under `html[data-theme="dark"]`. One stylesheet, instant switch, no flash.

Existing SCSS variables (`$primary`, `$hover`, etc.) become thin shims that reference the CSS custom properties — so existing partials keep working with minimal edits.

### Files changed

| Piece | Where | What changes |
|---|---|---|
| Color tokens | new `_sass/_theme.scss`; edits to `_sass/_variables.scss` | CSS custom properties on `:root` (light) and `html[data-theme="dark"]`. SCSS variables become `var(--...)` shims. |
| FOUC guard | `_includes/head.html` | Tiny inline `<script>` (before stylesheet) that resolves initial theme synchronously. |
| Toggle button | `_includes/nav.html`; new `_sass/_theme-toggle.scss` | New `<button id="theme-toggle">` in the navbar with inline sun/moon SVG. |
| Toggle behavior | `assets/js/kruspanek.js` (+ regenerate `kruspanek.min.js`) | Click handler, localStorage write, `aria-pressed` update, `matchMedia` listener. |
| Hero overlay | `_sass/_masthead.scss` | Add dark-mode overlay via `--hero-overlay` token. |
| Photo grid theming | `_sass/_photos.scss` | Replace hardcoded `#f3f3f3`, `background-color: white`, and rgba shadows with themed tokens. |

### Not changed

- `_data/*.yml` (actions, contacts).
- The photogallery layout's DOM structure or load mechanism.
- GLightbox (already ships with its own dark-on-black UI that works in both themes).

## Color tokens

Seven CSS custom properties cover the whole site.

| Token | Purpose | Light | Dark (starting point) |
|---|---|---|---|
| `--color-bg` | Page background, sections | `#ffffff` | `#15120e` |
| `--color-bg-alt` | Striped sections, cards | `#f8f9fa` | `#1d1915` |
| `--color-text` | Body copy | `#6c757d` | `#c9c1b4` |
| `--color-heading` | `h1`–`h6` | `#212529` | `#f2e9d8` |
| `--color-accent` | Link hover, focus rings, `back-to-top` hover | `#007bff` | `#e6a85c` |
| `--color-border` | Dividers, nav border | `#dee2e6` | `#2d2823` |
| `--hero-overlay` | Dark gradient over masthead image | `transparent` | `rgba(20, 17, 14, 0.55)` |

Additional shadow token for the photogallery card, themed per mode:

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--shadow-card` | Default card shadow | `0 2px 6px rgba(0,0,0,0.08)` | `0 2px 6px rgba(0,0,0,0.4)` |
| `--shadow-card-hover` | Hover card shadow | `0 10px 24px rgba(0,0,0,0.18)` | `0 10px 24px rgba(0,0,0,0.6)` |

**All values are starting points.** They will be tuned in the browser during implementation.

**Character:** neutral dark with a subtle warm tint (Wallachian-wood character rather than pure `#111`). The accent shifts from cool blue to warm amber in dark mode so it still reads as "active/interactive" but matches the folklore character.

## Initial theme resolution

Runs synchronously in the inline `<head>` script before any CSS loads:

```
1. localStorage['kruspanek-theme'] === 'dark' → dark
2. localStorage['kruspanek-theme'] === 'light' → light
3. matchMedia('(prefers-color-scheme: dark)').matches → dark
4. otherwise → light
```

Writes the result to `document.documentElement.dataset.theme`. This is why there is no FOUC.

## Toggle behavior

### Markup

```html
<button id="theme-toggle"
        type="button"
        aria-label="Přepnout světlý/tmavý režim"
        aria-pressed="false">
  <!-- inline sun SVG; shown when data-theme=light on <html> -->
  <!-- inline moon SVG; shown when data-theme=dark on <html> -->
</button>
```

Icon swap is pure CSS, keyed off `html[data-theme="..."] #theme-toggle svg`. No JS needed to swap icons, so the button remains accessible if the main JS bundle fails to load (only the inline head script is required).

### Click handler

1. Read current `document.documentElement.dataset.theme`.
2. Flip to the other value.
3. Write `localStorage.setItem('kruspanek-theme', newValue)`.
4. Update `aria-pressed` on the button.
5. Announce the change in a visually hidden live region (`role="status"`) for screen readers.

### OS preference listener

`window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...)`:

- If `localStorage['kruspanek-theme']` is present (user has made an explicit choice), ignore.
- Otherwise, update `data-theme` to match the new OS preference.

This ensures visitors who never click the toggle still auto-follow their OS even if they change it later. Explicit user choice wins forever.

## Accessibility

- `aria-label` on the toggle button (Czech): "Přepnout světlý/tmavý režim".
- `aria-pressed` reflects current state (`true` = dark, `false` = light).
- Visually hidden live region announces the change for screen readers.
- Color contrast: both palettes aim for WCAG AA. Verify during implementation using the in-browser DevTools contrast checker on body text and headings.
- `prefers-reduced-motion` already respected by the existing `_photos.scss`; no new motion introduced by this feature.

## Implementation notes

- **JS asset footgun:** `kruspanek.min.js` is hand-maintained (Gulp minification was removed). The implementation plan must include regenerating or manually updating the min file after edits to `kruspanek.js`, or (preferred) temporarily pointing `_layouts/default.html` at the unminified `kruspanek.js` for the duration of this work.
- **SCSS shim pattern:** `$primary: var(--color-text);` compiles to a literal CSS custom-property reference. This preserves the ergonomics of existing partials while making colors runtime-swappable. Watch for SCSS functions (`lighten()`, `darken()`, `fade-out()`) on these shims — they fail silently against CSS variables. Any partial using them must either be rewritten to use a separate variant token or switch to `color-mix(in srgb, ...)` in CSS. `_sass/_photos.scss` uses `fade-out($primary, .9)` — this will need handling.
- **No hot reload for `_config.yml`:** unrelated, but remember to restart `jekyll serve` if any feature-flag-style config is added (none planned here).

## Known unrelated issues (flagged, not fixed)

- `_layouts/photogallery.html` is a bare fragment with no `<html>`, `<head>`, or `<nav>`. Standalone `/photogalleries/*.html` URLs render unstyled. This pre-exists this feature. Fixing requires giving the layout a parent (`layout: default`) and is out of scope.

## Success criteria

1. Light mode looks identical to current production (visual diff: none).
2. On a fresh device with OS set to dark, the site loads in dark mode with no flash.
3. Clicking the toggle flips the theme instantly, persists across reloads, and persists across navigation to `/photogalleries/*` when loaded via the homepage modal.
4. Screen reader announces the state change.
5. Keyboard: toggle is reachable via Tab, activatable via Enter/Space.
6. Jekyll build succeeds; no new console errors.
7. Both `kruspanek.js` and `kruspanek.min.js` are consistent (or `default.html` points at the unminified file as a temporary measure).
