// organisms-sidebar.js
export function setupSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const toggle = sidebar.querySelector('.sidebar__toggle');
  toggle.addEventListener('click', () => {
    const collapsed = sidebar.dataset.collapsed === 'true';
    sidebar.dataset.collapsed = (!collapsed).toString();
  });
}
