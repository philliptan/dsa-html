// components-dropdown.js
export function setupDropdowns() {
  document.querySelectorAll('.dropdown').forEach(drop => {
    const trigger = drop.querySelector('.dropdown-trigger');
    const menu = drop.querySelector('.dropdown-menu');
    trigger.addEventListener('click', () => {
      const open = menu.dataset.open === 'true';
      menu.dataset.open = (!open).toString();
    });
    document.addEventListener('click', (e) => {
      if (!drop.contains(e.target)) menu.dataset.open = 'false';
    });
  });
}
