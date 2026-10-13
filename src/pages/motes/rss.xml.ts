import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPublishedMotes } from '../../lib/motes';
import { excerpt, postTitle, postUrl } from '../../lib/motes-core.mjs';
export const GET: APIRoute = async ({site}) => {
  if(!site)throw new Error('RSS needs the production site URL.');
  return rss({title:'Motes — Michael Muñoz',description:'What I’m making, listening to, and thinking about.',site,items:(await getPublishedMotes()).map(entry=>({title:postTitle(entry),pubDate:entry.data.publishedAt,description:excerpt(entry.body,entry.data.summary,500),link:postUrl(entry),categories:entry.data.topics}))});
};
