// components-dropdown-extended.js
export function setupDropdowns() {
  document.querySelectorAll('.dropdown').forEach(drop => {
    const trigger = drop.querySelector('.dropdown-trigger');
    const menu = drop.querySelector('.dropdown-menu');
    const items = drop.querySelectorAll('.dropdown-item');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = menu.dataset.open === 'true';
      closeAllDropdowns();
      menu.dataset.open = (!open).toString();
      if (!open) items[0]?.focus();
    });

    items.forEach((item, i) => {
      item.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') items[(i + 1) % items.length].focus();
        if (e.key === 'ArrowUp') items[(i - 1 + items.length) % items.length].focus();
        if (e.key === 'Escape') closeAllDropdowns();
      });
    });

    document.addEventListener('click', () => menu.dataset.open = 'false');
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(m => m.dataset.open = 'false');
}
