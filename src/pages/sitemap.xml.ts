import type { APIRoute } from 'astro';

// Keep this list aligned with the five public portfolio routes.
const routes = ['/', '/work/the-margin', '/work/delivery-lead-bootcamp', '/work/cti-learning-architecture', '/the-margin'];
const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('A production site URL is required for the sitemap.');
  const urls = routes.map(route => `<url><loc>${escapeXml(new URL(route, site).href)}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
