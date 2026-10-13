# Publishing Motes

The reading experience and `/admin/` editor are implemented on the Motes branch. GitHub sign-in and the create/save/edit/image-upload/publish workflow were verified on October 13, 2026. No production release or real Mote has been published. During the publishing trial the CMS targets `feature/motes`, so Publish merges only into that review branch. Change the backend branch to `main` before the approved release.

## Draft visibility

The website repository is public. Editorial drafts stored on GitHub branches are therefore public source files, even when a deploy preview is private. Keep private family/client/employer details out of drafts too. Editing requires an authenticated GitHub account with repository write permission. The configured OAuth scope is `public_repo`: it excludes private repositories but can grant access to other public repositories accessible to the author, not only this website. Review that grant before connecting; a connection limited to one repository would require a different authentication setup.

## Once connected

1. Visit `/admin/`, sign in with GitHub, and choose Motes → New Mote.
2. Enter a stable post address, such as `a-small-ai-experiment`. Heading and short excerpt are optional; the site can derive them from your writing.
3. Write your commentary. For a link post, choose link as the post style and enter a source link and title.
4. Recognized LinkedIn post URLs embed automatically. `lnkd.in/p/` short links resolve when you leave the field if the Netlify resolver is available. If resolution fails, keep the link and paste the official Embed this post code into the LinkedIn field. Only its approved iframe URL is used.
5. Add optional images, Spotify/YouTube/LinkedIn links, small MP4 videos or MP3/M4A audio. Add image descriptions and transcripts/text alternatives where appropriate. Images/audio: 5 MB per file. Video: 10 MB. Total: 20 MB per Mote. Use supported external players for larger media.
6. Save draft and preview before publishing. Change Status to Ready, then choose Publish → Publish now and confirm. Keep Hide from the live website off for normal publication. Drafts stay on editorial branches until Publish; that action merges them and triggers a build.
7. Wait for Netlify to finish rebuilding, then check the public page. The homepage automatically shows the latest three published Motes.

Players load near the viewport and never autoplay. Email replies open a draft in the reader's mail app; nothing is sent automatically. There are no local comments or moderation tasks.

Keep addresses unchanged after publishing. Future dates hide entries but do not schedule a rebuild. Embeds can become unavailable, so source links remain available. Sample entries are permanently marked sample and cannot appear in production simply by switching off draft.

## Release still required

- Owner authorization and OAuth connection are complete. The authenticated trial passed, including an uploaded image and deployed LinkedIn short-link resolution. The temporary entry and uploaded file were removed afterward.
- The trial deployed through PR #5's protected preview. Editorial PR #6 targeted the review branch and did not receive a separate Netlify draft preview; verify the editor's external draft-preview link after switching its backend to `main`. Only protected previews should set `MOTES_PREVIEW=true`; Netlify production excludes drafts/samples regardless of that flag.
- An approved first real Mote and owner approval before merging the feature branch.

When Codex tests file uploads through Chrome, the ChatGPT extension needs Allow access to file URLs enabled. Ordinary manual uploads do not depend on that automation setting.

## Verification

Run `node --test tests/motes.test.mjs` for URL handling and filtering. Run `node scripts/verify-motes-build.mjs` for temporary-fixture tests of pagination, latest three, RSS/sitemap exclusion, sanitization, metadata, unchanged PDFs and oversize rejection. It restores a sample preview build.

Individual CMS media fields apply their upload caps; build validation also checks existing files selected from the library and total attachments. These checks do not impose a blanket cap on the global media library or GitHub storage.
