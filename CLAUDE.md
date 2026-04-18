# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Jekyll single-page site for **Valašský folklorní spolek KRUŠPÁNEK**, a Czech folklore association, deployed to `kruspanek.eu` via GitHub Pages from the `master` branch. Based on the Agency Jekyll theme with Grayscale-inspired customizations. All user-facing content is in **Czech** — preserve Czech typography (non-breaking spaces like `&#160;` before short words are intentional).

## Commands

```bash
bundle install                  # install Ruby dependencies
bundle exec jekyll serve        # dev server at http://localhost:4000 with live rebuild
bundle exec jekyll build        # one-off build to _site/
```

There is **no test suite, no linter, and no JS build step**. The old Node/Gulp pipeline was removed in commit `de4253d`. `.travis.yml` still references `npm test`/`gulp` but is stale — ignore it.

## Architecture

### Single-page composition

`index.md` uses the `single-page` layout, which is just a stack of `_includes/`:

```
hero → about → trainings → contacts → actions → photos → photos-modal
```

Editing a section of the homepage means editing the corresponding include, not `index.md`.

### The `default` layout is doing real work

`_layouts/default.html` is not just a shell — it contains the inline `<script>` that powers the actions list and photogallery modal. Two things live there that are easy to miss:

1. **Actions list is double-filtered by date.** Jekyll filters `site.data.actions` at *build time* (`where_exp` by `now`), then JS re-filters the resulting JSON at *page load time* against the browser's clock. Both filters are needed: the build-time one keeps stale events out of the HTML; the JS one handles the gap between deploys. When changing date logic, update both.
2. **Photogallery modal loads HTML fragments via jQuery `.load()`** from `photogalleries/<image_dir>` paths — clicking a thumbnail on the homepage pulls the rendered photogallery page into `#photogallery-inner-content`.

### Photogalleries collection

`_photogalleries/` is a Jekyll collection (configured in `_config.yml` with `output: true`). To add a gallery:

1. Create `_photogalleries/YYYY-MM-DD-slug.md` with front matter: `layout: photogallery`, `title:`, `image_dir:` (matches the folder), `image:` (cover thumbnail filename).
2. Drop images into `assets/img/photogalleries/<image_dir>/`.

The `photogallery` layout auto-discovers all files under `assets/img/photogalleries/<image_dir>/` via `site.static_files` — you don't list images anywhere. GLightbox (loaded from jsDelivr CDN) handles the lightbox.

### Data-driven content

- `_data/actions.yml` — upcoming events. Adding an entry here surfaces it in the homepage "Akce" section automatically (subject to the double-date-filter above). An optional `image:` path is resolved against `/assets/img/photogalleries/`.
- `_data/contacts.yml` — people cards in the "Kontakty" section.

### Feature flags in `_config.yml`

`trainings: on/off` toggles whether the weekly rehearsal message is shown as active or struck-through. Used to disable it during breaks (e.g., COVID). **`_config.yml` changes are not hot-reloaded** — restart `jekyll serve`.

### JS assets

The site loads `/assets/js/kruspanek.min.js` (not `kruspanek.js`). Both files are committed. Since the Gulp minification step was removed, **if you change `kruspanek.js` you must manually update `kruspanek.min.js`** — or point `default.html` at the unminified file.

### Styles

`assets/kruspanek.min.scss` is the entry point (has the required front matter for Jekyll to process it); it imports `_sass/kruspanek.scss`, which in turn imports all partials. Despite the `.min` in the filename, Jekyll compresses it via `sass: style: compressed` in `_config.yml`.
