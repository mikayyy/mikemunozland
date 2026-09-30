# Launch routes and remaining content

The homepage uses `michael-munoz-portfolio.html` from the user's Downloads folder as its canonical source. Original CSS and content outside Selected Work are preserved, apart from the user's requested PwC design-leadership wording.

## Structure

- `PortfolioLayout`, `SiteHeader`, and `SiteFooter` share the original shell. `src/styles/portfolio.css` contains the original CSS unchanged.
- `WorkCard` renders the three linked homepage cards and supports optional images. The Margin uses its field-journal cover; the other two await their project assets.
- `CaseStudyLayout` and `CaseStudyFigure` provide a reusable case-study structure. The six screenshots in `src/assets/margin/` are from the integrated playable prototype. Astro generates responsive WebP variants; each figure links to its original PNG for reading small interface text. Additional styles are confined to the case-study class names.
- `src/pages/the-margin.astro` contains the existing Margin field-journal HTML. Its vanilla JavaScript, CSS, and 13 WebP assets are in `public/margin-prototype/`. Absolute asset paths support both trailing-slash variants of the route. The prototype's case-study link now returns to `/work/the-margin`.
- Astro maps page filenames to routes: https://docs.astro.build/en/guides/routing/

## Still needed

1. Final review of the six selected Margin visuals: opening, signal selection, map update, recommendation builder, calibrated outcome, and debrief. These replace the visual placeholders in the review version; signal selection demonstrates the framework in use rather than introducing a diagram that is absent from the prototype.
2. Approved Delivery Lead Bootcamp copy, role/scope, artifacts, and supported outcomes.
3. Approved CT&I Learning Architecture & Strategy copy, role/scope, artifacts, and supported outcomes.
4. Learner evaluation evidence before claiming learning transfer or workplace impact.

Full branding, accessibility, mobile, navigation, and SEO review remains a later milestone. The original homepage's resume claims, contact details, and Google Fonts remain as supplied, except the approved PwC wording revision.

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

## Margin editorial review

The case study was compared with the prototype's learning-alignment notes, available choices, and rendered screens. Its introduction now describes the intended learning purpose, and the investigation response is named “pause to investigate” to match the playable Pause choice. No measured learning or workplace impact is claimed. The outcome screenshot represents one possible branch, not a guaranteed result.

The updated production build and browser checks passed with six loaded responsive figures, nonempty alternative text, working original-image links, a clickable homepage thumbnail, desktop/mobile page widths, and the existing CTA/return loop. No failed local requests or JavaScript errors were observed. Case-study length is approximately 760 words including labels, captions, and buttons.
