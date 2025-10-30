// components-tooltip.js
export function setupTooltips() {
  document.querySelectorAll('.tooltip').forEach(el => {
    el.addEventListener('mouseenter', () => el.dataset.show = 'true');
    el.addEventListener('mouseleave', () => el.dataset.show = 'false');
    el.addEventListener('focus', () => el.dataset.show = 'true');
    el.addEventListener('blur', () => el.dataset.show = 'false');
  });
}
