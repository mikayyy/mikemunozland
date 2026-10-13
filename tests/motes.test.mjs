import test from "node:test";
import assert from "node:assert/strict";
import {
  embedFor,
  safeUrl,
  selectMotes,
  excerpt,
} from "../src/lib/motes-core.mjs";

test("copied LinkedIn code yields only the approved iframe URL", () => {
  const pasted =
    '<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7515503463791874048?collapsed=1" height="594" width="504" onload="alert(1)"></iframe>';
  assert.deepEqual(embedFor("https://lnkd.in/p/e62buY8M", pasted), {
    provider: "linkedin",
    src: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7515503463791874048?collapsed=1",
    height: 594,
  });
  assert.equal(
    embedFor(
      "",
      '<iframe src="https://www.linkedin.com.evil.example/embed/feed/update/urn:li:ugcPost:1"></iframe>',
    ),
    null,
  );
  assert.equal(embedFor("https://lnkd.in/p/e62buY8M"), null);
  assert.equal(
    embedFor(
      "https://www.linkedin.com/posts/michaellxd_test-ugcPost-7515503463791874048-8od_/",
    ).src,
    "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7515503463791874048?collapsed=1",
  );
});
test("only recognized providers and HTTPS sources are allowed", () => {
  assert.equal(safeUrl("javascript:alert(1)"), null);
  assert.equal(safeUrl("https://secret@www.linkedin.com/"), null);
  assert.equal(
    embedFor("https://www.youtube.com/watch?v=M7lc1UVf-VE").provider,
    "youtube",
  );
  assert.equal(
    embedFor("https://www.youtube.com/playlist?list=PL123").provider,
    "youtube",
  );
  assert.equal(
    embedFor("https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO").height,
    352,
  );
  assert.equal(embedFor("https://open.spotify.com/track/abc").height, 152);
  assert.equal(embedFor("https://example.com/playlist"), null);
});
test("production excludes drafts, future posts and samples even if a sample is published", () => {
  const entries = [
    {
      id: "published",
      data: { publishedAt: "2026-10-01", draft: false, sample: false },
    },
    {
      id: "draft",
      data: { publishedAt: "2026-10-02", draft: true, sample: false },
    },
    {
      id: "sample",
      data: { publishedAt: "2026-10-03", draft: false, sample: true },
    },
    {
      id: "future",
      data: { publishedAt: "2030-01-01", draft: false, sample: false },
    },
  ];
  assert.deepEqual(
    selectMotes(entries, { now: Date.parse("2026-10-13") }).map((e) => e.id),
    ["published"],
  );
  assert.equal(selectMotes(entries, { preview: true }).length, 4);
});
test("homepage excerpts remove media and retain readable link text", () => {
  assert.equal(
    excerpt(
      "![photo](x.png) A [useful link](https://example.com) and **words**.",
    ),
    "A useful link and words.",
  );
  assert.equal(excerpt("ignored", "Chosen summary"), "Chosen summary");
});
