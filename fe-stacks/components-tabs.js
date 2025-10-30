// components-tabs-extended.js
export function setupTabs() {
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const tabs = tabGroup.querySelectorAll('[role="tab"]');
    const panels = tabGroup.querySelectorAll('[role="tabpanel"]');

    function activate(index) {
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.setAttribute('aria-selected', active);
        tab.tabIndex = active ? 0 : -1;
        panels[i].dataset.active = active;
        panels[i].hidden = !active;
      });
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => activate(i));
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') activate((i + 1) % tabs.length);
        if (e.key === 'ArrowLeft') activate((i - 1 + tabs.length) % tabs.length);
      });
    });

    activate(0);
  });
}
