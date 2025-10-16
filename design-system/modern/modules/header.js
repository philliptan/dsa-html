// Header.js
export function createHeader(onToggleDrawer) {
  const header = document.createElement('header');
  header.className = 'app-header split';

  const button = document.createElement('button');
  button.className = 'drawer-toggle';
  button.setAttribute('aria-controls', 'drawer');
  button.setAttribute('aria-expanded', 'false');
  button.textContent = '☰';

  const title = document.createElement('h1');
  title.textContent = 'Dashboard';

  // Theme switcher
  const themeToggle = document.createElement('button');
  themeToggle.className = 'theme-toggle';
  themeToggle.textContent = '🌗';
  themeToggle.setAttribute('aria-label', 'Toggle theme');

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || 'light';
    const next = current === 'light' ? 'dark' : current === 'dark' ? 'ocean' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
  });

  // Restore saved theme
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.dataset.theme = saved;

  if (!saved) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
  }

  const left = document.createElement('div');
  left.className = 'cluster align-center';
  left.append(button, title);

  header.append(left, themeToggle);
  return header;
}
