// components-tooltip-extended.js
export function setupTooltips() {
  document.querySelectorAll('.tooltip').forEach(el => {
    const show = () => el.dataset.show = 'true';
    const hide = () => el.dataset.show = 'false';
    el.addEventListener('mouseenter', show);
    el.addEventListener('mouseleave', hide);
    el.addEventListener('focus', show);
    el.addEventListener('blur', hide);
  });
}
