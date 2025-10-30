// components-switch.js
export function setupSwitches() {
  document.querySelectorAll('.switch').forEach(sw => {
    sw.addEventListener('click', () => {
      const state = sw.dataset.on === 'true';
      sw.dataset.on = (!state).toString();
    });
  });
}
