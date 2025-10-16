import { components } from './components.js';

// --- DOM references ---
const drawer = document.querySelector('.app-drawer');
const toggle = document.querySelector('.drawer-toggle');
const backdrop = document.querySelector('.drawer-backdrop');
const list = document.querySelector('.component-list');
const title = document.getElementById('component-title');
const demo = document.getElementById('component-demo');
const codeViewer = document.getElementById('code-viewer');

// --- Populate sidebar ---
list.innerHTML = components
  .map(c => `<a href="#" data-component="${c.name}">${c.label}</a>`)
  .join('');

// --- Drawer toggle ---
toggle.addEventListener('click', () => {
  drawer.classList.toggle('open');
  backdrop.classList.toggle('active');
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', !expanded);
});

backdrop.addEventListener('click', () => {
  drawer.classList.remove('open');
  backdrop.classList.remove('active');
  toggle.setAttribute('aria-expanded', false);
});

// --- Component loading functions ---
async function loadComponent(name) {
  try {
    // Load HTML
    const res = await fetch(`components/${name}/${name}.html`);
    const html = await res.text();
    demo.innerHTML = html;

    // Update title
    title.textContent = name.charAt(0).toUpperCase() + name.slice(1);

    // Load CSS & JS
    await Promise.all([loadCSS(name), loadJS(name)]);

    // Hide code viewer
    codeViewer.classList.add('hidden');
    codeViewer.textContent = '';
  } catch (err) {
    demo.innerHTML = `<p style="color:red;">Failed to load ${name}</p>`;
    console.error(err);
  }
}

async function loadCSS(name) {
  if (document.querySelector(`style[data-component="${name}"]`)) return;
  try {
    const res = await fetch(`components/${name}/${name}.css`);
    if (!res.ok) return;
    const css = await res.text();
    const style = document.createElement('style');
    style.dataset.component = name;
    style.textContent = css;
    document.head.appendChild(style);
  } catch { }
}

async function loadJS(name) {
  try {
    const module = await import(`../components/${name}/${name}.js`);
    if (module.init) module.init();
  } catch {
    // No JS = fine
  }
}

// --- Sidebar click handler ---
list.addEventListener('click', async e => {
  const link = e.target.closest('a[data-component]');
  if (!link) return;
  e.preventDefault();
  const name = link.dataset.component;
  await loadComponent(name);
});

// --- Toolbar code viewer ---
['html', 'css', 'js'].forEach(type => {
  document.getElementById(`show-${type}`).addEventListener('click', async () => {
    const current = title.textContent.toLowerCase();
    if (!current || current === 'select a component') return;

    const path = `components/${current}/${current}.${type}`;
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('missing');
      const code = await res.text();
      codeViewer.textContent = code;
      codeViewer.classList.toggle('hidden');
    } catch {
      codeViewer.textContent = `No ${type.toUpperCase()} file for ${current}`;
      codeViewer.classList.remove('hidden');
    }
  });
});
