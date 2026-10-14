(() => {
  // GA4 runs only on the public website, after the reader allows analytics.
  const script = document.currentScript;
  const measurementId = script?.dataset.measurementId;
  if (!/^G-[A-Z0-9]+$/.test(measurementId || '') || location.pathname.startsWith('/admin')) return;
  const production = ['mikemunozland.com', 'www.mikemunozland.com'].includes(location.hostname);
  const preferenceKey = 'portfolio-analytics-consent';
  let started = false;
  let allowed = false;
  let preference;
  try { preference = localStorage.getItem(preferenceKey); } catch { /* Choice remains session-only. */ }
  const cleanUrl = value => {
    if (!value) return '';
    try { const url = new URL(value, location.href); return url.origin + url.pathname; }
    catch { return ''; }
  };
  function start() {
    // Protected previews can show the controls, but never send data to GA4.
    if (!production) return;
    allowed = true;
    window[`ga-disable-${measurementId}`] = false;
    if (started) {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
      return;
    }
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied',
    });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      allow_google_signals: false, allow_ad_personalization_signals: false,
      page_location: cleanUrl(location.href), page_referrer: cleanUrl(document.referrer),
    });
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(tag);
  }
  function event(name, parameters = {}) {
    if (allowed && window.gtag) window.gtag('event', name, parameters);
  }
  function choose(value) {
    try { localStorage.setItem(preferenceKey, value); } catch { /* No storage required. */ }
    preference = value;
    if (value === 'granted') start();
    else {
      allowed = false;
      window[`ga-disable-${measurementId}`] = true;
      if (window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied' });
      // Remove the analytics cookies created by this site when consent is withdrawn.
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.trim().split('=')[0];
        if (!/^_ga(?:_|$)/.test(name)) return;
        ['', '; domain=' + location.hostname, '; domain=.mikemunozland.com'].forEach(domain => {
          document.cookie = `${name}=; Max-Age=0; path=/${domain}; SameSite=Lax`;
        });
      });
    }
    notice.hidden = true;
  }
  const notice = document.createElement('aside');
  notice.className = 'analytics-notice';
  notice.setAttribute('aria-label', 'Optional website analytics');
  notice.innerHTML = '<p><strong>Help me understand what’s useful.</strong> Allow Google Analytics cookies to measure page visits, engagement time, and clicks? Netlify also measures basic server traffic. You can change this choice below.</p><div><button type="button" data-choice="granted">Allow analytics</button><button type="button" data-choice="denied">No thanks</button></div>';
  notice.querySelectorAll('[data-choice]').forEach(button => {
    button.addEventListener('click', () => choose(button.dataset.choice));
  });
  notice.hidden = ['granted', 'denied'].includes(preference);
  document.body.append(notice);
  const preferences = document.createElement('button');
  preferences.type = 'button';
  preferences.className = 'analytics-preferences';
  preferences.textContent = 'Analytics preferences';
  preferences.addEventListener('click', () => {
    notice.hidden = false;
    notice.querySelector('button').focus();
  });
  (document.querySelector('footer .footer-inner') || document.body).append(preferences);
  if (preference === 'granted') start();
  document.addEventListener('click', click => {
    const link = click.target instanceof Element ? click.target.closest('a[href]') : null;
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (['mailto:', 'tel:'].includes(url.protocol)) {
      event('contact_click', { contact_method: url.protocol === 'mailto:' ? 'email' : 'phone' });
    } else if (url.origin === location.origin) {
      const project = url.pathname.match(/^\/work\/([^/]+)\/?$/);
      const mote = url.pathname.match(/^\/motes\/([^/]+)\/?$/);
      if (project) event('portfolio_open', { project_slug: project[1] });
      else if (url.pathname.replace(/\/$/, '') === '/the-margin') event('experience_open', { experience: 'the-margin' });
      else if (mote && !['rss.xml', 'page'].includes(mote[1])) event('mote_open', { mote_slug: mote[1] });
      else if (url.hash) event('section_click', { section_id: url.hash.slice(1) });
    }
  });
  // The experience sends milestones only, never decisions or free-text answers.
  document.addEventListener('portfolio:experience', message => {
    if (!['start', 'complete', 'replay'].includes(message.detail?.milestone)) return;
    event('experience_' + message.detail.milestone, { experience: 'the-margin' });
  });
})();
