import type { APIRoute } from 'astro';
import { getPublishedMotes } from '../lib/motes';
import { postUrl } from '../lib/motes-core.mjs';

// Keep this list aligned with the five public portfolio routes.
const routes = ['/', '/work/the-margin', '/work/delivery-lead-bootcamp', '/work/cti-learning-architecture', '/the-margin', '/motes/'];
const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('A production site URL is required for the sitemap.');
  const entries=await getPublishedMotes();
  const pages=Array.from({length:Math.max(0,Math.ceil(entries.length/10)-1)},(_,i)=>`/motes/page/${i+2}/`);
  const urls = [...routes,...entries.map(postUrl),...pages].map(route => `<url><loc>${escapeXml(new URL(route, site).href)}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
