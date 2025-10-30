// components-tabs.js
export function setupTabs() {
  document.querySelectorAll('.tabs').forEach(tabContainer => {
    const tabs = tabContainer.querySelectorAll('.tab');
    const panels = tabContainer.querySelectorAll('.tab-panel');

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => activate(i));
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') activate((i + 1) % tabs.length);
        if (e.key === 'ArrowLeft') activate((i - 1 + tabs.length) % tabs.length);
      });
    });

    function activate(index) {
      tabs.forEach((t, j) => {
        const selected = j === index;
        t.setAttribute('aria-selected', selected);
        panels[j].hidden = !selected;
      });
    }
    activate(0); // default
  });
}
