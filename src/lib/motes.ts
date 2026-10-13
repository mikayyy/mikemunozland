import { getCollection, type CollectionEntry } from "astro:content";
import { selectMotes } from "./motes-core.mjs";

// Preview is opt-in and can never include drafts in Netlify production builds.
export const motesPreview =
  process.env.MOTES_PREVIEW === "true" && process.env.CONTEXT !== "production";
async function entries() {
  const all = await getCollection("motes");
  if (
    all.some(
      (entry) =>
        !/^(?!page$|rss$|index$)[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id),
    )
  )
    throw new Error(
      "Motes addresses must be lowercase hyphenated words; page, rss and index are reserved.",
    );
  return all;
}
export async function getMotes(): Promise<CollectionEntry<"motes">[]> {
  return selectMotes(await entries(), { preview: motesPreview });
}
export async function getPublishedMotes(): Promise<CollectionEntry<"motes">[]> {
  return selectMotes(await entries());
}
