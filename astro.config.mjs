// @ts-check
import { defineConfig } from 'astro/config';
import rehypeSanitize from 'rehype-sanitize';
import { unified } from '@astrojs/markdown-remark';

// Set PUBLIC_SITE_URL to the final production origin, never a preview URL.
export default defineConfig({ site: process.env.PUBLIC_SITE_URL || 'https://mikemunozland.com', markdown: { processor: unified({ rehypePlugins: [rehypeSanitize] }) } });
