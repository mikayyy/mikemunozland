// Add presentation-only sections without changing Decap's flat content fields.
// Existing input nodes stay in place, preserving their values and event handlers.
const advancedNames = ['updatedAt', 'draft', 'linkedinEmbed', 'conversationUrl'];
let expanded = false;
let pending = false;

function field(name) {
  return document.querySelector(`#nc-root [id^="${name}-field-"]`)
    ?.closest('[aria-label$=" field"]');
}

function headingBefore(target, id, title, description) {
  if (!target || document.getElementById(id)) return;
  const section = document.createElement('div');
  section.id = id;
  section.className = 'motes-editor-heading';
  const heading = document.createElement('h2');
  heading.textContent = title;
  const help = document.createElement('p');
  help.textContent = description;
  section.append(heading, help);
  target.before(section);
}

function enhance() {
  pending = false;
  if (!field('slug')) return;
  headingBefore(field('slug'), 'motes-write-heading', 'Write your Mote',
    'Start here. A URL name, publication date, and your words are all you need.');
  headingBefore(field('type'), 'motes-link-heading', 'Share a link',
    'Optional: point readers to an article or post. LinkedIn posts can appear here automatically.');
  headingBefore(field('media'), 'motes-media-heading', 'Add images or players',
    'Optional: include pictures, music, or videos inside your Mote.');

  const advanced = advancedNames.map(field).filter(Boolean);
  if (!advanced.length) return;
  let toggle = document.getElementById('motes-advanced-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.id = 'motes-advanced-toggle';
    toggle.className = 'motes-advanced-toggle';
    toggle.textContent = 'Advanced options';
    toggle.addEventListener('click', () => {
      expanded = !expanded;
      enhance();
    });
    advanced[0].before(toggle);
  }
  const controlled = [];
  advancedNames.forEach(name => {
    const container = field(name);
    if (!container) return;
    container.id = `motes-advanced-${name}`;
    container.hidden = !expanded;
    controlled.push(container.id);
  });
  toggle.setAttribute('aria-expanded', String(expanded));
  toggle.setAttribute('aria-controls', controlled.join(' '));
}

// Decap renders and replaces controls as entries change. Decorate new controls,
// observing child changes only so our visibility attributes do not trigger loops.
new MutationObserver(() => {
  if (pending) return;
  pending = true;
  requestAnimationFrame(enhance);
}).observe(document.body, { childList: true, subtree: true });
window.addEventListener('hashchange', () => {
  expanded = false;
  document.querySelectorAll('.motes-editor-heading, .motes-advanced-toggle')
    .forEach(element => element.remove());
  enhance();
});
enhance();
