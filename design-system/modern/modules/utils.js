// modules/utils.js
export function fadeIn(el, duration = 250) {
  el.style.opacity = "0";
  el.style.transition = `opacity ${duration}ms ease-in-out`;
  requestAnimationFrame(() => {
    el.style.opacity = "1";
  });
}
