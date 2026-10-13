import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const root = process.cwd(),
  created = [];
const build = (extra = {}) =>
  execFileSync(
    process.execPath,
    ["node_modules/astro/bin/astro.mjs", "build"],
    {
      cwd: root,
      env: {
        ...process.env,
        MOTES_PREVIEW: "true",
        CONTEXT: "production",
        ...extra,
      },
      stdio: "pipe",
    },
  );
function fixture(relative, body) {
  const target = path.join(root, relative);
  assert(!fs.existsSync(target), `Refusing to overwrite ${target}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, body);
  created.push(target);
  return target;
}
const read = (p) => fs.readFileSync(path.join(root, "dist", p), "utf8");
try {
  for (let i = 1; i <= 12; i++)
    fixture(
      `src/content/motes/verification-${String(i).padStart(2, "0")}.md`,
      `---\ntitle: Verification ${i}\npublishedAt: "2020-01-${String(i).padStart(2, "0")}T12:00:00Z"\ndraft: false\nsample: false\n---\nA verification fixture, never published.\n\n<script>window.BAD_MOTE=true</script>\n\n[unsafe](javascript:alert(1))\n`,
    );
  fixture(
    "src/content/motes/verification-future.md",
    '---\ntitle: FUTURE_SENTINEL\npublishedAt: "2099-01-01T00:00:00Z"\ndraft: false\n---\nFuture sentinel.',
  );
  build();
  const home = read("index.html"),
    feed = read("motes/index.html"),
    rss = read("motes/rss.xml"),
    sitemap = read("sitemap.xml");
  assert(
    home.includes("Verification 12") &&
      home.includes("Verification 11") &&
      home.includes("Verification 10"),
  );
  assert.equal((home.match(/class="home-mote"/g) || []).length, 3);
  assert(!home.includes("<iframe"));
  assert.equal((feed.match(/class="mote"/g) || []).length, 10);
  assert(fs.existsSync(path.join(root, "dist/motes/page/2/index.html")));
  assert.equal((rss.match(/<item>/g) || []).length, 12);
  assert(sitemap.includes("/motes/page/2/"));
  assert(
    !rss.includes("sample-") &&
      !sitemap.includes("sample-") &&
      !feed.includes("FUTURE_SENTINEL"),
  );
  const post = read("motes/verification-12/index.html");
  assert(
    !post.includes("window.BAD_MOTE") && !post.includes('href="javascript:'),
  );
  assert(post.includes('property="og:type" content="article"'));
  assert(post.includes("https://mikemunozland.com/motes/verification-12"));
  for (const file of [
    "delivery-lead-bootcamp-case-study.pdf",
    "shared-learning-architecture-case-study.pdf",
    "the-margin-case-study.pdf",
  ]) {
    const source = path.join(root, "public/downloads", file);
    if (fs.existsSync(source))
      assert(
        fs
          .readFileSync(source)
          .equals(fs.readFileSync(path.join(root, "dist/downloads", file))),
      );
  }
  fixture(
    "public/uploads/motes/verification-oversize.png",
    Buffer.alloc(5_000_001),
  );
  fixture(
    "src/content/motes/verification-oversize.md",
    '---\ntitle: Oversize check\npublishedAt: "2020-01-01"\ndraft: false\nmedia:\n  - type: image\n    file: /uploads/motes/verification-oversize.png\n    alt: Oversize verification file\n---\nValidation fixture.',
  );
  assert.throws(() => build(), /upload size limit/);
  console.log(
    "PASS: 12-post pagination, latest three, RSS/sitemap exclusion, production override, sanitized Markdown, article metadata, approved PDF bytes and oversize rejection.",
  );
} finally {
  // Only remove the exact fixture paths created by this run, never a directory.
  created.forEach((file) => fs.unlinkSync(file));
}
build();
assert(!read("index.html").includes("Latest "));
assert(read("motes/index.html").includes("The first Motes are on their way"));
assert(
  !fs.existsSync(path.join(root, "dist/motes/sample-linkedin/index.html")),
);
assert(!read("motes/rss.xml").includes("<item>"));
assert(!read("sitemap.xml").includes("sample-"));
build({ CONTEXT: "deploy-preview" });
assert(fs.existsSync(path.join(root, "dist/motes/sample-linkedin/index.html")));
assert(read("motes/sample-linkedin/index.html").includes("noindex"));
assert(!read("motes/rss.xml").includes("sample-"));
console.log(
  "PASS: empty production state, sample routes excluded, preview restored with noindex; feed still excludes samples.",
);
