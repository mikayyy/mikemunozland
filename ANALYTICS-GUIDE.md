# Website analytics

Netlify Web Analytics was enabled October 13, 2026. It reports server-side pageviews, IP-based unique visitors, popular pages, sources, and geography. These totals can include bots and our own testing; they are not a count of recruiters or hiring managers.

Google Analytics 4: property `mikemunozland.com`, stream `Portfolio website`, public measurement ID `G-GF11NXLK02`. Reporting timezone: New York. Optional account data sharing was disabled during setup. Enhanced measurement covers pageviews, scrolls, outbound links, file downloads, and supported embedded YouTube videos. Engagement time measures foreground activity, not comprehension.

GA4 loads only on the production domain after a reader chooses Allow analytics. No thanks prevents the tag from loading. Analytics preferences lets readers change their choice; withdrawal disables tracking and clears the site’s GA cookies. Admin pages and protected/local previews do not send GA4 events. Preview builds show the choice UI for review only.

## Custom events

| Event | Meaning | Parameter |
| --- | --- | --- |
| portfolio_open | Click to a portfolio overview | project_slug |
| mote_open | Click to an individual Mote | mote_slug |
| contact_click | Click an email or phone link | contact_method |
| section_click | Click a same-site section link | section_id |
| experience_open | Click a link to The Margin experience | experience |
| experience_start | Leave The Margin cover page | experience |
| experience_complete | Reach its Trail Debrief | experience |
| experience_replay | Click replay | experience |

No decision selections or learner responses are sent. Clicks indicate intent: email clicks do not prove a sent message, PDF clicks do not prove reading, and reaching the debrief does not prove learning. Embedded Spotify/LinkedIn interactions are outside the site's own event tracking. Automatic YouTube video events require the embed's JavaScript API support; they are not currently promised.

Netlify and GA4 totals will differ. GA4 represents consenting, unblocked browsers; Netlify uses server traffic. Keep those populations separate. Reports can take time to populate, and historical GA4 clicks or engagement cannot be recovered before installation. Use Realtime to confirm initial visits.
