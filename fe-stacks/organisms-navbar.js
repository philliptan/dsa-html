// organisms-navbar.js
export function setupNavbar() {
  const navbar = document.querySelector('.navbar');
  const menuBtn = document.querySelector('#menu-toggle');
  const themeBtn = document.querySelector('#theme-toggle');

  menuBtn.addEventListener('click', () => {
    const open = navbar.dataset.menuOpen === 'true';
    navbar.dataset.menuOpen = (!open).toString();
  });

  themeBtn.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
  });
}
