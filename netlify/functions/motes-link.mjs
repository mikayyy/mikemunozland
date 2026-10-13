import { safeUrl, embedFor } from "../../public/admin/motes-core.mjs";
export default async function resolveMoteLink(request) {
  const json = (body, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  if (request.method !== "GET") return json({ error: "Use GET." }, 405);
  const supplied = new URL(request.url).searchParams.get("url") || "";
  const url = safeUrl(supplied);
  // Resolve only LinkedIn's known short-link endpoint; never fetch arbitrary URLs.
  if (
    !url ||
    url.hostname !== "lnkd.in" ||
    !/^\/p\/[A-Za-z0-9_-]+\/?$/.test(url.pathname) ||
    url.search
  )
    return json({ error: "Use an lnkd.in/p/ post link." }, 400);
  try {
    const response = await fetch(url.href, {
      redirect: "manual",
      signal: AbortSignal.timeout(5000),
    });
    const target = safeUrl(response.headers.get("location"));
    if (
      !target ||
      !["www.linkedin.com", "linkedin.com"].includes(target.hostname) ||
      !embedFor(target.href)
    )
      return json(
        {
          error:
            "Could not resolve this post. Paste LinkedIn’s Embed this post code instead.",
        },
        422,
      );
    return json({ url: target.origin + target.pathname });
  } catch {
    return json(
      {
        error:
          "LinkedIn could not be reached. Keep the link and add its embed code instead.",
      },
      502,
    );
  }
}
