# Launch routes and remaining content

The homepage uses `michael-munoz-portfolio.html` from the user's Downloads folder as its canonical source. Original CSS and all content outside Selected Work are preserved.

## Structure

- `PortfolioLayout`, `SiteHeader`, and `SiteFooter` share the original shell. `src/styles/portfolio.css` contains the original CSS unchanged.
- `WorkCard` renders the three linked homepage cards.
- `CaseStudyLayout` and `VisualPlaceholder` provide a reusable case-study structure. Additional styles are confined to the case-study class names.
- `src/pages/the-margin.astro` contains the existing Margin field-journal HTML. Its vanilla JavaScript, CSS, and 13 WebP assets are in `public/margin-prototype/`. Absolute asset paths support both trailing-slash variants of the route. The prototype's case-study link now returns to `/work/the-margin`.
- Astro maps page filenames to routes: https://docs.astro.build/en/guides/routing/

## Still needed

1. Five approved Margin visuals: opening, framework, map update, decision/outcome comparison, and debrief. Replace the matching `VisualPlaceholder` components with figures and meaningful alternative text. Existing screenshots in the original prototype folder have not been selected for publication.
2. Approved Delivery Lead Bootcamp copy, role/scope, artifacts, and supported outcomes.
3. Approved CT&I Learning Architecture & Strategy copy, role/scope, artifacts, and supported outcomes.
4. Learner evaluation evidence before claiming learning transfer or workplace impact.

Full branding, accessibility, mobile, navigation, and SEO review remains a later milestone. The original homepage's resume claims, contact details, and Google Fonts remain as supplied.

## Run locally

Requires Node.js 22.12 or newer. From the repo directory:

```sh
npm ci
npm run dev -- --background
npm run astro -- dev status
npm run astro -- dev stop
npm run build
```

The production build writes a static site to `dist/`. No database or UI framework is needed. This milestone is intended for review before merging or publishing.

## Verification completed

- `npm ci`: installed the lockfile dependencies; audit reported zero vulnerabilities.
- `npm run build`: generated all five routes successfully.
- Browser checks confirmed the original homepage CSS byte-for-byte and the text of every section outside Selected Work, all three card links, five visual placeholders, CTA and return navigation, both `/the-margin` URL variants, and mobile page widths. Screenshots were inspected for the homepage and case study.
- The existing prototype browser checks were adapted to the new route. The journal flow, four route endings, recovery branches, message preview, keyboard behavior, enlarged text, reduced motion, and responsive checks passed. The old standalone case-study check was replaced by the new portfolio navigation checks.
- No JavaScript errors or failing local asset requests were observed in the portfolio checks. Automated verification confirms function, not learning transfer.
