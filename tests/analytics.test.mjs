import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../public/analytics.js', import.meta.url), 'utf8');
function browser(host = 'mikemunozland.com', stored = null) {
  const choices = {};
  const listeners = {};
  const tags = [];
  const elements = [];
  const storage = new Map(stored ? [['portfolio-analytics-consent', stored]] : []);
  const makeElement = () => ({
    hidden: false, dataset: {}, focus() {}, append() {}, setAttribute() {},
    addEventListener(name, callback) { this[name] = callback; },
    querySelector() { return { focus() {} }; },
    querySelectorAll() {
      return ['granted', 'denied'].map(choice => {
        const button = { dataset: { choice }, addEventListener(name, callback) { choices[choice] = callback; } };
        return button;
      });
    },
  });
  const document = {
    currentScript: { dataset: { measurementId: 'G-GF11NXLK02' } },
    referrer: '', cookie: '',
    head: { append(tag) { tags.push(tag); } },
    body: { append(element) { elements.push(element); } },
    createElement: makeElement, querySelector() { return null; },
    addEventListener(name, callback) { listeners[name] = callback; },
  };
  const window = {};
  vm.runInNewContext(source, { document, window, location: { hostname: host, pathname: '/', href: `https://${host}/?private=test#section`, origin: `https://${host}` }, localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) }, URL, Element: class {} });
  return { choices, tags, window, listeners, storage, elements };
}

test('no Google tag before consent; acceptance enables only analytics', () => {
  const b = browser();
  assert.equal(b.tags.length, 0);
  b.choices.granted();
  assert.equal(b.tags.length, 1);
  const commands = b.window.dataLayer.map(command => Array.from(command));
  const defaults = commands.find(command => command[0] === 'consent')[2];
  assert.equal(defaults.ad_storage, 'denied');
  const config = commands.find(command => command[0] === 'config')[2];
  assert.equal(config.page_location, 'https://mikemunozland.com/');
  assert.equal(config.page_referrer, '');
  assert.equal(config.allow_google_signals, false);
});
test('refusal persists and withdrawal stops milestone events', () => {
  assert.equal(browser('mikemunozland.com', 'denied').tags.length, 0);
  const b = browser();
  b.choices.granted();
  b.choices.denied();
  const count = b.window.dataLayer.length;
  b.listeners['portfolio:experience']({ detail: { milestone: 'complete' } });
  assert.equal(b.window.dataLayer.length, count);
  assert.equal(b.storage.get('portfolio-analytics-consent'), 'denied');
  assert.equal(b.window['ga-disable-G-GF11NXLK02'], true);
});
test('preview never loads Google, even after accepting', () => {
  const b = browser('deploy-preview-10--lovely-semolina-caf3a0.netlify.app');
  b.choices.granted();
  assert.equal(b.tags.length, 0);
  assert.equal(b.window.gtag, undefined);
});
