import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import fs from "node:fs";
import path from "node:path";
import { embedFor, safeUrl } from "./lib/motes-core.mjs";

const https = z
  .string()
  .refine((value) => !!safeUrl(value), "Use a complete HTTPS URL.");
const optionalHttps = z.preprocess(
  (value) => (value === "" ? undefined : value),
  https.optional(),
);
const localMedia = z
  .string()
  .regex(
    /^\/uploads\/motes\/[A-Za-z0-9_./-]+$/,
    "Use the Motes uploads folder.",
  )
  .refine((value) => !value.split("/").includes(".."), "Invalid upload path.");
const media = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("embed"),
    url: https,
    embedCode: z.string().default(""),
    caption: z.string().default(""),
  }),
  z.object({
    type: z.literal("image"),
    file: localMedia,
    alt: z.string().min(1),
    caption: z.string().default(""),
  }),
  z.object({
    type: z.literal("video"),
    file: localMedia,
    label: z.string().min(1),
    transcript: z.string().default(""),
    caption: z.string().default(""),
  }),
  z.object({
    type: z.literal("audio"),
    file: localMedia,
    label: z.string().min(1),
    transcript: z.string().min(1),
    caption: z.string().default(""),
  }),
]);
const motes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/motes" }),
  schema: z
    .object({
      title: z.string().default(""),
      publishedAt: z.coerce.date(),
      updatedAt: z.preprocess(
        (value) => (value === "" || value === null ? undefined : value),
        z.coerce.date().optional(),
      ),
      draft: z.boolean().default(true),
      sample: z.boolean().default(false),
      type: z.enum(["note", "link"]).default("note"),
      summary: z.string().default(""),
      topics: z.array(z.string()).max(2).default([]),
      sourceUrl: optionalHttps,
      sourceTitle: z.string().default(""),
      linkedinEmbed: z.string().default(""),
      conversationUrl: optionalHttps,
      media: z.array(media).max(8).default([]),
    })
    .superRefine((data, ctx) => {
      if (data.type === "link" && (!data.sourceUrl || !data.sourceTitle))
        ctx.addIssue({
          code: "custom",
          message: "Link posts need a source URL and source title.",
        });
      if (data.linkedinEmbed && !embedFor("", data.linkedinEmbed))
        ctx.addIssue({
          code: "custom",
          message: "Paste an official LinkedIn embed URL or its iframe code.",
        });
      let total = 0;
      for (const item of data.media) {
        if (item.type === "embed") {
          if (!embedFor(item.url, item.embedCode))
            ctx.addIssue({
              code: "custom",
              message:
                "Unsupported player URL; use Spotify, YouTube, or LinkedIn. For a short LinkedIn link, add its embed code.",
            });
          continue;
        }
        const extensions = {
          image: /\.(png|jpe?g|webp)$/i,
          video: /\.mp4$/i,
          audio: /\.(mp3|m4a)$/i,
        };
        if (!extensions[item.type].test(item.file))
          ctx.addIssue({
            code: "custom",
            message: `Unsupported ${item.type} file format.`,
          });
        try {
          const bytes = fs.statSync(
            path.resolve("public", item.file.slice(1)),
          ).size;
          total += bytes;
          if (bytes > (item.type === "video" ? 10 : 5) * 1_000_000)
            ctx.addIssue({
              code: "custom",
              message: `${item.file} exceeds its upload size limit.`,
            });
        } catch {
          ctx.addIssue({
            code: "custom",
            message: `Missing uploaded file: ${item.file}`,
          });
        }
      }
      if (total > 20_000_000)
        ctx.addIssue({
          code: "custom",
          message: "Attachments exceed 20 MB per Mote.",
        });
    }),
});
export const collections = { motes };
