// Shared by the website, editor preview, and tests. Never render pasted HTML.
export function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url
      : null;
  } catch {
    return null;
  }
}

export function embedFor(source, override = "") {
  const pasted = override.trim();
  const extracted = pasted.startsWith("<")
    ? pasted.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1]
    : pasted;
  const explicit = safeUrl(extracted);
  // A copied iframe may contribute its URL, but none of its executable markup.
  if (
    explicit &&
    ["www.linkedin.com", "linkedin.com"].includes(explicit.hostname)
  ) {
    const match = explicit.pathname.match(
      /^\/embed\/feed\/update\/(urn:li:(?:ugcPost|share|activity):\d+)\/?$/,
    );
    if (match)
      return {
        provider: "linkedin",
        src: `https://www.linkedin.com/embed/feed/update/${match[1]}?collapsed=1`,
        height: 594,
      };
  }
  const url = safeUrl(source);
  if (!url) return null;
  if (url.hostname === "open.spotify.com") {
    const match = url.pathname.match(
      /^\/(track|album|playlist|episode|show)\/([A-Za-z0-9]+)\/?$/,
    );
    if (match)
      return {
        provider: "spotify",
        src: `https://open.spotify.com/embed/${match[1]}/${match[2]}`,
        height: match[1] === "track" ? 152 : 352,
      };
  }
  if (
    ["www.youtube.com", "youtube.com", "m.youtube.com", "youtu.be"].includes(
      url.hostname,
    )
  ) {
    const video =
      url.hostname === "youtu.be"
        ? url.pathname.slice(1)
        : url.searchParams.get("v") ||
          url.pathname.match(/^\/(?:shorts|embed)\/([\w-]{11})/)?.[1];
    const playlist = url.searchParams.get("list");
    if (playlist && /^[\w-]+$/.test(playlist))
      return {
        provider: "youtube",
        src: `https://www.youtube-nocookie.com/embed/videoseries?list=${playlist}`,
        height: 405,
      };
    if (video && /^[\w-]{11}$/.test(video))
      return {
        provider: "youtube",
        src: `https://www.youtube-nocookie.com/embed/${video}`,
        height: 405,
      };
  }
  if (["www.linkedin.com", "linkedin.com"].includes(url.hostname)) {
    const urn = url.pathname.match(
      /\/feed\/update\/(urn:li:(?:ugcPost|share|activity):\d+)/,
    )?.[1];
    const post = url.pathname.match(
      /-(ugcPost|share|activity)-(\d+)(?:-|\/|$)/,
    );
    if (urn || post)
      return {
        provider: "linkedin",
        src: `https://www.linkedin.com/embed/feed/update/${urn || `urn:li:${post[1]}:${post[2]}`}?collapsed=1`,
        height: 594,
      };
  }
  // Short lnkd.in links cannot be inferred without following the redirect.
  // Preserve them as links; a copied embed URL is the deterministic fallback.
  return null;
}

export function selectMotes(
  entries,
  { preview = false, now = Date.now() } = {},
) {
  return entries
    .filter(
      ({ data }) =>
        preview ||
        (!data.draft &&
          !data.sample &&
          new Date(data.publishedAt).getTime() <= now),
    )
    .sort(
      (a, b) =>
        new Date(b.data.publishedAt) - new Date(a.data.publishedAt) ||
        a.id.localeCompare(b.id),
    );
}

export function excerpt(body, summary = "", limit = 200) {
  const plain = (summary || body || "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/[#*_`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= limit) return plain;
  return plain.slice(0, limit).replace(/\s+\S*$/, "") + "…";
}

export function postTitle(entry) {
  return (
    entry.data.title ||
    excerpt(entry.body, entry.data.summary, 65) ||
    "A Mote from Michael"
  );
}
export function postUrl(entry) {
  return `/motes/${entry.id}/`;
}
export function dateLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(date));
}
export function sourceLabel(value) {
  return safeUrl(value)?.hostname.replace(/^www\./, "") || "source";
}
