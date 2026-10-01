# Michael Muñoz portfolio

Static Astro portfolio at **https://mikemunozland.com**, with three short case-study overviews, downloadable PDFs, and the playable Margin field journal.

## Run locally

Use Node.js 22.12 or newer. Install dependencies with `npm ci`, then build with `npm run build` and review that build with `npm run preview`. Astro prints the local preview address. For development-server management, follow [AGENTS.md](AGENTS.md).

## Where to edit

- `src/pages/index.astro`: homepage content.
- `src/components/SiteHeader.astro`: shared navigation, including the native mobile menu.
- `src/components/SiteMetadata.astro`: search and sharing metadata.
- `src/pages/work/`: the three brief project overviews.
- `src/styles/portfolio.css` and `src/styles/case-study.css`: the established website styling and case-study rules.
- `public/downloads/`: the approved case-study PDFs served by the website.
- `src/content/` and `scripts/build-*-pdf.py`: source copy and optional PDF rebuilders.
- `public/margin-prototype/`: the imported playable experience. Its independent visual identity is intentional.

The site builds to `dist/` and does not need a database, UI framework, Python, or font files at runtime. The PDFs and brand assets are checked in. Optional document/asset rebuilders use Pillow, ReportLab, and Windows fonts; `PORTFOLIO_FONT_DIR` can point to equivalent available fonts.

## Domain and discoverability

`astro.config.mjs` defaults to the approved production origin, `https://mikemunozland.com`. If the primary domain changes, set `PUBLIC_SITE_URL` to its absolute origin at build time. Canonical links, sharing URLs, `robots.txt`, and `sitemap.xml` use that origin. Do not use a deploy-preview URL as the production origin.

Update the five-route list in `src/pages/sitemap.xml.ts` when adding public pages. The branded 404 is excluded from the sitemap and requests no indexing. Metadata configuration does not connect DNS, publish a domain, or remove hosting access protection.

## Before merging website changes

Build successfully, inspect mobile and desktop layouts, verify keyboard skip/focus behavior, test the mobile menu (including Escape and navigation without JavaScript), and exercise the case-study links, actual PDF downloads, and the Margin launch/return flow. Keep audience estimates, reaction feedback, proposed changes, and measured outcomes distinct when editing copy.

Current validation and content limitations are recorded in [CONTENT-NOTES.md](CONTENT-NOTES.md). The downloadable PDFs are visually reviewed but are not tagged for assistive technology.
