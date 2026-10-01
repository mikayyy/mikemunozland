# Launch routes and remaining content

The homepage uses `michael-munoz-portfolio.html` from the user's Downloads folder as its canonical source. Original CSS and content outside Selected Work are preserved, apart from the user's requested PwC design-leadership wording.

## Structure

- `PortfolioLayout`, `SiteHeader`, and `SiteFooter` share the original shell. `src/styles/portfolio.css` contains the original CSS unchanged.
- `WorkCard` renders the three linked homepage cards with project images: the Margin cover, Bootcamp lifecycle, and shared architecture model. Images use a consistent display area without cropping their content.
- `CaseStudyLayout` provides the shared case-study shell. The Margin route is now a short overview with one living-map screenshot and two primary actions: launch the prototype or download the fuller case study. The six screenshots in `src/assets/margin/` come from the integrated playable prototype; all six appear in the five-page PDF.
- `public/downloads/the-margin-case-study.pdf` contains the full challenge, framework, experience flow, design decisions, and reflection. Its editable copy is stored in `src/content/margin-case-study.json`. Rebuild with `python scripts/build-margin-pdf.py` using Python with `reportlab` and `Pillow` installed. The generator defaults to Windows Calibri/Georgia fonts; `PORTFOLIO_FONT_DIR` can point to a directory containing those font files. A website build copies the checked-in PDF; it does not require Python.
- `src/pages/the-margin.astro` contains the existing Margin field-journal HTML. Its vanilla JavaScript, CSS, and 13 WebP assets are in `public/margin-prototype/`. Absolute asset paths support both trailing-slash variants of the route. The prototype's case-study link now returns to `/work/the-margin`.
- Astro maps page filenames to routes: https://docs.astro.build/en/guides/routing/
- `ProjectOverview` provides the short Bootcamp and architecture pages with one visual, three points, role/context, evidence limits, and PDF download/read actions. Both are under 200 words including labels and buttons.
- `scripts/build-program-pdfs.py` rebuilds the three-page Bootcamp and two-page architecture downloads from `src/content/bootcamp-case-study.json` and `src/content/architecture-case-study.json`. It uses the same Python libraries and font setup as the Margin generator. These JSON sources retain the latest public-facing project copy; the website build serves the checked-in PDFs.

## Still needed

1. Review the new Bootcamp and Shared Learning Architecture overviews and downloads before merging their adaptation into the site. The Margin overview/download has already been approved and merged.
2. Additional measured outcome evidence if stronger performance claims are desired. The current case studies distinguish intended audience and capabilities, reported perceptions, proposed improvements, activity measures, and demonstrated outcomes.
3. The wider site review: branding consistency, accessibility, mobile usability, navigation, metadata, and final copy polish. PDFs are not tagged; assistive-technology review remains outstanding.

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

## Short overview and downloadable case study

The user requested a faster upfront page with two paths: experience the work or download the fuller design story. The overview is 181 words including labels, captions, and buttons, with one map screenshot and three brief points. The fuller case study is a five-page PDF (about 2.3 MB), retaining the earlier case-study prose and six screenshots. It states the fictional context and limits on measured outcomes; its portfolio URL is labeled as the intended public URL pending publication.

The production build passed. Browser checks verified the exact downloaded PDF bytes, filename, overview length, image loading, homepage links, prototype/return navigation, and mobile widths. Every PDF page was rendered and visually inspected. The PDF is not tagged for assistive technology; a document accessibility pass remains part of the deferred broader review.

## Remaining case studies adapted

Bootcamp uses the existing `delivery-lead-bootcamp/site-v2` v0.5.0 beta, including the three-day agenda direction and the final capstone. The latest source page, rather than older proposed document patches, provides the public copy. Existing local source files were read, not modified. The adapted PDF labels the agenda, RAID entry, and renewal excerpt as illustrative; approximately 50 remains an intended audience, not an attendance count.

Shared Learning Architecture uses the existing `cti-learning-architecture/site` page and `site/assets/architecture.svg` reconstruction. Public display naming is generic, while `/work/cti-learning-architecture` remains stable. No proprietary competency definitions or real discovery-call materials are added. The operating status is attributed to the owner's account; usage and contribution measures are not presented as business results.

Validation: production build passed. Browser checks covered both short pages, actual downloaded bytes/filenames, opening PDFs in a new tab, return links, three loaded card images, and no horizontal overflow at 320, 390, 768, and 1440 pixels. All eight PDF pages were rendered and inspected. Text extraction confirmed the existing source blocks and disclosures were retained, with no employer/vendor/internal group names. No failed local asset requests or JavaScript errors were observed.

PDF layout refinement: the final downloads return to a single reading column with 11-point body text. Three Bootcamp pages and two architecture pages balance the original sparse layout against the overly compact revision. The homepage MM mark, dark badges, rust accents, cream cards, and torn-edge polygon dividers carry the website visual language into the PDFs. The agenda and RAID regain structured typography; all source narrative and disclosures remain. All five pages were rendered and visually checked, and extracted text confirms content retention.
